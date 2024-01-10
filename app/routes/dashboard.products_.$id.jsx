import { json, redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation, useParams } from "@remix-run/react";
import { useRef, useState } from "react";
// import { TrashIcon } from "lucide-react";
import FormSpacer from "~/components/FormSpacer";
import { PlusIcon, TrashIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { getCategories, getCategoryId } from "~/models/category.server";
import { addImage, deletemage } from "~/models/image.server";
import { deleteProduct, getProductById } from "~/models/product.server";
import { deleteCloudinaryImage, getCloudinaryPublicId, uploadImage } from "~/services/cloudinary.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";
import { createClient } from "~/supabase.server";
import { badRequest, useDoubleCheck, validatePrice, validateQuantity, validateText } from "~/utils";

export async function loader({ request, params }) {
    const res = await getCategories(request);
    const product = await getProductById(request, Number(params.id));
    const categories = res.data.map(category => category.title);
    // console.log({ res });
    return { product, categories };
}

export async function action({ request, params }) {
    const id = Number(params.id);

    // const uploadHandler = unstable_composeUploadHandlers(
    //     async ({ name, data }) => {
    //         if (name !== "image") {
    //             return undefined;
    //         }
    //         // TODO: Don't upload image if there is a validation error
    //         const uploadedImage = await uploadImage(data);
    //         // console.log({ uploadedImage });
    //         return uploadedImage.secure_url;
    //         // return null;
    //     },
    //     unstable_createMemoryUploadHandler()
    // );

    // const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const session = await getSession(request);

    const formData = await request.formData();
    const action = formData.get('_action');
    const intent = formData.get('intent');
    const imageId = formData.get('imageId');
    const imageSrc = formData.get('imageSrc');

    const { supabaseClient, headers } = createClient(request);

    switch (action) {
        case 'product': {
            console.log('product');

            if (intent === 'save') {
                const title = formData.get('title');
                const description = formData.get('description');
                const category = formData.get('category');
                const quantity = formData.get('quantity');

                const fieldErrors = {
                    title: validateText(title),
                    description: validateText(description),
                    quantity: validateQuantity(quantity)
                };

                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }

                const { data: categories, error: categoryError, headers: categoryHeaders } = await getCategoryId(request, category);
                const categoryId = categories[0].id;

                const [
                    { data: product, error: productError },
                    { data: productItem, error: productItemError }
                ] = await Promise.all([
                    supabaseClient
                        .from('Products')
                        .update({ title, description, category_id: categoryId })
                        .eq('id', id)
                        .select(),
                    supabaseClient
                        .from('Product_item')
                        .update({ quantity: Number(quantity) })
                        .eq('product_id', id)
                        .select()
                ]);

                setSuccessMessage(session, "Updated successfully!");
            }
            break;
        }
        case 'deleteImage': {
            const publicId = getCloudinaryPublicId(imageSrc);
            // Delete image from db
            const { data, error, headers } = await deletemage(request, Number(imageId));

            // Delete image from cloudinary
            const deleted = await deleteCloudinaryImage(publicId);
            setSuccessMessage(session, 'Deleted successfully!');
            break;
        }
        case 'addImage': {
            const image = formData.getAll('image');

            const imageResponse = await Promise.all(image.map(async (image) => {
                const { data, error, headers } = await addImage(request, image, id);
                return { data, error, headers };
            }));

            setSuccessMessage(session, 'Added successfully!');
            break;
        }
        case 'pricing': {
            console.log('Pricing');
            if (intent === 'save') {
                const price = formData.get('price');
                const comparePrice = formData.get('compare-price');
                const purchasePrice = formData.get('purchase-price');

                const fieldErrors = {
                    price: validatePrice(Number(price)),
                    comparePrice: validatePrice(Number(comparePrice)),
                    purchasePrice: validatePrice(Number(purchasePrice))
                };

                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }

                const { data, error } = await supabaseClient
                    .from('Product_item')
                    .update({ price: Number(price), compare_price: Number(comparePrice), purchase_price: Number(purchasePrice) })
                    .eq('product_id', id)
                    .select();
                setSuccessMessage(session, 'Updated successfully!');
            }
            break;
        }
        case 'variant': {
            console.log('Variant');
            if (intent === 'save') {
                const size = formData.get('size');
                const colour = formData.get('colour');

                const fieldErrors = {
                    colour: validateText(colour)
                };

                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }

                const { data: variation, error: variationError } = await supabaseClient
                    .from('Variations')
                    .select('id')
                    .eq('product_id', id);

                const values = [size, colour];

                const optionValues = await Promise.all(variation.map(async (option, index) => {
                    const { data: variationOption, error: optionError } = await supabaseClient
                        .from('Variation_options')
                        .update({ value: values[index] })
                        .eq('variation_id', option.id)
                        .select();
                    return { variationOption, optionError };
                }));

                setSuccessMessage(session, 'Updated successfully!');
            }
            break;
        }
        case 'deleteProduct': {
            console.log('Delete product.');
            const { error, headers } = await deleteProduct(request, id);
            if (error) {
                throw new Error(error);
            }
            setSuccessMessage(session, 'Deleted successfully!');
            return redirect('/dashboard/products', {
                headers: {
                    ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session)
                }
            });
        }
    }

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

    return json({ ok: true }, {
        headers: allHeaders
    });
}

