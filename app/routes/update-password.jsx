import { redirect } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useActionData, useNavigation, useRouteError } from "@remix-run/react";
import { useState } from "react";
import FormSpacer from "~/components/FormSpacer";
import { ErrorIllustration, EyeIcon, EyeslashIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { updatePassword } from "~/models/user.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";
import { badRequest, validatePassword } from "~/utils";

export async function action({ request }) {
    const session = await getSession(request);

    const formData = await request.formData();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    const fieldErrors = {
        password: validatePassword(password),
        confirmPassword: validatePassword(confirmPassword)
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

    if (password !== confirmPassword) {
        return badRequest({ formError: 'Passwords do not match' });
    }

    const { headers } = await updatePassword(request, password);

    setSuccessMessage(session, 'Password updated successfully!');

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

    return redirect('/login', { headers: allHeaders });

}

export default function UpdatePassword() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <main className="h-screen w-full flex flex-col justify-center -mt-20">
            <div className="w-full lg:max-w-md mx-auto border border-slate-200 p-6 rounded">
                <h1 className="font-heading text-2xl lg:text-3xl">Update password</h1>
                <Form method="post" className="mt-4">
                    <fieldset className="space-y-4">

                        <Password
                            htmlFor='password'
                            name='password'
                            label='Password'
                        />

                        <Password
                            htmlFor='confirm-password'
                            name='confirm-password'
                            label='Confirm Password'
                        />

                        <Button
                            type="submit"
                            className="bg-brand-orange focus-visible:ring-brand-purple"
                        >
                            {isSubmitting ? 'Updating...' : 'Update password'}
                        </Button>
                    </fieldset>

                </Form>
            </div>
        </main>
    );
}

function Password({ htmlFor, name, label }) {
    const actionData = useActionData();
    const [isShowingPassword, setIsShowingPassword] = useState(false);

    return (
        <FormSpacer>
            <Label htmlFor={htmlFor}>{label}</Label>
            <Input
                type={isShowingPassword ? 'text' : 'password'}
                name={name}
                id={htmlFor}
                className={`focus-visible:ring-brand-purple ${actionData?.fieldErrors?.password ? 'border border-red-500' : ''}`}
            />
            <span
                className="flex gap-1 cursor-pointer text-sm"
                onClick={() => setIsShowingPassword(!isShowingPassword)}>{isShowingPassword
                    ? (
                        <><EyeslashIcon />Hide password</>)
                    : (<><EyeIcon />Show password</>)
                }
            </span>
        </FormSpacer>
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