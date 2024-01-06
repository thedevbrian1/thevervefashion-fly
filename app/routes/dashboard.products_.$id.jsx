import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import FormSpacer from "~/components/FormSpacer";
import { PlusIcon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { getCategories } from "~/models/category.server";
import { getProductById } from "~/models/product.server";

export async function loader({ request, params }) {
    const res = await getCategories(request);
    const product = await getProductById(request, 13);
    const categories = res.data.map(category => category.title);
    // console.log({ res });
    return { product, categories };
}
export default function Product() {
    const { product, categories } = useLoaderData();
    console.log({ product });
    console.log(product.data.variation.variationValues[0][0].value);

    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';
    return (
        <div className="lg:max-w-4xl 2xl:max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="order-2 md:order-1 font-semibold text-xl">Edit product</h1>
                <Link to="/dashboard/products/new" className="bg-brand-orange text-white px-4 py-2 rounded flex gap-2 order-1 md:order-2 max-w-fit"><PlusIcon /> Add another product</Link>
            </div>
            <Form method="post" className="mt-4">
                <fieldset className="space-y-4">
                    <div className="border border-slate-200 p-6 rounded">
                        <p className="font-semibold">Product info</p>
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <FormSpacer>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    type='text'
                                    name='title'
                                    id='title'
                                    defaultValue={product.data.Products.title}
                                />
                                {actionData?.fieldErrors?.title
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.title}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='description'>Description</Label>
                                <Textarea
                                    name='description'
                                    id='description'
                                    defaultValue={product.data.Products.description}
                                />
                                {actionData?.fieldErrors?.description
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.description}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='category'>Category</Label>
                                <Select name="category" id="category" defaultValue={product.data.Products.Categories.title}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select category--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category, index) => (
                                            <SelectItem key={index} value={category} className="capitalize">{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    type='number'
                                    name='quantity'
                                    id='quantity'
                                    defaultValue={product.data.quantity}
                                />
                                {actionData?.fieldErrors?.quantity
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.quantity}</p>
                                    : null
                                }
                            </FormSpacer>
                        </div>
                    </div>
                    <div className="border border-slate-200 p-6 rounded">
                        <p className="font-semibold">Pricing (Kshs)</p>
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <FormSpacer>
                                <Label htmlFor='price'>Price</Label>
                                <Input
                                    type='number'
                                    name='price'
                                    id='price'
                                    defaultValue={product.data.price}
                                    min="1"
                                />
                                {actionData?.fieldErrors?.price
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.price}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='compare'>Compare-at price</Label>
                                <Input
                                    type='number'
                                    name='compare-price'
                                    id='compare'
                                    defaultValue={product.data.compare_price}
                                    min="1"
                                />
                                {actionData?.fieldErrors?.comparePrice
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.comparePrice}</p>
                                    : null
                                }
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor='purchase-price'>Purchase price (price you bought the item)</Label>
                                <Input
                                    type='number'
                                    name='purchase-price'
                                    id='purchase-price'
                                    defaultValue={product.data.purchase_price}
                                    min="1"
                                />
                                {actionData?.fieldErrors?.purchasePrice
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.purchasePrice}</p>
                                    : null
                                }
                            </FormSpacer>
                        </div>
                        {/* TODO: Add cost per item, profit & margin */}
                    </div>

                    <div className="border border-slate-200 p-6 rounded space-y-4">
                        <p className="font-semibold">Variants</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormSpacer>
                                <Label htmlFor='size'>Size</Label>
                                <Select
                                    name="size"
                                    id="size"
                                    defaultValue={product.data.variation.variationValues[0][0].value}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="--Select size--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="xs">XS</SelectItem>
                                        <SelectItem value="sm">SM</SelectItem>
                                        <SelectItem value="md">MD</SelectItem>
                                        <SelectItem value="lg">LG</SelectItem>
                                        <SelectItem value="xl">XL</SelectItem>
                                        <SelectItem value="xxl">XXL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormSpacer>
                            <FormSpacer>
                                <Label htmlFor="colour">Colour</Label>
                                <Input
                                    type='text'
                                    name='colour'
                                    id='colour'
                                    defaultValue={product.data.variation.variationValues[1][0].value}
                                />
                                {actionData?.fieldErrors?.colour
                                    ? <p className="text-red-500 text-sm">{actionData.fieldErrors.colour}</p>
                                    : null
                                }
                            </FormSpacer>
                            {/* <button
                                type="button"
                                onClick={() => setAddSize(true)}
                                className="text-sm text-blue-500"
                            >
                                Add size
                            </button> */}
                        </div>

                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline">Cancel</Button>
                        <Button
                            type="submit"
                            className="bg-brand-orange"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </fieldset>
            </Form>
        </div>
    );
}