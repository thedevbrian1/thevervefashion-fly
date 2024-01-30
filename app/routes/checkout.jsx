import { Form } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export async function action({ request }) {

    return null;
}

export default function Checkout() {
    return (
        <main className="px-4 lg:max-w-md mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl mt-4 lg:mt-8">Checkout</h1>
            <Form method="post" className="mt-8">
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
        </main>
    );
}