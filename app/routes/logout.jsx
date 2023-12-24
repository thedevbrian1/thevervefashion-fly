import { redirect } from "@remix-run/node";
import { logout } from "~/supabase.server";

export async function loader() {
    return redirect('/');
}
export async function action({ request }) {
    return logout(request);
}