import { json, redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { uploadImage } from "~/services/cloudinary.server";
import FormSpacer from "~/components/FormSpacer";
import { ArrowLeftIcon } from "~/components/Icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { badRequest, validatePrice, validateText } from "~/utils";
import { addProduct } from "~/models/product.server";
import { addImage } from "~/models/image.server";
import { getCategories, getCategoryId } from "~/models/category.server";
import { addProductItem } from "~/models/productItem.server";
import { addVariation } from "~/models/variation.server";
import { addVariationOption } from "~/models/variationOption.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";

export function meta() {
    return [
        { title: 'Dashboard | The Verve Fashion' }
    ]
}

export async function loader({ request }) {
    // const { data: categories, error: categoryError, headers: categoryHeaders } = await getCategoryId(request, 'dress');
    // console.log({ categories });
    // console.log({ categoryHeaders });
    return null;
}

export async function action({ request }) {
    const session = await getSession(request);

    const uploadHandler = unstable_composeUploadHandlers(
        async ({ name, data }) => {
            if (name !== "image") {
                return undefined;
            }
            // TODO: Don't upload image if there is a validation error
            const uploadedImage = await uploadImage(data);
            // console.log({ uploadedImage });
            return uploadedImage.secure_url;
            // return null;
        },
        unstable_createMemoryUploadHandler()
    );

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);

    // const formData = await request.formData();

    const image = formData.getAll('image');
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const quantity = formData.get('quantity');
    const price = formData.get('price');
    const comparePrice = formData.get('compare-price');
    const purchasePrice = formData.get('purchase-price');
    const size = formData.get('size');
    const colour = formData.get('colour');

    const fieldErrors = {
        title: validateText(title),
        description: validateText(description),
        price: validatePrice(Number(price)),
        ...(comparePrice && { comparePrice: validatePrice(Number(comparePrice)) }),
        purchasePrice: validatePrice(Number(purchasePrice)),
        colour: validateText(colour)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

    // Steps to add item to the database
    // 1. Get category id
    // 2. Add product with category id
    // 3. Add image(s) with product id
    // 4. Add variant with product id
    // 5. Add variation option with variation id


    const { data: categories, error: categoryError, headers: categoryHeaders } = await getCategoryId(request, category);
    const categoryId = categories[0].id;

    const { data: product, error: productError, headers: productHeaders } = await addProduct(request, title, description, categoryId, price, comparePrice, purchasePrice, quantity);
    const productId = product[0].id;

    // const { data: productItem, error: productItemError, headers: productItemHeaders } = await addProductItem(request, productId, quantity, );

    const imageResponse = await Promise.all(image.map(async (image) => {
        const { data, error, headers } = await addImage(request, image, productId);
        return { data, error, headers };
    }));

    // console.log({ imageResponse });

    // let mergedImageHeaders = [];

    // imageResponse.forEach(image => {
    //     mergedImageHeaders = { ...mergedImageHeaders, ...image.headers };
    // });

    // console.log({ mergedImageHeaders });

    const { data: sizeVariant, error: sizeVariantError, headers: sizeVariantHeaders } = await addVariation(request, 'size', productId);
    const sizeVariantId = sizeVariant[0].id;

    const { data: sizeVariantValue, error: sizeVariantValueError, headers: sizeVariantValueHeaders } = await addVariationOption(request, size, sizeVariantId);

    const { data: colourVariant, error: colourVariantError, headers: colourVariantHeaders } = await addVariation(request, 'colour', productId);
    const colourVariantId = colourVariant[0].id;

    const { data: colourVariantValue, error: colourVariantValueError, headers: colourVariantValueHeaders } = await addVariationOption(request, colour, colourVariantId)

    setSuccessMessage(session, 'Product added successfully!');

    const allHeaders = {
        ...Object.fromEntries(categoryHeaders.entries()),
        ...Object.fromEntries(productHeaders.entries()),
        ...Object.fromEntries(sizeVariantHeaders.entries()),
        ...Object.fromEntries(sizeVariantValueHeaders.entries()),
        ...Object.fromEntries(colourVariantHeaders.entries()),
        ...Object.fromEntries(colourVariantValueHeaders.entries()),
        "Set-Cookie": await sessionStorage.commitSession(session)
    }


    return redirect(`/dashboard/products/${productId}`, {
        headers: allHeaders
    });
}

export default function NewProduct() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const [images, setImages] = useState([]);
    const [showVariants, setShowVariants] = useState(false);
    console.log({ images });


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
        <div className="mt-8 lg:mt-12">
            <Link to="/dashboard/products" className="flex gap-2 hover:text-brand-orange transition duration-300 ease-in-out">
                <ArrowLeftIcon /> Back to products
            </Link>
            <h1 className="font-heading mt-8 font-semibold text-2xl lg:text-3xl">Add product</h1>
            <Form method="post" encType="multipart/form-data" className="max-w-sm xl:max-w-xl mt-8">
                <fieldset className="space-y-4">
                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        {/* Title & description */}
                        <FormSpacer>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                type='text'
                                name='title'
                                id='title'
                                placeholder='Maxi dress'
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
                                placeholder='Enter description here..'
                            />
                            {actionData?.fieldErrors?.description
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.description}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='category'>Category</Label>
                            <Select name="category" id="category">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="--Select category--" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dress">Dresses</SelectItem>
                                    <SelectItem value="loungewear">Loungewear</SelectItem>
                                    <SelectItem value="corset-top">Corset tops</SelectItem>
                                    <SelectItem value="two-piece-set">Two piece set</SelectItem>
                                    <SelectItem value="basic">Basics</SelectItem>
                                    <SelectItem value="accessory">Accessories</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                type='number'
                                name='quantity'
                                id='quantity'
                            />
                            {actionData?.fieldErrors?.quantity
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.quantity}</p>
                                : null
                            }
                        </FormSpacer>
                    </div>

                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        {/* Images */}
                        <FormSpacer>
                            <Label htmlFor='image' className="font-semibold">Images</Label>
                            <Input
                                type='file'
                                name='image'
                                id='image'
                                accept='image/'
                                onChange={handleImageChange}
                                multiple
                                // required
                                className="file:py-2 file:px-4 file:rounded-full file:bg-orange-50 file:text-brand-orange hover:file:bg-orange-100"
                            />
                        </FormSpacer>

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
                    </div>

                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        <p className="font-semibold">Pricing (Kshs)</p>
                        <FormSpacer>
                            <Label htmlFor='price'>Price</Label>
                            <Input
                                type='number'
                                name='price'
                                id='price'
                                placeholder='0'
                                min="1"
                            />
                            {actionData?.fieldErrors?.price
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.price}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='compare-price'>Compare-at price</Label>
                            <Input
                                type='number'
                                name='compare-price'
                                id='compare-price'
                                placeholder='0'
                                min="1"
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
                                placeholder='0'
                                min="1"
                            />
                            {actionData?.fieldErrors?.purchasePrice
                                ? <p className="text-red-500 text-sm">{actionData.fieldErrors.purchasePrice}</p>
                                : null
                            }
                        </FormSpacer>
                        {/* TODO: Add cost per item, profit & margin */}
                    </div>
                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        <p className="font-semibold">Variants</p>
                        <div className="space-y-4">
                            <FormSpacer>
                                <Label htmlFor='size'>Size</Label>
                                <Select name="size" id="size">
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
                                    placeholder='Black'
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

                    </div>
                    <div className="flex gap-2 justify-end">
                        <button className="border border-slate-200 px-4 py-2 rounded">Cancel</button>
                        <button
                            type="submit"
                            className="bg-brand-orange text-white px-8 py-2 rounded"
                        >
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </fieldset>
            </Form>
            {actionData?.fieldErrors?.imageSrc
                ? (<span className="text-red-500">{actionData?.fieldErrors.imageSrc}</span>)
                : null
            }
            {/* <div className="mt-8">
                {actionData?.image?.length > 0
                    ? (
                        <div>
                            <h3 className="text-gray-800">Uploaded images:</h3>
                            <div className="flex gap-2 flex-wrap max-w-xl mt-2">
                                {actionData?.image.map((image, index) => (
                                    <div className="w-20 h-20" key={index}>
                                        <img
                                            src={image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>)
                    : null
                }
            </div> */}
        </div>
    );
}