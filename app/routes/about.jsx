import { Link } from "@remix-run/react";

export default function About() {
    const customers = [
        {
            imgSrc: '/corset-top.jpg',
            altText: 'Image of Jane in a black dress'
        },
        {
            imgSrc: '/two-piece-set.jpg',
            altText: 'Image of Jean in a green top'
        },
        {
            imgSrc: '/loungewear.jpeg',
            altText: 'Image of Jasmine in an orange jacket'
        },
        {
            imgSrc: '/two-piece-set.jpg',
            altText: 'Image of Jean in a green top'
        }
    ];
    return (
        <main className="-mt-36">
            <div className="w-full h-[60vh] lg:h-[75vh] landscape:h-screen bg-[url('/about.jpg')] bg-cover bg-center bg-no-repeat">
                <div className="w-full h-full bg-gradient-to-b from-white bg-opacity-60 grid place-items-center">
                    <h1 className="font-heading text-2xl lg:text-3xl font-semibold">About us</h1>
                </div>
            </div>
            <div className="px-4 md:px-0 md:max-w-xl xl:max-w-3xl mx-auto mt-16 lg:mt-24 text-center space-y-12">
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis architecto illum doloremque modi officiis perferendis optio soluta, eaque nesciunt dolorum error repellendus maxime atque facere est sapiente numquam. Assumenda, distinctio totam incidunt neque expedita voluptatibus nulla labore, veritatis quibusdam vel voluptate earum nesciunt architecto laudantium aperiam illo numquam ab cum aut! Repudiandae architecto deserunt ab veniam, eum perferendis quos natus! Neque quis atque quos dicta corrupti velit sunt, ab asperiores vel explicabo animi iste doloribus, cupiditate provident culpa facere. Reiciendis.</p>
                <div>
                    <h2 className="font-heading text-2xl lg:text-3xl">Our vision</h2>
                    <p className="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Id necessitatibus officiis consequatur officia dignissimos hic consectetur repellendus repudiandae asperiores corrupti.</p>
                </div>
                <div>
                    <h2 className="font-heading text-2xl lg:text-3xl"> Our mission</h2>
                    <p className="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo fugit perspiciatis natus! Numquam perspiciatis quidem ex, accusantium ipsum odit cum!</p>
                </div>
                <div>
                    <h2 className="font-heading text-2xl lg:text-3xl">How can we help our customers?</h2>
                    <p className="mt-4">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem nostrum dolor ab eveniet asperiores saepe maiores deleniti! Amet, magnam quisquam voluptatum consequuntur, vitae dolor porro, voluptas sequi excepturi itaque corporis.</p>
                </div>
                <div>
                    <h2 className="font-heading text-2xl lg:text-3xl">Our customers love our products</h2>
                    <p className="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quae voluptatum fuga, error obcaecati itaque nam cupiditate recusandae distinctio a voluptatem labore provident et veniam natus, excepturi molestias laborum mollitia!</p>
                    <div className="mt-6 grid justify-center grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                        {/* TODO: Use masonry layout */}
                        {customers.map((customer, index) => (
                            <img
                                key={index}
                                src={customer.imgSrc}
                                alt={customer.altText}
                                className="aspect-[4/6] max-w-full object-cover rounded"
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-center">
                    <Link to="/products" prefetch="intent" className=" bg-brand-orange text-white px-8 py-2 rounded">
                        Shop now
                    </Link>
                </div>
            </div>
        </main>
    );
}