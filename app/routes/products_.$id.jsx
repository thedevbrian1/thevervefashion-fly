import { json } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { ErrorIllustration } from "~/components/Icon";
import Label from "~/components/Label";
// import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { getProductById } from "~/models/product.server";


export async function loader({ request, params }) {
    const id = Number(params.id);
    const { data: product, error, headers } = await getProductById(request, id);
    if (error) {
        throw new Error(error);
    }

    const imageUrl = product.images[0]?.image_src;
    const uploadIndex = imageUrl?.indexOf('/upload');

    if ((uploadIndex !== -1) && product.images.length > 0) {
        // Replace image_src urls with optimized urls
        let images = product.images.map(image => {
            let newImageUrl;
            newImageUrl = image.image_src.substring(0, uploadIndex + 7) + '/q_auto,f_auto,w_auto,g_auto,ar_4:3,dpr_auto,c_fill' + image.image_src.substring(uploadIndex + 7);
            return { image_src: newImageUrl, id: image.id };
        });
        product.images = images;
    }

    return json({ product }, {
        headers
    });
}

export async function action({ request }) {
    return null;
}

export default function Product() {
    const colours = ['Black', 'Red', 'Green'];
    const { product } = useLoaderData();

    return (
        <main className="mt-16 px-4 lg:px-0 lg:max-w-5xl mx-auto grid lg:grid-cols-2 gap-4 lg:gap-8">
            <div>
                {/* Images */}
                {/* TODO: Reduce size of images further */}
                {/* TODO: Use eager loading for images */}
                <img
                    src={product.images[0]?.image_src}
                    alt=""
                    loading="eager"
                    className="w-full h-full aspect-[4/3] object-cover"
                />
            </div>
            <div>
                {/* Description */}
                <h1 className="text-2xl lg:text-3xl">{product.product.title}</h1>
                <p className="text-brand-orange mt-2">Ksh {product.product.price}</p>
                <Form method="post" className="space-y-4 mt-6">
                    <fieldset>
                        <legend className="text-sm uppercase">
                            Size
                        </legend>
                        {/* TODO: Render the sizes available in the db */}
                        <div className="flex gap-4 mt-1">
                            <div className="flex gap-1">
                                <input type="radio" name="size" id="xs" value="xs" />
                                <Label htmlFor="xs">xs</Label>
                            </div>
                            <div className="flex gap-1">
                                <input type="radio" name="size" id="sm" value="sm" />
                                <Label htmlFor="sm">sm</Label>
                            </div>
                            <div className="flex gap-1">
                                <input type="radio" name="size" id="md" value="md" />
                                <Label htmlFor="md">md</Label>
                            </div>
                            <div className="flex gap-1">
                                <input type="radio" name="size" id="lg" value="lg" />
                                <Label htmlFor="lg">lg</Label>
                            </div>
                            <div className="flex gap-1">
                                <input type="radio" name="size" id="xl" value="xl" />
                                <Label htmlFor="xl">xl</Label>
                            </div>
                        </div>
                    </fieldset>
                    <div>
                        {/* TODO: You should not be able to order more products than the available quantity */}
                        <Label htmlFor="quantity">Quantity</Label>
                        <div className="flex gap-1 mt-1">
                            <button type="submit" name="_action" value="subtract" className="bg-gray-100 px-2 rounded">-</button>
                            <input type="text" name="quantity" className="w-10 px-2 border border-gray-100 rounded" defaultValue={1} readOnly />
                            <button type="submit" name="_action" value="add" className="bg-gray-100 px-2 rounded">+</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="colour">Colour</Label>
                        {/* TODO: Render the colours in the db */}
                        <Select>
                            <SelectTrigger className="w-[180px] mt-1">
                                <SelectValue placeholder="--Select colour--" />
                            </SelectTrigger>
                            <SelectContent>
                                {colours.map((colour, index) => (
                                    <SelectItem key={index} value={colour}>{colour}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                    {product.product.quantity > 0
                        ? <button type="submit" className="bg-brand-orange text-white px-8 py-2 rounded">
                            Add to cart
                        </button>
                        : <p className="bg-red-50 text-red-500 p-4 rounded max-w-fit">Out of stock</p>}

                </Form>
                <p className="uppercase text-sm mt-8">Description</p>
                <p className="mt-2">{product.product.description}</p>
            </div>
        </main>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        console.log({ error });
        return (
            <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <div className="w-60 lg:w-72">
                            <ErrorIllustration />
                        </div>
                        <h1 className="text-3xl font-semibold mt-4">{error.status} {error.statusText}</h1>
                        <p>{error.data}</p>
                    </div>
                    <Link to='.' className="underline text-brand-black">
                        Try again
                    </Link>
                </div>
            </div>
        );
    } else if (error instanceof Error) {
        console.log({ error });
        return (
            <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <div className="w-60 lg:w-72">
                            <ErrorIllustration />
                        </div>
                        <h1 className="text-3xl font-semibold mt-4">Error</h1>
                        <p>{error.message}</p>
                    </div>
                    <Link to="." className="underline text-brand-black">
                        Try again
                    </Link>
                </div>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}