import { redirect } from "@remix-run/node";
import { createClient } from "~/supabase.server"

export async function loader({ request }) {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');
    const next = requestUrl.searchParams.get('next') || '/';

    const { supabaseClient, headers } = createClient(request);

    if (token_hash && type) {

        const { error } = await supabaseClient.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            return redirect(next, { headers })
        }
    }

    // return the user to an error page with instructions
    return redirect('/auth/auth-code-error', { headers })
}