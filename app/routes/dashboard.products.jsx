import { Link, useLoaderData } from "@remix-run/react";
import ProductCard from "~/components/ProductCard";
import { getProducts } from "~/models/product.server";

export async function loader({ request }) {
    const { data, error, headers } = await getProducts(request);
    return { data }
}
export default function DashboardProducts() {
    const { data } = useLoaderData();
    console.log({ data });
    return (
        <div className="mt-8 md:mt-12">
            <h1 className="font-semibold font-heading text-2xl lg:text-3xl">Products</h1>
            <div className="mt-4 grid am:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.product.map((product, index) => (
                    <Link
                        key={index}
                        to={`/dashboard/products/${product.product_id}`}
                        prefetch="intent"
                    >
                        <ProductCard imageSrc={data.image[index].image_src}>
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between">
                                    <h3 className="text-xl">{product.Products.title}</h3>
                                    {/* <span>{product.rating}</span> */}
                                </div>
                                <p className="flex gap-4 items-center"><s className="text-gray-400 text-sm">Ksh {product.compare_price}</s> <span>Ksh {product.price}</span></p>

                            </div>
                        </ProductCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}