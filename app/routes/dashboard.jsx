import { Link, NavLink, Outlet, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { BriefcaseIcon, ChartIcon, ErrorIllustration, PlusIcon } from "~/components/Icon";
import { requireUser } from "~/supabase.server";

export async function loader({ request }) {
    await requireUser(request);
    return null;
}

export default function Dashboard() {
    const sidenavMenu = [
        {
            title: 'Dashboard',
            path: '/dashboard',
            icon: <ChartIcon />
        },
        {
            title: 'Products',
            path: '/dashboard/products',
            icon: <BriefcaseIcon />
        },
        {
            title: 'Add product',
            path: '/dashboard/products/new',
            icon: <PlusIcon />
        },

    ];
    return (
        <main className="text-brand-black flex">
            <div className="min-h-screen w-14 fixed lg:w-72 bg-gray-100">
                <ul className="divide-solid divide-y">
                    {sidenavMenu.map((menuItem, index) => (
                        <li key={index} className="">
                            <NavLink
                                to={menuItem.path}
                                prefetch="intent"
                                end
                                className={({ isActive }) => `flex gap-2 py-3 pl-4 lg:pl-8 hover:bg-orange-200 transition ease-in-out duration-300 ${isActive ? 'bg-brand-orange text-white' : ''}`}
                            >
                                {menuItem.icon} <span className="hidden lg:inline">{menuItem.title}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-full min-h-screen flex-1 px-4 ml-14 lg:ml-80">
                <Outlet />
            </div>
        </main>
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