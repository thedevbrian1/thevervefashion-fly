import { redirect } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import { useState } from "react";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { SpamError } from "remix-utils/honeypot/server";
import FormSpacer from "~/components/FormSpacer";
import { ErrorIllustration, EyeIcon, EyeslashIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { honeypot } from "~/honeypot.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";
import { createClient } from "~/supabase.server";
import { badRequest, validateEmail, validatePassword } from "~/utils";

export async function action({ request }) {
    const [formData, session, { supabaseClient, headers }] = await Promise.all([request.formData(), getSession(request), createClient(request)]);

    try {
        honeypot.check(formData);
    } catch (error) {
        if (error instanceof SpamError) {
            throw new Response('Form not submitted properly', { status: 400 });
        }
        throw error;
    }

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
    const { data: { user }, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    // console.log({ user });

    if (error) {
        throw new Error(error);
    }
    // Success toast
    setSuccessMessage(session, "Logged in successfully!");

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

    if (user.email === process.env.ADMIN_EMAIL || user.email === process.env.ADMIN_EMAIL_2) {
        return redirect('/dashboard', { headers: allHeaders });
    }

    return redirect('/', { headers: allHeaders });
}

export default function Login() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const [isShowingPassword, setIsShowingPassword] = useState(false);

    return (
        <main className="min-h-screen w-full px-6 xl:px-0 bg-[url('/ecommerce.jpg')] bg-cover bg-center bg-no-repeat bg-black bg-blend-overlay bg-opacity-50 grid place-items-center">
            {/* FIXME: Fix form width */}
            <div className="w-full md:max-w-md mx-auto bg-gray-200 bg-opacity-70 rounded p-6">
                <h1 className="font-heading text-2xl lg:text-3xl">Login</h1>
                <Form method="post" className="mt-4 w-full">
                    <HoneypotInputs />
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
                                ? <p className="text-red-500 text-sm transition ease-in-out duration-300">{actionData.fieldErrors.email}</p>
                                : null
                            }
                        </FormSpacer>
                        <FormSpacer>
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                type={isShowingPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.password ? 'border border-red-500' : ''}`}
                            />
                            {actionData?.fieldErrors?.password
                                ? <p className="text-red-500 text-sm transition ease-in-out duration-300">{actionData.fieldErrors.password}</p>
                                : null
                            }
                            <span
                                className="flex gap-1 cursor-pointer text-sm"
                                onClick={() => setIsShowingPassword(!isShowingPassword)}>{isShowingPassword
                                    ? (
                                        <><EyeslashIcon />Hide password</>)
                                    : (<><EyeIcon />Show password</>)
                                }
                            </span>
                        </FormSpacer>
                        <Button type="submit" className="w-full bg-brand-orange text-white">
                            {isSubmitting ? 'Logging in...' : 'Log in'}
                        </Button>
                        {/* TODO: Add remember me */}
                    </fieldset>
                </Form>
                <div className="flex justify-between text-black/80 text-sm underline mt-4">
                    <Link to="/forgot-password" className="hover:text-blue-700">
                        Forgot password
                    </Link>
                    <Link to="/signup" className="hover:text-blue-700">
                        Don't have an account? Sign up instead
                    </Link>
                </div>
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