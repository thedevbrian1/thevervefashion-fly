import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import toastStyles from 'react-toastify/dist/ReactToastify.css';
import algoliasearch from "algoliasearch";
import { InstantSearch, SearchBox } from "react-instantsearch";
import instantsearchStyles from "instantsearch.css/themes/satellite.css";
import tailwindStyles from "./tailwind.css";
import { navLinks } from "./utils";
import { InstagramIcon, TwitterIcon } from "./components/Icon";
import Nav from "./components/Nav";
import Input from "./components/Input";
import { getSession, sessionStorage } from "./session.server";
import { createClient } from "./supabase.server";

export const links = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: toastStyles },
  {
    rel: "stylesheet", href: instantsearchStyles
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "true" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=Montserrat&display=swap" },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

const searchClient = algoliasearch("CNXGC6F83A", "848f2ed6be215b043a695b8be106f2cd");

export async function loader({ request }) {
  const [session, { supabaseClient, headers }] = await Promise.all([getSession(request), createClient(request)]);

  const sbSession = await supabaseClient.auth.getSession();

  // const user = sbSession.data.session.user;
  const isLoggedIn = sbSession.data.session ? true : false;

  const toastMessage = session.get('toastMessage');

  const allHeaders = { ...Object.fromEntries(headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };

  if (!toastMessage) {
    return json({ toastMessage: null, isLoggedIn }, {
      headers: allHeaders
    });
  }

  return json({ toastMessage, isLoggedIn }, {
    headers: allHeaders
  });
}

export default function App() {
  const { toastMessage, isLoggedIn } = useLoaderData();
  const actionData = useActionData();
  const location = useLocation();

  const headerRef = useRef(null);
  const interceptRef = useRef(null);

  const [isIntersecting, setIsIntersecting] = useState(false);

  const toastId = useRef(null);



  const footerLinks = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'About',
      path: '/about'
    },
    {
      name: 'Cart',
      path: '/cart'
    },
    {
      name: 'Contacts',
      path: '/contacts'
    }
  ];

  const footerProducts = [
    {
      name: 'Two piece sets',
      path: '/category/two-piece-set'
    },
    {
      name: 'Basics',
      path: '/category/basic'
    },
    {
      name: 'Dresses',
      path: '/category/dress'
    },
    {
      name: 'Accessories',
      path: '/category/accessory'
    },
    {
      name: 'Lounge wear',
      path: '/category/loungewear'
    }
  ];

  useEffect(() => {
    const header = headerRef.current;
    const intercept = interceptRef.current;

    intercept.setAttribute("data-observer-intercept", "");
    header.parentNode.insertBefore(intercept, header);

    const observer = new IntersectionObserver((entries) => {
      setIsIntersecting(entries[0].isIntersecting);
    });
    observer.observe(intercept);

    return () => observer.unobserve(intercept);
  }, []);

  // TODO: Fix flash of toast

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const { message, type } = toastMessage;

    switch (type) {
      case "success":
        toastId.current = toast.success(message);
        break;

      case "error":
        toastId.current = toast.error(message);
        break;
    }
    return () => toast.dismiss(toastId.current);
  }, [toastMessage]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-body text-brand-black">
        {/* FIXME: Fix the white flash when the navbar position is changing */}
        {/* FIXME: Fix content going over the navbar before it fully loads */}

        <div ref={interceptRef}></div>
        <header
          ref={headerRef}
          className={`sticky top-0 w-full z-20 transition duration-500 ease-in-out py-4 px-4 lg:px-10 ${isIntersecting ? 'bg-transparent' : 'bg-white'} `}
        >
          <Nav navLinks={navLinks} isLoggedIn={isLoggedIn} />
          {/* TODO: Prevent content shift before search bar is rendered */}
          {/* TODO: Search implementation..Use autocomplete */}
          <div className="lg:max-w-md mx-auto mt-4">
            <InstantSearch searchClient={searchClient} indexName="thevervefashion" future={{ preserveSharedStateOnUnmount: true }}>

              {(location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact')
                ? !isIntersecting
                  ? <SearchBox />
                  : null
                : location.pathname.includes('/dashboard')
                  ? null
                  : (location.pathname === '/login' || location.pathname === '/signup')
                    ? null
                    : <SearchBox />
              }
            </InstantSearch>
          </div>
        </header>
        <Outlet />
        <footer className="bg-brand-gray font-body text-brand-black text-opacity-70 mt-20 xl:mt-32 py-24">
          <div className="flex flex-col lg:flex-row gap-5 px-6 md:px-10 lg:px-0 lg:max-w-4xl lg:mx-auto lg:justify-evenly">
            <p>TheVerveFashion</p>
            <div>
              <h2 className="font-semibold font-heading">Quick links</h2>
              <ul className="space-y-1 mt-2">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink to={link.path} prefetch="intent">
                      {link.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold font-heading">Products</h2>
              <ul className="space-y-1 mt-2">
                {footerProducts.map((product, index) => (
                  <li key={index}>
                    <Link to={product.path} prefetch="intent">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold font-heading">Follow us on social media</h2>
              <div className="flex gap-4 mt-2">
                <div className="w-6">
                  <InstagramIcon />
                </div>
                <div className="w-6">
                  <TwitterIcon />
                </div>
              </div>
              <p className="mt-4">Subscribe for exclusive deals, offers and promotions</p>
              <Form method="post" className="-mt-4">
                <fieldset className="flex items-center">
                  <div>
                    <label htmlFor="email" className="invisible">Email</label>
                    <Input
                      type='email'
                      name='email'
                      id='email'
                      placeholder='Enter email here'
                      fieldError={actionData?.fieldErrors?.email}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-brand-orange text-white"
                  >
                    Subscribe
                  </button>
                </fieldset>
              </Form>
            </div>
          </div>
          <p className="text-center mt-8">Copyright &copy; {new Date().getFullYear()}</p>
        </footer>
        <ToastContainer position="bottom-right" />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
