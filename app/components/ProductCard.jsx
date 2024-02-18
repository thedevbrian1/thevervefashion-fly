import { Link, useLocation } from "@remix-run/react";

export default function ProductCard({ imageSrc, children, id }) {
    const location = useLocation();

    return (
        <article className="border border-gray-200">
            {/* TODO: Make sure face is always seen using cloudinary */}
            {imageSrc
                ? <img
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                    className="object-cover h-60 aspect-[4/3] w-full"
                />
                : <div className="h-60  bg-gray-100 grid place-items-center">
                    <div className="flex flex-col items-center gap-1">
                        <p>No image</p>
                        {location.pathname.includes('/dashboard')
                            ? <Link
                                to={`/dashboard/products/${id}#images`}
                                className="bg-brand-orange px-4 py-2 rounded text-white"
                            >
                                Add image
                            </Link>
                            : null
                        }

                    </div>
                </div>
            }

            {children}
        </article>
    );
}