import { Form } from "@remix-run/react";
import FormSpacer from "~/components/FormSpacer";
import { EnvelopeIcon, PhoneIcon } from "~/components/Icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export default function Contact() {
    return (
        <main className="-mt-36">
            <div className="w-full h-[60vh] lg:h-[75vh] landscape:h-screen bg-[url('/contact.jpg')] bg-cover bg-center bg-no-repeat">
                <div className="w-full h-full bg-gradient-to-b from-white to-50% lg:to-40% bg-opacity-40 grid place-items-center">
                    <div className="text-gray-200 text-center">
                        <h1 className="font-heading text-2xl lg:text-3xl font-semibold">Contact us</h1>
                        <p className="mt-2">We'd like to hear from you</p>
                    </div>
                </div>
            </div>
            <div className="px-4 md:px-0 md:max-w-xl xl:max-w-3xl mx-auto mt-16 lg:mt-24 space-y-8">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded p-6">
                        <div className="border border-slate-200 rounded p-3 max-w-fit">
                            <PhoneIcon />
                        </div>
                        <div className="mt-6 space-y-1">
                            <h2 className="font-semibold">Call us</h2>
                            <p className="text-gray-500">Mon-Fri 8:00 a.m - 5:00 p.m</p>
                            <p>0712 345 678</p>
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded p-6">
                        <div className="border border-slate-200 rounded p-3 max-w-fit">
                            <EnvelopeIcon />
                        </div>
                        <div className="mt-6 space-y-1">
                            <h2 className="font-semibold">Email us</h2>
                            <p className="text-gray-500">Speak to our friendly team</p>
                            <p>info@thevervefashion.com</p>
                        </div>
                    </div>
                </div>
                <p className="text-center">or</p>
                <div>
                    <h2 className="text-center font-semibold">Send us a message</h2>
                    <Form method="post" className="mt-4 max-w-xs lg:max-w-sm mx-auto">
                        <fieldset className="space-y-4">
                            <FormSpacer>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    type='text'
                                    name='name'
                                    id='name'
                                    placeholder='Jane Doe'
                                />
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    type='text'
                                    name='phone'
                                    id='phone'
                                    placeholder='0712 345 678'
                                />
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type='email'
                                    name='email'
                                    id='email'
                                    placeholder='janedoe@email.com'
                                />
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    name='message'
                                    id='message'
                                    placeholder='Enter message here..'
                                />
                            </FormSpacer>
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