import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import FormSpacer from "~/components/FormSpacer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { sendResetLink } from "~/models/user.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";
import { badRequest, validateEmail } from "~/utils";

export async function action({ request }) {
    const session = await getSession(request);

    const formData = await request.formData();
    const email = formData.get('email');

    const fieldErrors = {
        email: validateEmail(email)
    };

    // Return errors if any
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors });
    }

    const { headers } = await sendResetLink(request, email);

    setSuccessMessage(session, 'Check your email. A reset link has been sent to your email!');

    const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

    return json({ ok: true }, { headers: allHeaders });

}

export default function ForgotPassword() {
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <main className="h-screen w-full flex flex-col justify-center -mt-20">
            <div className="w-full lg:max-w-md mx-auto border border-slate-200 p-6 rounded">
                <h1 className="font-heading text-2xl lg:text-3xl">Send password reset link</h1>
                <Form method="post" className="mt-4">
                    <FormSpacer>
                        <Label htmlFor="email">
                            Enter your login email
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
                    <p className="text-orange-500 bg-orange-100 border-l-2 border-l-orange-500 mt-4 p-4 text-sm font-bold">A link to reset your password will be sent to the email provided</p>
                    <Button
                        type="submit"
                        className="bg-brand-orange mt-4 focus-visible:ring-brand-purple"
                    >
                        {isSubmitting ? 'Sending...' : 'Send reset link'}
                    </Button>
                </Form>
            </div>
        </main>
    );
}