import { json } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { ErrorIllustration } from "~/components/Icon";
import ProductCard from "~/components/ProductCard";
import { Button } from "~/components/ui/button";
import { getCategorizedProducts } from "~/models/product.server";
import { getSession, sessionStorage, setSuccessMessage, setWarningMessage } from "~/session.server";

export async function loader({ request, params }) {
    const category = params.slug;
    const { data, headers } = await getCategorizedProducts(request, category);

    const products = data.map(product => {
        let productItem = {
            title: product.data.product.title,
            price: product.data.product.price,
            comparePrice: product.data.product.compare_price,
            imageSrc: product.data.images[0]?.image_src,
            quantity: product.data.product.quantity,
            id: product.data.product.id
        };
        return productItem;
    });

    return json({ products, category }, {
        headers
    });
}

export async function action({ request }) {
    const session = await getSession(request);
    const formData = await request.formData();
    const action = formData.get('_action');
    const id = formData.get('id');

    switch (action) {
        case 'addToCart': {
            const cartItems = session.get('cartItems') ?? [];
            console.log({ cartItems });
            // Check if item is in cart
            const productIds = cartItems.map(item => item.id);

            const item = productIds.includes(Number(id));
            if (item) {
                setWarningMessage(session, "Item already in cart");
                break;
            }

            let cartItem = {
                id: Number(id),
                count: 1
            };

            cartItems.push(cartItem);
            session.set('cartItems', cartItems);
            setSuccessMessage(session, 'Added to cart!');
            break;
        }
    }
    return json({ ok: true }, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session)
        }
    });
}

export default function Category() {
    const { products, category } = useLoaderData();

    return (
        <main className="pt-20 px-6 lg:max-w-7xl mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl text-center capitalize">{category}</h1>
            {products.length === 0
                ? (
                    <div className="w-full h-full grid place-items-center mt-8">
                        <img
                            src="/clipboard.svg"
                            alt="An illustration of an empty clipboard"
                            className="w-20 h-20 lg:w-40 lg:h-40"
                        />
                        <p className="mt-4">No products yet</p>
                    </div>
                )
                : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                        {products.map((product) => (
                            <Link
                                to={`/products/${product.id}`}
                                key={product.id}
                                prefetch="intent"
                            >
                                <ProductCard imageSrc={product.imageSrc}>
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <h3 className="text-xl">{product.title}</h3>
                                            {/* <span>{product.rating}</span> */}
                                        </div>
                                        <p className="flex gap-4 items-center"><s className="text-gray-400 text-sm">Ksh {product.comparePrice}</s> <span>Ksh {product.price}</span></p>
                                        {
                                            product.quantity > 0
                                                ? (<Form method="post">
                                                    <input type="hidden" name="id" value={product.id} />
                                                    <Button
                                                        type="submit"
                                                        name="_action"
                                                        value="addToCart"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-brand-orange text-white"
                                                    >
                                                        Add to cart
                                                    </Button>
                                                </Form>)
                                                : <p className="bg-red-50 text-red-500 p-4 rounded max-w-fit">Out of stock</p>
                                        }

                                    </div>
                                </ProductCard>
                            </Link>
                        ))}

                    </div>
                )
            }

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