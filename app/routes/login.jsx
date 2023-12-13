import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function Login() {
    return (
        <main className="h-screen w-full bg-[url('/ecommerce.jpg')] bg-cover bg-center bg-no-repeat bg-black bg-blend-overlay bg-opacity-50 pt-28">
            <div className="max-w-xs lg:max-w-sm mx-auto bg-gray-200 bg-opacity-60 rounded p-6">
                <h1 className="font-heading text-2xl lg:text-3xl">Login</h1>
                <Form method="post" className="mt-4">
                    <fieldset className="space-y-4">
                        <div>
                            <Label htmlFor="email">
                                Email
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="janedoe@email.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                            />
                        </div>
                        <Button type="submit" className="bg-brand-orange text-white">Log in</Button>
                    </fieldset>
                </Form>
            </div>
        </main>
    );
}