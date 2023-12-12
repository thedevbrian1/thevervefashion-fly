import { Form, Link } from "@remix-run/react";
import ProductCard from "~/components/ProductCard";
import { featuredProducts } from "~/utils";

export default function Category() {

    return (
        <main className="pt-20 px-6 lg:max-w-7xl mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl text-center">Dresses</h1>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                {featuredProducts.map(product => (
                    <Link
                        to={`/products/${product.id}`}
                        key={product.id}
                        prefetch="intent"
                    >
                        <ProductCard imageSrc={product.imageSrc}>
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between">
                                    <h3 className="text-xl">{product.name}</h3>
                                    <span>{product.rating}</span>
                                </div>
                                <p className="flex gap-4 items-center"><s className="text-gray-400 text-sm">Ksh {product.oldPrice}</s> <span>Ksh {product.price}</span></p>
                                <Form method="post">
                                    <input type="hidden" name="id" value={product.id} />
                                    <button
                                        type="submit"
                                        className="bg-brand-orange text-white px-4 py-2 rounded"
                                    >
                                        Add to cart
                                    </button>
                                </Form>
                            </div>
                        </ProductCard>
                    </Link>
                ))}

            </div>
        </main>
    );
}