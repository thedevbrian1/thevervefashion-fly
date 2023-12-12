export default function ProductCard({ imageSrc, children }) {
    return (
        <article className="border border-gray-200">
            {/* TODO: Make sure face is always seen using cloudinary */}
            <img
                src={imageSrc}
                alt=""
                className="object-cover h-60 aspect-[4/3] w-full"
            />
            {children}
        </article>
    );
}