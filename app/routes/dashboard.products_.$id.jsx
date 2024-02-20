import { json, redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation, useParams } from "@remix-run/react";
import { useRef, useState } from "react";
import FormSpacer from "~/components/FormSpacer";
import { ArrowLeftIcon, TrashIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { getCategories, getCategoryId } from "~/models/category.server";
import { addImage, deleteImage } from "~/models/image.server";
import { deleteProduct, getProductById } from "~/models/product.server";
import { deleteCloudinaryImage, deleteCloudinaryImages, getCloudinaryPublicId, uploadImage } from "~/services/cloudinary.server";
import { getSession, sessionStorage, setSuccessMessage, setWarningMessage } from "~/session.server";
import { createClient } from "~/supabase.server";
import { badRequest, useDoubleCheck, validatePrice, validateQuantity, validateText } from "~/utils";

export async function loader({ request, params }) {
    const [res, product] = await Promise.all([
        getCategories(request),
        getProductById(request, Number(params.id))
    ]);
    const categories = res.data.map(category => category.title);


    const imageUrl = product.data.images[0]?.image_src;
    const uploadIndex = imageUrl?.indexOf('/upload');

    if ((uploadIndex !== -1) && product.data.images.length > 0) {
        // Replace image_src urls with optimized urls
        let images = product.data.images.map(image => {
            let newImageUrl;
            newImageUrl = image.image_src?.substring(0, uploadIndex + 7) + '/q_auto,f_auto,h_224,g_auto,ar_4:3,dpr_auto,c_auto' + image.image_src?.substring(uploadIndex + 7);
            return { image_src: newImageUrl, id: image.id };
        });
        product.data.images = images;
    }

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
            } else if (intent === 'cancel') {
                return { ok: true };
            }
            break;
        }
        case 'deleteImage': {
            const publicId = getCloudinaryPublicId(imageSrc);
            // Delete image from db
            const { data, error, headers } = await deleteImage(request, Number(imageId));

            // Delete image from cloudinary
            const deleted = await deleteCloudinaryImage(publicId);
            setSuccessMessage(session, 'Deleted successfully!');
            return redirect(`/dashboard/products/${id}`, {
                headers: {
                    "Set-Cookie": await sessionStorage.commitSession(session)
                }
            });
            break;
        }
        case 'addImage': {
            const image = formData.getAll('image');

            const imageResponse = await Promise.all(image.map(async (image) => {
                const { data, error, headers } = await addImage(request, image, id);
                return { data, error, headers };
            }));

            setSuccessMessage(session, 'Added successfully!');
            return redirect(`/dashboard/products/${id}`, {
                headers: {
                    "Set-Cookie": await sessionStorage.commitSession(session)
                }
            });
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
            } else if (intent === 'cancel') {
                return { ok: true };
            }
            break;
        }
        case 'variant': {
            console.log('Variant');
            if (intent === 'save') {

                // Separate current values in the db and new values

                let currentVariations = {};
                let newVariations = {};

                for (let [key, value] of formData.entries()) {
                    // if (key.startsWith('colour-') || key.startsWith('size-') || key.startsWith('newsize-') || key.startsWith('newcolour-')) {
                    //     variations[key] = value;
                    // }
                    if (key.startsWith('size-') || key.startsWith('colour-')) {
                        currentVariations[key] = value;
                    } else if (key.includes('new')) {
                        newVariations[key] = value;
                    }
                }

                // Validate all the input fields and return errors 

                let fieldErrors = {};

                for (let [key, value] of Object.entries(currentVariations)) {
                    fieldErrors[key] = validateText(value);
                }

                for (let [key, value] of Object.entries(newVariations)) {
                    fieldErrors[key] = validateText(value);
                }

                if (Object.values(fieldErrors).some(Boolean)) {
                    return badRequest({ fieldErrors });
                }

                let currentVariationItems = Object.entries(currentVariations).map(variation => {
                    let item = variation[0].split('-', 2);
                    return { title: item[0], value: variation[1], id: item[1] };
                });

                console.log({ currentVariationItems });

                // return json({ currentVariations });


                // Add changes to the db

                // Update the current items in the database
                const [res] = await Promise.all(
                    currentVariationItems.map(async (item) => {
                        const { status, error } = await supabaseClient
                            .from('Variations')
                            .update({ value: item.value })
                            .match({ 'id': item.id })
                        // .eq({ 'id': Number(item.id) })
                        // .select();
                        return { status, error };
                    })
                );

                console.log({ res });

                // const { data: variationItem, error: variationItemError } = await supabaseClient
                //     .from('Variations')
                //     .upsert(structuredItems, { onConflict: 'id' })
                //     .select();

                // if (variationItemError) {
                //     throw new Error(variationItemError);
                // }

                // console.log({ variationItem });
                if (res.status === 204) {
                    setSuccessMessage(session, 'Updated successfully!');
                }
            } else if (intent === 'cancel') {
                return { ok: true };
            }
            break;
        }
        case 'deleteProduct': {
            console.log('Delete product.');

            // TODO: Use Promise.all instead
            // await Promise.all([
            //     deleteProduct(request, id),

            // ])


            // Delete image(s) from cloudinary
            const product = await getProductById(request, id);
            const publicIds = await Promise.all(
                product.data.images.map((image) => {
                    const publicId = getCloudinaryPublicId(image.image_src);
                    return publicId;
                })
            );

            console.log({ publicIds });

            const deleted = await deleteCloudinaryImages(publicIds);

            console.log({ deleted });
            const deletedValues = Object.values(deleted.deleted);
            let isDeletedFromCloudinary = deletedValues.every(value => value === 'deleted');

            // if (isDeletedFromCloudinary) {
            //     setSuccessMessage(session, 'Deleted from cloudinary');
            // }

            // Delete image from db
            const { status, error, headers } = await deleteProduct(request, id);
            if (error) {
                throw new Error(error);
            }
            if (status === 204) {
                setSuccessMessage(session, 'Deleted successfully!');
            } else {
                setWarningMessage(session, 'Product not deleted!');
            }
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

    const params = useParams();
    const productId = Number(params.id);

    const actionData = useActionData();
    console.log({ actionData });

    // let variations;
    // if (actionData?.variations) {
    //     variations = Object.entries(actionData?.variations);
    // }

    // console.log({ variations });


    const navigation = useNavigation();
    const doubleCheckDelete = useDoubleCheck();

    const [images, setImages] = useState([]);
    const [size, setSize] = useState([]);
    const [colour, setColour] = useState([]);

    // console.log({ size });
    // console.log({ colour });

    const addImageRef = useRef(null);

    const isSubmitting = navigation.state !== 'idle';

    const sizes = product.data.variation.filter(variation => variation.title === 'size');
    // console.log({ sizes });
    const colours = product.data.variation.filter(variation => variation.title === 'colour');
    // console.log({ colours });

    function handleImageChange(event) {
        const files = event.target.files;
        let imagesArray = [];

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

    function handleSizeDelete(id) {
        // let newSize = [...size];
        // newSize.splice(newSize.indexOf(sizeInput), 1);
        // setSize(newSize);
        let newSize = size.filter(item => item.id !== id);
        setSize(newSize);
    }

    function handleColourDelete(id) {
        // let newSize = [...size];
        // newSize.splice(newSize.indexOf(sizeInput), 1);
        // setSize(newSize);
        let newColour = colour.filter(item => item.id !== id);
        setColour(newColour);
    }

    return (
        <div className="lg:max-w-4xl 2xl:max-w-6xl mt-8 md:mt-12">
            {/* TODO: Implement cancel functionality */}
            <Link to="/dashboard/products" className="flex gap-2 hover:text-brand-orange transition duration-300 ease-in-out">
                <ArrowLeftIcon /> Back to products
            </Link>
            <h1 className="font-semibold font-heading text-2xl lg:text-3xl mt-8">{product.data.product.title}</h1>
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
                                    defaultValue={product.data.product.title}
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
                                    defaultValue={product.data.product.description}
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
                                    defaultValue={product.data.product.Categories.title}
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
                                    defaultValue={product.data.product.quantity}
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
                                type="submit"
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
                                {(isSubmitting && navigation.formData?.get('_action') === 'product' && navigation.formData?.get('intent') === 'save') ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </fieldset>
            </Form>

            <div className="border border-slate-200 p-6 rounded mt-4" id="images">
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
                                accept='image/'
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
                                {/* FIXME: Do not delete the image immediately to reduce the content shift */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4  mt-2">
                                    {images.map((image, index) => (
                                        <div className="w-full h-40" key={index}>
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
                            type="button"
                            variant="outline"
                            name="intent"
                            value="cancel"
                            form="add-image"
                            onClick={() => {
                                setImages([]);
                                addImageRef.current.reset();
                            }}
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
                            {(isSubmitting && navigation.formAction === '/resources/upload' && navigation.formData?.get('intent') === 'save') ? 'Saving...' : 'Save'}
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
                                    defaultValue={product.data.product.price}
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
                                    defaultValue={product.data.product.compare_price}
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
                                    defaultValue={product.data.product.purchase_price}
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
                                {(isSubmitting && navigation.formData?.get('_action') === 'pricing' && navigation.formData?.get('intent') === 'save') ? 'Saving...' : 'Save'}
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
                            <div>
                                {/* Sizes in the database */}
                                {sizes.map((size, index) => (
                                    <FormSpacer key={size.id}>
                                        <Label htmlFor={size.id}>Size</Label>
                                        <Select
                                            name={`size-${size.id}`}
                                            id={size.id}
                                            defaultValue={size.value}
                                            className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.[`size-${size.id}`] ? 'border border-red-500' : ''}`}
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
                                        <input
                                            type="hidden"
                                            name="variationId"
                                            value={size.id}
                                        />
                                    </FormSpacer>
                                ))}

                                <div className="space-y-2 mt-2">
                                    {/* Added size inputs */}
                                    {size.length > 0
                                        ? (
                                            size.map((sizeInput) => (
                                                <div
                                                    className="relative max-w-fit"
                                                    key={sizeInput.id}
                                                >
                                                    <span
                                                        className="absolute top-1 right-1 text-red-500"
                                                        onClick={() => handleSizeDelete(sizeInput.id)}
                                                    >
                                                        <TrashIcon />
                                                    </span>
                                                    <FormSpacer>
                                                        <Label htmlFor={sizeInput.id}>Size</Label>
                                                        <Select
                                                            name={`newsize-${sizeInput.id}`}
                                                            id={sizeInput.id}
                                                            defaultValue={product.data.variation[0].value}
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
                                                </div>
                                            ))
                                        )
                                        : null
                                    }
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSize([...size, {
                                        id: crypto.randomUUID(),
                                        // name: `size-${size.length + 1}`
                                        name: `newsize-${crypto.randomUUID()}`
                                    }])}
                                    className="text-sm text-blue-500 mt-2"
                                >
                                    Add size
                                </button>
                            </div>
                            <div>
                                {/* Colours from the database */}
                                {colours.map((colour, index) => (
                                    <FormSpacer key={colour.id}>
                                        <Label htmlFor={colour.id}>Colour</Label>
                                        <Input
                                            type='text'
                                            name={`colour-${colour.id}`}
                                            id={colour.id}
                                            defaultValue={colour.value}
                                            className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.[`colour-${colour.id}`] ? 'border border-red-500' : ''}`}
                                        />
                                        {actionData?.fieldErrors?.[`colour-${colour.id}`]
                                            ? <p className="text-red-500 text-sm">{actionData.fieldErrors?.[`colour-${colour.id}`]}</p>
                                            : null
                                        }
                                    </FormSpacer>
                                ))}
                                <div className="space-y-2 mt-2">
                                    {colour.length > 0
                                        ? (
                                            colour.map((colourInput, index) => (
                                                <div
                                                    className="relative"
                                                    key={colourInput.id}
                                                >
                                                    <span
                                                        className="absolute top-1 right-1 text-red-500"
                                                        onClick={() => handleColourDelete(colourInput.id)}
                                                    >
                                                        <TrashIcon />
                                                    </span>
                                                    <FormSpacer>
                                                        <Label htmlFor={colourInput.id}>Colour</Label>
                                                        <Input
                                                            type='text'
                                                            name={`newcolour-${colourInput.id}`}
                                                            id={colourInput.id}
                                                            defaultValue={product.data.variation[1].value}
                                                            className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.[`colour-${colourInput.id}`] ? 'border border-red-500' : ''}`}
                                                        />
                                                        {/* FIXME: Highlight the correct input error field */}
                                                        {actionData?.fieldErrors?.[`colour-${colourInput.id}`]
                                                            ? <p className="text-red-500 text-sm">{actionData.fieldErrors?.[`colour-${colourInput.id}`]
                                                            }
                                                            </p>
                                                            : null
                                                        }
                                                    </FormSpacer>
                                                </div>
                                            ))
                                        )
                                        : null
                                    }
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setColour([...colour, {
                                        id: crypto.randomUUID(),
                                    }])}
                                    className="text-sm text-blue-500 mt-2"
                                >
                                    Add colour
                                </button>
                            </div>
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
                                {(isSubmitting && navigation.formData?.get('_action') === 'variant' && navigation.formData?.get('intent') === 'save') ? 'Saving...' : 'Save'}
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
                        ? isSubmitting && navigation.formData?.get('_action') === 'deleteProduct'
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
        <div className={`w-full h-48 lg:h-56 relative rounded ${isSubmitting ? 'opacity-50' : ''}`}>
            {/* TODO: Optimistic delete */}
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