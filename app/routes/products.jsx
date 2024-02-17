
// const searchClient = algoliasearch(process.env.ALGOLIA_PROJECT_ID, process.env.ALGOLIA_SEARCH_ONLY_API_KEY);

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import ProductCard from "~/components/ProductCard";
import { Button } from "~/components/ui/button";
import { getProducts } from "~/models/product.server";
import { getSession, sessionStorage, setSuccessMessage, setWarningMessage } from "~/session.server";
import { featuredProducts } from "~/utils";

// const index = client.initIndex('demo_ecommerce');

// Set relevance
// index.setSettings({
//     // Select the attributes you want to search in
//     searchableAttributes: [
//       'brand', 'name', 'categories', 'description'
//     ],
//     // Define business metrics for ranking and sorting
//     customRanking: [
//       'desc(popularity)'
//     ],
//     // Set up some attributes to filter results on
//     attributesForFaceting: [
//       'categories', 'searchable(brand)', 'price'
//     ]
//   });

export async function loader({ request }) {
  const { data, error, headers } = await getProducts(request);
  if (error) {
    throw new Error(error);
  }

  const products = data.product.map(product => {
    let imageSrc = data.image.find(image => image.product_id === product.id)
    let details = {
      title: product.title,
      price: product?.price,
      comparePrice: product?.compare_price,
      imageSrc: imageSrc?.image_src,
      productId: product.id
    };
    return details;
  });

  return json({ products }, {
    headers
  });
}

export async function action({ request }) {
  const session = await getSession(request);
  const formData = await request.formData();
  const action = formData.get('_action');
  const id = formData.get('id');

  switch (action) {
    case 'addToCart': {
      const cartItems = session.get('cartItems') ?? [];
      console.log({ cartItems });
      // Check if item is in cart
      const productIds = cartItems.map(item => item.id);

      const item = productIds.includes(Number(id));
      if (item) {
        setWarningMessage(session, "Item already in cart");
        break;
      }

      let cartItem = {
        id: Number(id),
        count: 1
      };

      cartItems.push(cartItem);
      session.set('cartItems', cartItems);
      setSuccessMessage(session, 'Added to cart!');
      break;
    }
  }
  return json({ ok: true }, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session)
    }
  });
}

export default function Products() {
  const { products } = useLoaderData();

  return (
    <main className="pt-16 px-6 lg:max-w-7xl mx-auto">
      <h1 className="font-heading text-2xl lg:text-3xl text-center">All products</h1>
      {
        products.length === 0
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
              {products.map(product => (
                <Link
                  to={`${product.productId}`}
                  key={product.productId}
                  prefetch="intent"
                >
                  <ProductCard imageSrc={product.imageSrc}>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="text-xl">{product.title}</h3>
                        {/* <span>{product.rating}</span> */}
                      </div>
                      <p className="flex gap-4 items-center"><s className="text-gray-400 text-sm">Ksh {product.comparePrice}</s> <span>Ksh {product.price}</span></p>
                      <Form method="post">
                        <input type="hidden" name="id" value={product.productId} />
                        <Button
                          type="submit"
                          name="_action"
                          value="addToCart"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-brand-orange text-white"
                        >
                          Add to cart
                        </Button>
                      </Form>
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

// function Hit({ hit }) {
//   return (
//     <article>
//       <img src={hit.image} alt={hit.name} />
//       <p>{hit.categories[0]}</p>
//       <h1>
//         <Highlight attribute="name" hit={hit} />
//       </h1>
//       <p>${hit.price}</p>
//     </article>
//   );
// }

