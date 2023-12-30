import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import { CartIcon, HamburgerIcon, XIcon } from "./Icon";
import { useState } from "react";

export default function Nav({ navLinks, isLoggedIn }) {
    const cartCount = useLoaderData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(!isMenuOpen);
    }
    return (
        <nav className="flex justify-between w-full">
            {/* Desktop nav */}
            <div className="hidden lg:flex lg:justify-between lg:items-center w-full">
                <Link to="/">
                    <p>The Verve Fashion</p>
                </Link>

                <ul className="flex gap-4">
                    {navLinks.map((link, index) =>
                    (<li key={index}>
                        <NavLink
                            to={link.path}
                            prefetch="intent"
                        >
                            {link.text}
                        </NavLink>
                    </li>
                    ))}
                </ul>
                <div className="flex gap-2 items-center">
                    <Link to={"/cart"} className="flex gap-2">
                        <CartIcon /> Cart
                    </Link>
                    {isLoggedIn
                        ? <Form method="post" action="/logout">
                            <button
                                type="submit"
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Log out
                            </button>
                        </Form>
                        : null
                    }
                </div>
            </div>

            {/* Mobile nav */}
            <div className="lg:hidden flex justify-between w-full">
                <p>The Verve Fashion</p>

                <div className="flex gap-x-4">

                    <NavLink
                        to="/cart"
                        // className={({ isActive }) => `relative text-white ${isActive ? 'bg-brand-gray px-6 py-2 text-black' : 'text-black'}`}
                        className="text-brand-black"
                        prefetch="intent"
                    >
                        <CartIcon />
                        {cartCount > 0 ? (<span className="absolute -top-5 -right-2 rounded-full bg-brand-yellow w-6 h-6 md:w-8 md:h-8  text-black font-mono text-sm  leading-tight flex justify-center items-center">{cartCount}
                        </span>) : null}

                    </NavLink>

                    <HamburgerIcon toggleMenu={toggleMenu} />
                </div>
                {
                    isMenuOpen && (
                        <div className='flex flex-col justify-center items-center bg-black opacity-90 w-full h-screen fixed z-10 top-0 left-0 transition duration-500 ease-in-out'>
                            <span className="absolute top-[50px] right-2">
                                <XIcon toggleMenu={toggleMenu} />
                            </span>
                            <ul className='list-none text-center mr-4 text-white'>
                                {navLinks.map((navLink, index) => (
                                    <li
                                        className='text-xl'
                                        key={index}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <NavLink
                                            to={navLink.path}
                                            prefetch='intent'
                                            end
                                            className={({ isActive }) => isActive ? 'bg-brand-gray px-5 py-2' : ''}
                                        >
                                            {navLink.name}
                                        </NavLink>
                                    </li>

                                ))}
                            </ul>
                        </div>
                    )
                }
            </div>
        </nav>
    );
}