import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import ProductCard from "~/components/ProductCard";
import { getCategorizedProducts } from "~/models/product.server";
import { featuredProducts } from "~/utils";

export async function loader({ request, params }) {
    const category = params.slug;
    const { data, headers } = await getCategorizedProducts(request, category);

    const products = data.map(product => {
        let productItem = {
            title: product.data.Products.title,
            price: product.data.price,
            comparePrice: product.data.compare_price,
            imageSrc: product.data.images[0].image_src,
            quantity: product.data.quantity,
            id: product.data.product_id
        };
        return productItem;
    });

    return json({ products, category }, {
        headers
    });
}

export default function Category() {
    const { products, category } = useLoaderData();

    return (
        <main className="pt-20 px-6 lg:max-w-7xl mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl text-center capitalize">{category}</h1>
            {products.length === 0
                ? (
                    <div className="w-full h-full grid place-items-center mt-8">
                        <img
                            src="/clipboard.svg"
                            alt="An illustration of an empty clipboard"
                            className="w-20 h-20 lg:w-40 lg:h-40"
                        />
                        <p className="mt-4">No products yet</p>
                    </div>
                )
                : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                        {products.map((product) => (
                            <Link
                                to={`/products/${product.id}`}
                                key={product.id}
                                prefetch="intent"
                            >
                                <ProductCard imageSrc={product.imageSrc}>
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <h3 className="text-xl">{product.title}</h3>
                                            {/* <span>{product.rating}</span> */}
                                        </div>
                                        <p className="flex gap-4 items-center"><s className="text-gray-400 text-sm">Ksh {product.comparePrice}</s> <span>Ksh {product.price}</span></p>
                                        {
                                            product.quantity > 0
                                                ? (<Form method="post">
                                                    <input type="hidden" name="id" value={product.id} />
                                                    <button
                                                        type="submit"
                                                        className="bg-brand-orange text-white px-4 py-2 rounded"
                                                    >
                                                        Add to cart
                                                    </button>
                                                </Form>)
                                                : <p className="bg-red-50 text-red-500 p-4 rounded max-w-fit">Out of stock</p>
                                        }

                                    </div>
                                </ProductCard>
                            </Link>
                        ))}

                    </div>
                )
            }

        </main>
    );
}