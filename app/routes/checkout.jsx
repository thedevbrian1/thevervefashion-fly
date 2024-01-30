import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getCartProducts } from "~/models/product.server";
import { getSession } from "~/session.server";

export async function loader({ request }) {
    const session = await getSession(request);
    const { data, headers } = await getCartProducts(request);

    const cartItems = session.get('cartItems');

    const products = data.product.map(product => {
        let imageSrc = data.images.find(image => image.product_id === product.product_id);
        let details = {
            title: product.Products.title,
            price: product.price,
            imageSrc: imageSrc?.image_src,
            count: cartItems.find(cartItem => cartItem.id === product.product_id).count
        };
        return details;
    });

    return json({ products }, {
        headers
    });
}
export async function action({ request }) {

    return null;
}

export default function Checkout() {
    const { products } = useLoaderData();
    console.log({ products });

    const subTotals = products.map(product => product.price * product.count);
    const total = subTotals.reduce((prev, current) => prev + current, 0);

    return (
        <main className="px-4 lg:max-w-4xl mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl mt-4 lg:mt-16">Checkout</h1>
            <div className="grid lg:grid-cols-2 gap-4 mt-8">
                <div className="border border-slate-200 rounded p-6 self-start">
                    <h2 className="font-semibold">Products ordered</h2>
                    <ol className="grid divide-y mt-2">
                        {products.map(product => (
                            <li className="flex gap-2 items-center py-3">
                                <img src={product.imageSrc} alt="" className="w-16 h-16 rounded-full object-cover" />
                                <span>{product.title} ({product.count})<br /> <span className="font-semibold">Ksh {product.price * product.count}</span></span>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-4 font-semibold">Total: Ksh {total}</p>
                </div>
                <div className="border border-slate-200 rounded p-6 self-start">
                    <h2 className="font-semibold">Contact info</h2>
                    <Form method="post" className="mt-4">
                        <fieldset className="space-y-4">
                            <div>
                                <Label htmlFor="mpesa">Mpesa number</Label>
                                <Input
                                    type='text'
                                    name='mpesa'
                                    id='mpesa'
                                    placeholder='0712 345 678'
                                />
                            </div>
                            <p className="text-brand-orange bg-brand-orange bg-opacity-10 p-4 rounded">You will receive a prompt on your phone. Complete the transaction by entering your MPESA pin.</p>
                            <div>
                                <Label htmlFor='phone'>Contact number (We will contact you using this number)</Label>
                                <Input
                                    type='text'
                                    name='phone'
                                    id='phone'
                                    placeholder='0712 345 678'
                                />
                            </div>
                            <div>
                                <Label htmlFor='email'>Email</Label>
                                <Input
                                    type='email'
                                    name='email'
                                    id='email'
                                    placeholder='johndoe@email.com'
                                />
                            </div>
                            <button type="submit" className="bg-brand-orange text-white px-8 py-2 rounded">
                                Submit
                            </button>
                        </fieldset>
                    </Form>
                </div>
            </div>

        </main>
    );
}