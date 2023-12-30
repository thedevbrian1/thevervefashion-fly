import { json, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
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


export async function action({ request }) {
    const uploadHandler = unstable_composeUploadHandlers(
        async ({ name, data }) => {
            if (name !== "image") {
                return undefined;
            }
            const uploadedImage = await uploadImage(data);
            // console.log({ uploadedImage });
            return uploadedImage.secure_url;
        },
        unstable_createMemoryUploadHandler()
    );

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const image = formData.getAll('image');

    console.log({ image });

    // if (image.length > 1) {
    //     for (let current of image) {
    //         await addImageToDb(current);
    //     }
    // } else {
    //     await addImageToDb(image[0]);
    // }

    return json({ image });
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
        let imagesArray = [...images];

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
        <div className="mt-8 lg:mt-10">
            <Link to="/dashboard/products" className="flex gap-2 hover:text-brand-orange transition duration-300 ease-in-out">
                <ArrowLeftIcon /> Back to products
            </Link>
            <h1 className="font-heading mt-8 font-semibold">Add product</h1>
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
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='description'>Description</Label>
                            <Textarea
                                name='description'
                                id='description'
                                placeholder='Enter description here..'
                            />
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
                                accept='image/png, image/jpg, image/jpeg'
                                onChange={handleImageChange}
                                multiple
                            />
                        </FormSpacer>

                        <div>
                            {images.length > 0 && (
                                <div className="mt-2">
                                    <h3 className="text-gray-800">Selected images:</h3>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {images.map((image, index) => (
                                            <div className="w-32 h-32" key={index}>
                                                <img
                                                    src={image}
                                                    alt={`Uploaded ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {/* <label htmlFor="add-image" className="border border-dashed w-32 h-32 bg-gray-100 hover:bg-gray-200 grid place-items-center">
                                            <span className="text-gray-500 text-sm">+ Add image</span>
                                            <Input
                                                type='file'
                                                name='add-image'
                                                id='add-image'
                                                accept='image/png, image/jpg, image/jpeg'
                                                onChange={handleImageChange}
                                                multiple
                                                className="hidden"
                                            />
                                        </label> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        <p className="font-semibold">Pricing</p>
                        <FormSpacer>
                            <Label htmlFor='price'>Price</Label>
                            <Input
                                type='text'
                                name='price'
                                id='price'
                                placeholder='0'
                            />
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='compare'>Compare-at price</Label>
                            <Input
                                type='text'
                                name='compare-price'
                                id='compare'
                                placeholder='0'
                            />
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor='purchase-price'>Purchase price (price you bought the item)</Label>
                            <Input
                                type='text'
                                name='purchase-price'
                                id='purchase-price'
                                placeholder='0'
                            />
                        </FormSpacer>
                        {/* TODO: Add cost per item, profit & margin */}
                    </div>
                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        <p className="font-semibold">Variants</p>
                        <div>
                            <FormSpacer>
                                <Label htmlFor='size'>Size</Label>
                                <Select name="size" id="size">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select variant--" />
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
            <div className="mt-8">
                {actionData?.image.length > 0
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
            </div>
        </div>
    );
}