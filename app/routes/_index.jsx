import { Form, Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { ArrowRightIcon, ErrorIllustration, MpesaIcon } from "~/components/Icon";
import ProductCard from "~/components/ProductCard";
import { featuredProducts } from "~/utils";

export const meta = () => {
  return [
    { title: "The verve fashion" },
    { name: "description", content: "Shop for your favourite clothes" },
  ];
};

// export async function loader() {
//   throw new Error('Kaboom!');
// }

export default function Index() {
  return (
    <main className="text-brand-black -mt-24">
      <Hero />
      <NewArrivals />
      <FeaturedProducts />
      <Justification />
      <Categories />
      <Brands />
      <Testimonials />
    </main>
  );
}

function Hero() {
  return (
    <div className="lg:min-h-screen w-full lg:grid lg:grid-cols-2 bg-brand-brown bg-opacity-60 px-4 lg:px-0 pb-20 lg:pb-0">
      {/* Hero */}
      <div className="pt-32 lg:pt-48 flex flex-col gap-6 lg:gap-8 lg:px-8 xl:px-10">
        {/* Text */}
        <h1 className="hidden">The verve fashion</h1>
        <div>
          <p className="">The Verve Fashion </p>
          <p className="text-4xl lg:text-6xl mt-2 font-heading">Up to <span className="text-brand-orange">40% off</span> on Kenya's latest trends!</p>

        </div>
        <div>
          <Link
            to="/products"
            className="px-8 py-2 bg-brand-orange text-white rounded capitalize"
          >
            Shop now
          </Link>
        </div>
        <div>
          <p className="">Pay conveniently for products:</p>
          {/* Payment option logos */}
          <div className=" -mt-4 w-20">
            <MpesaIcon />
          </div>
        </div>
      </div>
      {/* Desktop images */}
      <div className="hidden lg:flex lg:justify-end relative">
        {/* Images */}
        <div className="w-56 absolute top-24 right-64 z-10">
          <img
            src="/loungewear.jpeg"
            alt="Lounge wear"
            className="max-w-full"
          />
        </div>

        <div className="w-72 absolute bottom-0 right-80">
          <img
            src="/two-piece-set.jpg"
            alt="Two piece set"
            className="max-w-full"
          />
        </div>

        <div className="w-96">
          <img
            src="/corset-top.jpg"
            alt="Corset top"
            className="max-w-full"
          />
        </div>

        {/* <div className="max-w-xs lg:w-[500px] mx-auto lg:mx-0 border border-red-500">
        <svg viewBox="0 0 100 100" id="images">
          <mask id="blueClip">
            <rect id="rect1" x="30" y="0" width="70" height="50" fill="white" />
          </mask>

          <mask id="greenClip">
            <rect id="rect2" x="60" y="60" width="40" height="40" fill="white" />
          </mask>

          <mask id="pinkClip">
            <rect id="rect3" x="0" y="30" width="50" height="70" fill="white" />
          </mask>

          <image preserveAspectRatio="xMidYMid slice" mask="url(#blueClip)" x="30" y="0" width="70" height="50" href="/corset-top.jpg" />

          <image preserveAspectRatio="xMidYMid slice" mask="url(#greenClip)" x="60" y="60" width="40" height="40" href="/loungewear.jpeg" />

          <image preserveAspectRatio="xMidYMid slice" mask="url(#pinkClip)" x="0" y="30" width="50" height="70" href="two-piece-set.jpg" />
        </svg>
      </div> */}
      </div>
      {/* Mobile images */}
      <div className="flex lg:hidden gap-4 justify-center">
        <div className="w-56">
          <img
            src="/loungewear.jpeg"
            alt="Lounge wear"
            className="max-w-full"
          />
        </div>
        <div className="w-36">
          <img
            src="/two-piece-set.jpg"
            alt="Lounge wear"
            className="max-w-full"
          />
        </div>
      </div>
    </div>
  );
}

function NewArrivals() {
  const newArrivals = [
    {
      imageSrc: '/loungewear.jpeg',
      name: 'Dress',
      rating: '4.5',
      price: '3999',
      oldPrice: '4999',
      id: 1
    },
    {
      imageSrc: '/corset-top.jpg',
      name: 'Corset top',
      rating: '4.5',
      price: '3999',
      oldPrice: '4999',
      id: 2
    },
    {
      imageSrc: '/two-piece-set.jpg',
      name: 'Two piece set',
      rating: '4.5',
      price: '3999',
      oldPrice: '4999',
      id: 3
    },
    {
      imageSrc: '/loungewear.jpeg',
      name: 'Dress',
      rating: '4.5',
      price: '3999',
      oldPrice: '4999',
      id: 4
    },
    {
      imageSrc: '/loungewear.jpeg',
      name: 'Dress',
      rating: '4.5',
      price: '3999',
      oldPrice: '4999',
      id: 5
    },
  ]
  return (
    <div className="px-4 lg:max-w-7xl mx-auto mt-20 xl:mt-32">
      <h2 className="font-heading text-2xl lg:text-3xl text-center">New arrivals</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
        {newArrivals.map(arrival => (
          <Link to={`/products/${arrival.id}`} key={arrival.id}>
            <ProductCard imageSrc={arrival.imageSrc}>
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <h3 className="text-xl">{arrival.name}</h3>
                  <span>{arrival.rating}</span>
                </div>
                <p className="flex gap-4 items-center"><s className="text-gray-400 text-sm">Ksh {arrival.oldPrice}</s> <span>Ksh {arrival.price}</span></p>
                <Form method="post">
                  <input type="hidden" name="id" value={arrival.id} />
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
    </div>
  );
}

function FeaturedProducts() {
  return (
    <div className="px-4 lg:max-w-7xl mx-auto mt-20 xl:mt-32">
      <h2 className="font-heading text-2xl lg:text-3xl text-center">Featured products</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
        {featuredProducts.map(product => (
          <Link to={`/products/${product.id}`} key={product.id}>
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
    </div>
  );
}

function Justification() {
  return (
    <div className="mt-20 xl:mt-32 py-32 bg-[url('/store.webp')] bg-cover bg-no-repeat bg-center bg-black bg-blend-overlay bg-opacity-70 text-gray-200">
      <div className="px-4 lg:max-w-5xl mx-auto text-center space-y-4">
        <h2 className="font-heading text-2xl lg:text-3xl">Why shop at The Verve Fashion?</h2>
        <p className="text-gray-300">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt, rerum porro possimus nobis optio vel voluptates natus tempora ab doloremque totam cumque iure excepturi sit officia dolor minus. Repellat, officia!</p>
        <div>
          <Link to="/about" className="bg-brand-orange text-white px-4 py-2 rounded">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}

function Categories() {
  const categories = [
    {
      name: 'Dresses',
      path: '/category/dresses',
      imgSrc: '/two-piece-set.jpg'
    },
    {
      name: 'Corset tops',
      path: '/category/dresses',
      imgSrc: '/corset-top.jpg'
    },
    {
      name: 'Lounge wear',
      path: '/category/dresses',
      imgSrc: '/loungewear.jpeg'
    },
    {
      name: 'Two piece set',
      path: '/category/dresses',
      imgSrc: '/two-piece-set.jpg'
    },
    {
      name: 'Basics',
      path: '/category/dresses',
      imgSrc: '/loungewear.jpeg'
    },
    {
      name: 'Accessories',
      path: '/category/dresses',
      imgSrc: '/two-piece-set.jpg'
    }
  ];

  return (
    <div className="px-4 lg:max-w-7xl mx-auto text-center mt-20 xl:mt-32">
      <h2 className="font-heading text-2xl lg:text-3xl">Explore our categories</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 px-4 sm:px-0">
        {categories.map((category, index) => (
          <div
            key={index}
            className="aspect-[4/3] bg-contain bg-center bg-no-repeat bg-black bg-blend-overlay bg-opacity-50 text-gray-200 grid place-items-center rounded hover:scale-105 transition ease-in-out duration-300 group"
            style={{ backgroundImage: `url(${category.imgSrc})` }}
          >
            <Link to={category.path} className="group-hover:underline font-heading">
              {category.name}
            </Link>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Link to="/" className="flex gap-4 hover:text-brand-orange hover:underline transition ease-in-out duration-300">
          View more <ArrowRightIcon />
        </Link>
      </div>
      {/* TODO: Use masonry layout */}

      {/* <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="grid gap-4">
          
        </div>

        <div className="grid gap-4">
          <div className="bg-[url('/two-piece-set.jpg')] bg-cover bg-center bg-no-repeat rounded h-auto max-w-full">
            Two-piece sets
          </div>
          <div className="bg-[url('/corset-top.jpg')] bg-cover bg-center bg-no-repeat rounded h-auto max-w-full">
            Basics
          </div>
          
        </div>

        <div className="grid gap-4">
          <div className="bg-[url('/two-piece-set.jpg')] bg-cover bg-center bg-no-repeat rounded h-auto max-w-full">
            Accessories
          </div>
          <div className="bg-[url('/corset-top.jpg')] bg-cover bg-center bg-no-repeat rounded h-auto max-w-full">
            Loungewear
          </div>
        </div>
      </div> */}
    </div>
  )
}

function Brands() {
  const brands = [
    {
      imageSrc: '/dior.svg',
      altText: 'Dior logo'
    },
    {
      imageSrc: 'dolce-gabbana.svg',
      altText: 'Dole and Gabbana logo'
    },
    {
      imageSrc: 'nike-11.svg',
      altText: 'Nike logo'
    },
    {
      imageSrc: 'Gucci_logo.svg',
      altText: 'Gucci logo'
    },
    {
      imageSrc: 'prada.svg',
      altText: 'Prada logo'
    }
  ];

  return (
    <div className="mt-20 xl:mt-32 flex flex-wrap w-full justify-evenly">
      {brands.map((brand, index) => (
        <img key={index} src={brand.imageSrc} alt={brand.altText} className="aspect-square object-cover w-20 lg:max-w-[200px]" />
      ))}
    </div>
  );
}

function Testimonials() {
  const testimonials = [
    {
      name: 'Jane Doe',
      imageSrc: '/girl.png',
      altText: 'Jane Doe',
      text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores cum at ratione possimus incidunt laboriosam optio a ex, quisquam vitae suscipit quo. Dolores ducimus temporibus rerum. Labore, aspernatur nesciunt, laboriosam ipsum accusamus rerum odio, dolore excepturi officia ducimus iure id.'
    },
    {
      name: 'John Doe',
      imageSrc: '/girl.png',
      altText: 'Jane Doe',
      text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores cum at ratione possimus incidunt'
    },
    {
      name: 'June Doe',
      imageSrc: '/girl.png',
      altText: 'Jane Doe',
      text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores cum at ratione possimus incidunt laboriosam optio a ex, quisquam vitae suscipit quo. Dolores ducimus temporibus rerum. Labore, aspernatur nesciunt, laboriosam ipsum accusamus rerum odio, dolore excepturi officia ducimus iure id.'
    },
    {
      name: 'June Doe',
      imageSrc: '/girl.png',
      altText: 'Jane Doe',
      text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores cum at ratione possimus incidunt laboriosam optio a ex, quisquam vitae suscipit quo. Dolores ducimus temporibus rerum. Labore, aspernatur nesciunt, laboriosam ipsum accusamus rerum odio, dolore excepturi officia ducimus iure id.'
    },
    {
      name: 'Jean Doe',
      imageSrc: '/girl.png',
      altText: 'Jane Doe',
      text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores cum at ratione possimus incidunt laboriosam optio a ex, quisquam vitae suscipit quo. Dolores ducimus temporibus rerum. Labore, aspernatur nesciunt, laboriosam ipsum accusamus rerum odio, dolore excepturi officia ducimus iure id.'
    }
  ];

  return (
    <div className="mt-20 xl:mt-32 px-6 lg:px-0 lg:max-w-7xl mx-auto">
      <h2 className="font-heading text-2xl lg:text-3xl text-center">What our clients say</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
        {testimonials.map((testimonial, index) => (
          <Testimonial
            key={index}
            name={testimonial.name}
            imageSrc={testimonial.imageSrc}
            altText={testimonial.altText}
            text={testimonial.text}
          />
        ))}
      </div>
      {/* <div className="flex gap-4 snap-x overflow-x-scroll max-w-max mt-12">
        {testimonials.map((testimonial, index) => (
          <Testimonial
            key={index}
            name={testimonial.name}
            imageSrc={testimonial.imageSrc}
            altText={testimonial.altText}
            text={testimonial.text}
          />
        ))}
      </div> */}
    </div>
  );
}

function Testimonial({ name, imageSrc, altText, text }) {
  return (
    <div className="w-full border border-gray-200 rounded p-6">
      <div className="flex gap-4 items-center">
        <img src={imageSrc} alt={altText} className="w-16 h-16 rounded-full object-cover" />
        <p>{name}</p>
      </div>
      <p className="mt-4 text-gray-500">
        {text}
      </p>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    console.log({ error });
    return (
      <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-60 lg:w-72">
              <ErrorIllustration />
            </div>
            <h1 className="text-3xl font-semibold mt-4">{error.status} {error.statusText}</h1>
            <p>{error.data}</p>
          </div>
          <Link to='.' className="underline text-brand-black">
            Try again
          </Link>
        </div>
      </div>
    );
  } else if (error instanceof Error) {
    console.log({ error });
    return (
      <div className="bg-red-100 text-red-500 w-full h-screen grid place-items-center px-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-60 lg:w-72">
              <ErrorIllustration />
            </div>
            <h1 className="text-3xl font-semibold mt-4">Error</h1>
            <p>{error.message}</p>
          </div>
          <Link to="." className="underline text-brand-black">
            Try again
          </Link>
        </div>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
