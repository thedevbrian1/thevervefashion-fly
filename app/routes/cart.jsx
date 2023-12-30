import { Form, Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { TrashIcon } from "lucide-react";
import { ErrorIllustration, ReceiptIllustration, XIcon } from "~/components/Icon";

export async function action({ request }) {
    return null;
}

export default function Cart() {
    return (
        <main className="mt-16 px-4 xl:max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-[60%]">
                    {/* Cart */}
                    <div className="flex justify-between items-center">
                        <h1 className="font-heading text-2xl lg:text-3xl">Cart</h1>
                        <Form method="post">
                            <button type="submit" className="text-red-600">Clear cart</button>
                        </Form>
                    </div>
                    <div className="flex flex-col gap-4 mt-5">
                        <CartItem />
                        <CartItem />
                        <CartItem />
                    </div>
                </div>
                <div className="border border-slate-200 rounded px-6 flex justify-between items-center gap-4 h-[168px] lg:mt-14">
                    {/* Summary */}
                    <div className="space-y-4">
                        <h2>Order summary</h2>
                        <p className="font-semibold">Total: Ksh 9999</p>
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
        </main>
    );
}

function CartItem() {
    return (
        <div className="border border-slate-200 rounded p-6 relative">
            <div className="w-4 h-4 text-red-500 absolute top-3 right-3">
                <XIcon />
                {/* <TrashIcon /> */}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src="/two-piece-set.jpg"
                        alt=""
                        className="w-14 lg:w-24 aspect-square rounded-full object-cover"
                    />
                    <p>Maxi dress</p>
                </div>
                <div className="flex gap-1 mt-1">
                    <button type="submit" name="_action" value="subtract" className="bg-gray-100 px-2 rounded">-</button>
                    <input type="text" name="quantity" className="w-10 px-2 border border-gray-100 rounded" defaultValue={1} readOnly />
                    <button type="submit" name="_action" value="add" className="bg-gray-100 px-2 rounded">+</button>
                </div>
                <p className="ml-4">Ksh 3999</p>
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