import { json } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useFetcher, useLoaderData, useNavigation, useRouteError } from "@remix-run/react";
import { ArrowLeftIcon, ErrorIllustration, ReceiptIllustration, TrashIcon, XIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { getCartProducts } from "~/models/product.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";
import { useDoubleCheck } from "~/utils";

export async function loader({ request }) {
    const session = await getSession(request);
    const { data, headers } = await getCartProducts(request);

    const cartItems = session.get('cartItems') ?? [];

    const productIds = cartItems.map(item => item.id);


    let matchedProducts = [];
    let matchedImages = [];
    if (cartItems.length > 0) {
        matchedProducts = data.product.filter((item) => productIds.includes(item.product_id));
        matchedImages = data.images.filter((item) => productIds.includes(item.product_id));
    }

    const products = matchedProducts.map(item => {
        let cartItem = {
            title: item.Products.title,
            price: item.price,
            productId: item.product_id,
            image: matchedImages.filter((image) => item.product_id === image.product_id),
            count: cartItems.find(cartItem => cartItem.id === item.product_id).count
        };
        return cartItem;
    })
    return json({ products }, {
        headers
    });
}

export async function action({ request }) {
    const session = await getSession(request);

    const formData = await request.formData();
    const productId = Number(formData.get('id'));
    let count = Number(formData.get('count'));
    const action = formData.get('_action');

    const cartItems = session.get('cartItems');

    const currentItem = cartItems.find(item => item.id === productId);

    const index = cartItems.indexOf(currentItem);

    switch (action) {
        case 'itemCount': {
            if (count == null) {
                throw new Response('Bad Request', { status: 400 });
            }
            if (count < 0) {
                count = 0;
            }
            currentItem.count = count;
            // // Remove the matched item from the array and replace with updated item
            cartItems.splice(index, 1, currentItem);
            return json({ ok: true }, {
                headers: {
                    "Set-Cookie": await sessionStorage.commitSession(session)
                }
            });
        }
        case 'deleteItem': {
            try {
                // throw new Error('Kaboom!!');
                cartItems.splice(index, 1);
                session.set('cartItems', cartItems);
                setSuccessMessage(session, "Removed successfully!");
                return json({ ok: true }, {
                    headers: {
                        'Set-Cookie': await sessionStorage.commitSession(session)
                    }
                });
            } catch (e) {
                return { error: true };
            }
        }
        case 'clearCart': {
            session.unset('cartItems');
            setSuccessMessage(session, 'Cart cleared successfully');
            return json({ ok: true }, {
                headers: {
                    'Set-Cookie': await sessionStorage.commitSession(session)
                }
            });
        }
    }

    return null;
}

export default function Cart() {
    const { products } = useLoaderData();
    const navigation = useNavigation();
    const doubleCheckDelete = useDoubleCheck();

    const subTotals = products.map(product => product.price * product.count);
    const total = subTotals.reduce((prev, current) => prev + current, 0);

    const isClearingCart = navigation.state === 'submitting' && navigation.formData.get('_action') === 'clearCart';

    return (
        <main className="mt-16 px-4 xl:max-w-4xl mx-auto">
            {products.length === 0
                ? (
                    <div className="w-full h-full grid place-items-center">
                        <div className="flex flex-col items-center">
                            <img src="/empty-cart.svg" alt="An illustration of an empty shopping cart" className="w-28 md:w-36" />
                            <p className="mt-8 text-center font-semibold">Cart is empty</p>
                            <div className="mt-4">
                                <Link
                                    to="/products"
                                    prefetch="intent"
                                    className="flex gap-2 bg-brand-orange hover:bg-orange-400 transition ease-in-out duration-300 text-white px-4 py-2 rounded"
                                >
                                    <ArrowLeftIcon /> Continue shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )
                : (
                    <div className={`flex flex-col lg:flex-row gap-4 ${isClearingCart ? 'opacity-50' : ''}`}>
                        <div className="lg:w-[60%]">
                            {/* Cart */}
                            <div className="flex justify-between items-center">
                                <h1 className="font-heading text-2xl lg:text-3xl">Cart</h1>
                                <Form method="post">
                                    <Button
                                        type='submit'
                                        variant='destructive'
                                        name='_action'
                                        value='clearCart'
                                        className='flex gap-1'
                                        {...doubleCheckDelete.getButtonProps()}
                                    >
                                        <TrashIcon />
                                        {doubleCheckDelete.doubleCheck ? 'Are you sure?' : 'Clear cart'}
                                    </Button>
                                </Form>
                            </div>

                            <div className="flex flex-col gap-4 mt-5">
                                {products.map(product => (
                                    <CartItem
                                        key={product.productId}
                                        title={product.title}
                                        price={product.price}
                                        image={product.image}
                                        id={product.productId}
                                        count={product.count}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="border border-slate-200 rounded px-6 flex justify-between items-center gap-4 h-[168px] lg:mt-14">
                            {/* Summary */}
                            <div className="space-y-4">
                                <h2>Order summary</h2>
                                <p className="font-semibold">Total: {total}</p>
                                <div>
                                    <Link to="/checkout" className="bg-brand-orange text-white px-4 py-2 rounded">
                                        Check out
                                    </Link>
                                </div>
                            </div>
                            <div className="w-24">
                                <ReceiptIllustration />
                            </div>
                        </div>
                    </div>
                )
            }

        </main>
    );
}

function CartItem({ title, price, image, id, count }) {
    const deleteFetcher = useFetcher();
    const quantityFetcher = useFetcher();

    let optimisticCount = Number(count);
    if (quantityFetcher.formData) {
        optimisticCount = Number(quantityFetcher.formData.get('count'));
    }

    let isDeleting = Number(deleteFetcher.formData?.get('id')) === id;
    let isFailedDeletion = deleteFetcher.data?.error;

    return (
        <div hidden={isDeleting} className={`border ${isFailedDeletion ? 'border-red-500' : 'border-slate-200'} rounded p-6 relative`}>
            <deleteFetcher.Form
                method="post"
                className="w-4 h-4 text-red-500 hover:text-red-700 transition ease-in-out duration-300 absolute top-3 right-8"
            >
                <input type="hidden" name="id" value={id} />
                <button
                    type="submit"
                    name="_action"
                    value="deleteItem"
                >
                    {isFailedDeletion ? 'Retry' : <XIcon />}
                </button>
                {/* <TrashIcon /> */}
            </deleteFetcher.Form >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src={image[0]?.image_src}
                        alt=""
                        className="w-14 lg:w-24 aspect-square rounded-full object-cover"
                    />
                    <p>{title}</p>
                </div>
                <quantityFetcher.Form method="post">
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="_action" value="itemCount" />
                    <div className="flex gap-1 mt-1">
                        <button type="submit" name="count" value={optimisticCount - 1} className="bg-gray-100 px-2 py-1 md:px-3 md:py-1 rounded">-</button>
                        <input type="text" className="w-10 px-2 border border-gray-100 rounded" value={optimisticCount} readOnly />
                        <button type="submit" name="count" value={optimisticCount + 1} className="bg-gray-100 px-2 py-1 md:px-3 md:py-1 rounded">+</button>
                    </div>
                </quantityFetcher.Form>
                <p className="ml-4">Ksh {price * optimisticCount}</p>
            </div>
        </div>
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