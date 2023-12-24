import { Form, Link, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createClient } from "~/supabase.server";
import FormSpacer from "~/components/FormSpacer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { badRequest, trimValue, validateEmail, validatePassword, validatePhone } from "../utils";
import { ErrorIllustration } from "~/components/Icon";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";

export async function action({ request }) {
    const session = await getSession(request);
    const formData = await request.formData();
    const phone = formData.get('phone');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    const trimmedPhone = trimValue(phone);

    const fieldErrors = {
        phone: validatePhone(trimmedPhone),
        email: validateEmail(email),
        password: validatePassword(password),
        confirmPassword: validatePassword(confirmPassword)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

    if (password !== confirmPassword) {
        return badRequest({ formError: 'Passwords do not match' });
    }

    const { supabaseClient, headers } = createClient(request);


    // Sign up
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        throw new Error(error);
    }

    // console.log({ data });

    // Check if email is used
    if (data && data.user.identities && data.user.identities.length === 0) {
        return badRequest({ fieldErrors: { email: 'Email address already in use. Try another email' } });
    }

    // Success toast
    setSuccessMessage(session, "Check your email to verify your account");

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };


    // TODO: Show success toast when user is signed in or redirect to dashboard

    return json({ ok: true }, {
        headers: allHeaders
    });
}

export default function Signup() {
    const actionData = useActionData();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === 'submitting';

    return (
        <main className="w-full min-h-screen bg-[url('/ecommerce.jpg')] bg-cover bg-center bg-no-repeat bg-black bg-blend-overlay bg-opacity-70 pt-20 md:pt-0 md:grid md:place-items-center">
            <div className="max-w-xs md:w-96 mx-auto bg-gray-200 bg-opacity-70 rounded p-6">
                <h1 className="font-heading text-2xl lg:text-3xl">Signup</h1>
                <Form method="post" className="mt-4">
                    <fieldset className="space-y-4">
                        <FormSpacer>
                            <Label htmlFor="phone">
                                Phone
                            </Label>
                            <Input
                                type="text"
                                name="phone"
                                id="phone"
                                placeholder="0712 345 678"
                                className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.phone ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.phone
                                ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.phone}</p>
                                : null
                            }

                        </FormSpacer>
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
                        <FormSpacer>
                            <Label htmlFor="password">
                                Confirm Password
                            </Label>
                            <Input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.confirmPassword ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.confirmPassword
                                ? <p className="text-red-500 transition ease-in-out duration-300">{actionData.fieldErrors.confirmPassword}</p>
                                : null
                            }
                        </FormSpacer>
                        <Button
                            type="submit"
                            className="bg-brand-orange text-white focus-visible:ring-brand-purple"
                        >
                            {isSubmitting ? 'Signing up...' : 'Sign up'}
                        </Button>
                    </fieldset>
                </Form>
                {actionData?.formError
                    ? <p className="text-red-500 mt-2">
                        {actionData.formError}
                    </p>
                    : null}
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