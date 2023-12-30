import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import FormSpacer from "~/components/FormSpacer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";
import { createClient } from "~/supabase.server";
import { badRequest, validateEmail, validatePassword } from "~/utils";

export async function action({ request }) {
    const [formData, session, { supabaseClient, headers }] = await Promise.all([request.formData(), getSession(request), createClient(request)]);
    const email = formData.get('email');
    const password = formData.get('password');

    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

    // Log in
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    // console.log({ data });

    if (error) {
        throw new Error(error);
    }
    // Success toast
    setSuccessMessage(session, "Logged in successfully!");

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

    return redirect('/dashboard', { headers: allHeaders });
}

export default function Login() {
    const actionData = useActionData();

    return (
        <main className="min-h-screen w-full bg-[url('/ecommerce.jpg')] bg-cover bg-center bg-no-repeat bg-black bg-blend-overlay bg-opacity-50 grid place-items-center">
            {/* FIXME: Fix form width */}
            <div className="max-w-xs lg:w-96 mx-auto bg-gray-200 bg-opacity-70 rounded p-6">
                <h1 className="font-heading text-2xl lg:text-3xl">Login</h1>
                <Form method="post" className="mt-4 w-full">
                    <fieldset className="space-y-4">
                        <FormSpacer>
                            <Label htmlFor="email">
                                Email
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="janedoe@email.com"
                                className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.email ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.email
                                ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.email}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.password ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.password
                                ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.password}</p>
                                : null
                            }
                        </FormSpacer>
                        <Button type="submit" className="bg-brand-orange text-white">Log in</Button>
                    </fieldset>
                </Form>
            </div>
        </main>
    );
}