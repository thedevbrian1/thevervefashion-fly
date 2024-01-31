import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getCartProducts } from "~/models/product.server";
import { getSession } from "~/session.server";
import { badRequest, sendEmail, trimValue, validateEmail, validatePhone, validateText } from "~/utils";

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


    // Validation
    const formData = await request.formData();
    const name = formData.get('name');
    // const mpesa = formData.get('mpesa');
    const contact = formData.get('contact');
    const email = formData.get('email');

    const fieldErrors = {
        name: validateText(name),
        // mpesa: validatePhone(trimValue(mpesa)),
        contact: validatePhone(trimValue(contact)),
        email: validateEmail(email)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

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
    // TODO: Update db by recording an order entry and decreasing the quantity of the item

    // TODO: Send email
    // const res = await sendEmail(name, email, contact, products);
    // if (res.status === 200) {
    //     return redirect('/success');
    // }
    return null;
}

export default function Checkout() {
    const { products } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

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
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    type='text'
                                    name='name'
                                    id='name'
                                    placeholder='John Doe'
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.name ? 'border border-red-500' : ''}`}

                                />
                                {actionData?.fieldErrors?.name
                                    ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.name}</p>
                                    : null
                                }
                            </div>
                            {/* <div>
                                <Label htmlFor="mpesa">Mpesa number</Label>
                                <Input
                                    type='text'
                                    name='mpesa'
                                    id='mpesa'
                                    placeholder='0712 345 678'
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.mpesa ? 'border border-red-500' : ''}`}

                                />
                                {actionData?.fieldErrors?.mpesa
                                    ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.mpesa}</p>
                                    : null
                                }
                            </div>
                            <p className="text-brand-orange bg-brand-orange bg-opacity-10 p-4 rounded">You will receive a prompt on your phone. Complete the transaction by entering your MPESA pin.</p> */}
                            <div>
                                <Label htmlFor='contact'>Contact number (We will contact you using this number)</Label>
                                <Input
                                    type='text'
                                    name='contact'
                                    id='contact'
                                    placeholder='0712 345 678'
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.contact ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.contact
                                    ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.contact}</p>
                                    : null
                                }
                            </div>
                            <div>
                                <Label htmlFor='email'>Email</Label>
                                <Input
                                    type='email'
                                    name='email'
                                    id='email'
                                    placeholder='johndoe@email.com'
                                    className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.email ? 'border border-red-500' : ''}`}
                                />
                                {actionData?.fieldErrors?.email
                                    ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.email}</p>
                                    : null
                                }
                            </div>
                            <Button type="submit" className="bg-brand-orange">
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </fieldset>
                    </Form>
                </div>
            </div>

        </main>
    );
}