export default function Product() {
    const { product, categories } = useLoaderData();
    console.log({ product });
    console.log(product.data.variation.variationValues[0][0].value);

    const params = useParams();
    const productId = Number(params.id);

    const actionData = useActionData();
    const navigation = useNavigation();
    const doubleCheckDelete = useDoubleCheck();
    const [images, setImages] = useState([]);
    const addImageRef = useRef(null);

    const isSubmitting = navigation.state !== 'idle';

    function handleImageChange(event) {
        const files = event.target.files;
        let imagesArray = [];

        console.log({ files });

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = () => {
                imagesArray.push(reader.result);
                if (imagesArray.length === files.length) {
                    setImages([...imagesArray]);
                }
            };
            reader.readAsDataURL(files[i]);
        }
    }
    return (
        <div className="lg:max-w-4xl 2xl:max-w-6xl mt-8 md:mt-12">
            {/* TODO: Implement cancel functionality */}
            <h1 className="font-semibold font-heading text-2xl lg:text-3xl">{product.data.Products.title}</h1>
            <h2 className="order-2 md:order-1 font-medium text-lg text-gray-600 mt-4">Edit product</h2>
            <Form method="post" className="mt-4 border border-slate-200 p-6 rounded">
                <fieldset>
                    <legend className="font-semibold">Product info</legend>
                    <div className="mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormSpacer>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    type='text'
                                    name='title'
                                    id='title'
                                    defaultValue={product.data.Products.title}
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.title ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.title
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.title}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='description'>Description</Label>
                                <Textarea
                                    name='description'
                                    id='description'
                                    defaultValue={product.data.Products.description}
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.description ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.description
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.description}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='category'>Category</Label>
                                <Select
                                    name="category"
                                    id="category"
                                    defaultValue={product.data.Products.Categories.title}
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.category ? 'border border-red-500' : ''}`}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select category--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category, index) => (
                                            <SelectItem key={index} value={category} className="capitalize">{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    type='number'
                                    name='quantity'
                                    id='quantity'
                                    defaultValue={product.data.quantity}
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.quantity ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.quantity
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.quantity}</p>
                                    : null
                                }
                            </FormSpacer>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <input type="hidden" name="_action" value="product" />
                            <Button
                                variant="outline"
                                name="intent"
                                value="cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-orange"
                                name="intent"
                                value="save"
                            >
                                {(isSubmitting && navigation.formData.get('_action') === 'product' && navigation.formData.get('intent') === 'save') ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </fieldset>
            </Form>

            <div className="border border-slate-200 p-6 rounded mt-4">
                <p className="font-semibold">Images</p>
                {
                    product.data.images.length === 0
                        ? (
                            <div>
                                <p className="mt-2 text-gray-500 italic">No images</p>
                            </div>
                        )
                        : (
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                                {product.data.images.map((image, index) => (
                                    <DeletableImage
                                        key={index}
                                        imageSrc={image.image_src}
                                        id={image.id}
                                    />
                                ))}
                            </div>
                        )
                }
                <div>
                    {/* TODO: Clear image input after submission */}
                    <Form
                        method="post"
                        action="/resources/upload"
                        preventScrollReset
                        id="add-image"
                        encType="multipart/form-data"
                        ref={addImageRef}
                        className="mt-2"
                        onSubmit={() => {
                            setImages([]);
                            // console.log(event.target);
                            // addImageRef.current.reset();
                        }}
                    >
                        <FormSpacer>
                            <Label htmlFor='image' className="font-semibold">Add image(s)</Label>
                            <Input
                                type='file'
                                name='image'
                                id='image'
                                accept='image/png, image/jpg, image/jpeg'
                                onChange={handleImageChange}
                                multiple
                                required
                                className="file:py-2 file:px-4 file:rounded-full file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100"
                            />
                            {/* <input type="hidden" name="_action" value="addImage" /> */}
                            <input type="hidden" name="productId" value={productId} />
                            <input type="hidden" name="redirectTo" value={`/dashboard/products/${productId}`} />
                        </FormSpacer>
                    </Form>
                    <div>
                        {images.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-gray-800">Selected images:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4  mt-2">
                                    {images.map((image, index) => (
                                        <div className="w-full h-full" key={index}>
                                            <img
                                                src={image}
                                                alt={`Uploaded ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            name="intent"
                            value="cancel"
                            form="add-image"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-brand-orange"
                            name="intent"
                            value="save"
                            form="add-image"
                        >
                            {(isSubmitting && navigation.formAction === '/resources/upload' && navigation.formData.get('intent') === 'save') ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>

            </div>

            <Form method="post" className="mt-4 border border-slate-200 p-6 rounded">
                <fieldset>
                    <legend className="font-semibold">Pricing (Kshs)</legend>
                    <div className="mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormSpacer>
                                <Label htmlFor='price'>Price</Label>
                                <Input
                                    type='number'
                                    name='price'
                                    id='price'
                                    defaultValue={product.data.price}
                                    min="1"
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.price ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.price
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.price}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='compare'>Compare-at price</Label>
                                <Input
                                    type='number'
                                    name='compare-price'
                                    id='compare'
                                    defaultValue={product.data.compare_price}
                                    min="1"
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.comparePrice ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.comparePrice
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.comparePrice}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='purchase-price'>Purchase price (price you bought the item)</Label>
                                <Input
                                    type='number'
                                    name='purchase-price'
                                    id='purchase-price'
                                    defaultValue={product.data.purchase_price}
                                    min="1"
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.purchasePrice ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.purchasePrice
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.purchasePrice}</p>
                                    : null
                                }
                            </FormSpacer>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <input type="hidden" name="_action" value="pricing" />
                            <Button
                                variant="outline"
                                name="intent"
                                value="cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-orange"
                                name="intent"
                                value="save"
                            >
                                {(isSubmitting && navigation.formData.get('_action') === 'pricing' && navigation.formData.get('intent') === 'save') ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                        {/* TODO: Add cost per item, profit & margin */}
                    </div>
                </fieldset>

            </Form>

            <Form method="post" className="mt-4 border border-slate-200 rounded p-6">
                <fieldset>
                    <legend className="font-semibold">Variants</legend>
                    {/* TODO: Add variants */}
                    <div className="mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormSpacer>
                                <Label htmlFor='size'>Size</Label>
                                <Select
                                    name="size"
                                    id="size"
                                    defaultValue={product.data.variation.variationValues[0][0].value}
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.size ? 'border border-red-500' : ''}`}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select size--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="xs">XS</SelectItem>
                                        <SelectItem value="sm">SM</SelectItem>
                                        <SelectItem value="md">MD</SelectItem>
                                        <SelectItem value="lg">LG</SelectItem>
                                        <SelectItem value="xl">XL</SelectItem>
                                        <SelectItem value="xxl">XXL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="colour">Colour</Label>
                                <Input
                                    type='text'
                                    name='colour'
                                    id='colour'
                                    defaultValue={product.data.variation.variationValues[1][0].value}
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.colour ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.colour
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.colour}</p>
                                    : null
                                }
                            </FormSpacer>
                            {/* <button
                                type="button"
                                onClick={() => setAddSize(true)}
                                className="text-sm text-blue-500"
                            >
                                Add size
                            </button> */}
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <input type="hidden" name="_action" value="variant" />
                            <Button
                                variant="outline"
                                name="intent"
                                value="cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-orange"
                                name="intent"
                                value="save"
                            >
                                {(isSubmitting && navigation.formData.get('_action') === 'variant' && navigation.formData.get('intent') === 'save') ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </fieldset>
            </Form>

            <Form method="post" className="mt-4 flex justify-end">
                <Button
                    type="submit"
                    variant="destructive"
                    name="_action"
                    value="deleteProduct"
                    {...doubleCheckDelete.getButtonProps()}
                >
                    {doubleCheckDelete.doubleCheck
                        ? isSubmitting && navigation.formData.get('_action') === 'deleteProduct'
                            ? 'Deleting...'
                            : 'Are you sure?'
                        : 'Delete product'
                    }
                    {/* {(isSubmitting && navigation.formData.get('_action') === 'deleteProduct')
                        ? 'Deleting...'
                        : doubleCheckDelete.doubleCheck
                            ? 'Are you sure?'
                            : 'Delete product'

                    } */}
                </Button>
            </Form>
        </div>
    );
}

function DeletableImage({ imageSrc, id }) {
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state !== 'idle';

    return (
        <div className={`w-full h-full relative rounded ${isSubmitting ? 'opacity-50' : ''}`}>
            <img src={imageSrc} alt="" className="w-full h-full object-cover" />
            <fetcher.Form method="post" className="absolute right-2 top-2 text-red-500 hover:text-red-700 transition ease-in-out duration-300">
                <input type="hidden" name="imageId" value={id} />
                <input type="hidden" name="imageSrc" value={imageSrc} />
                <button type="submit" name="_action" value="deleteImage">
                    <TrashIcon />
                </button>
            </fetcher.Form>
            {/* <TrashIcon className="absolute right-2 top-2 text-red-500" /> */}
        </div>
    );
}