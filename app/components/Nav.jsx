import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CartIcon, HamburgerIcon, XIcon } from "./Icon";
import { navLinks } from "~/utils";

export default function Nav({ navLinks, isLoggedIn }) {
    const cartCount = useLoaderData();
    const [isMenuShowing, setIsMenuShowing] = useState(false);

    function toggleMenu() {
        setIsMenuShowing(!isMenuShowing);
    }
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
    };
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

                    <button onClick={toggleMenu}><HamburgerIcon /></button>
                </div>
                {isMenuShowing && (
                    <div className='flex flex-col justify-center items-center bg-white text-black w-full h-screen fixed z-10 top-0 left-0 transition duration-500 ease-in-out px-4'>
                        <button
                            className="absolute top-4 right-[15px]"
                            onClick={toggleMenu}
                        >
                            <XIcon />
                        </button>
                        <motion.ul
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="text-center mr-4">
                            {navLinks.map((link, index) => (
                                <motion.li key={index} variants={item}>
                                    <Link
                                        to={link.path}
                                        prefetch="intent"
                                        className="hover:text-brand-orange transition ease-in-out duration-300"
                                        onClick={() => setIsMenuShowing(false)}
                                    >
                                        {link.text}
                                    </Link>
                                </motion.li>
                            ))}
                            <motion.li variants={item} className="mt-4">
                                <Link to="/login" className="bg-brand-orange hover:bg-white hover:text-black transition ease-in-out duration-300 text-white px-10 py-2">Log in</Link>
                            </motion.li>
                        </motion.ul>
                        <img src="/loungewear.jpeg" alt="" className="object-cover aspect-video mt-16" />
                    </div>
                )}
            </div>
        </nav>
    );
}