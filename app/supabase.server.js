// import { createClient } from "@supabase/supabase-js";
import { createServerClient, parse, serialize } from "@supabase/ssr";
import { redirect } from "@remix-run/node";

// export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
// export const supabaseServerClient = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY, { request, response });

export async function requireUser(request) {
    const { supabaseClient, headers } = await createClient(request);

    // console.log({ supabaseClient });

    const { data: { session } } = await supabaseClient.auth.getSession();

    const user = session?.user;
    // console.log({ user });

    if (user) {
        return { user, headers };
    }
    throw await logout(request);
}

export function createClient(request) {
    const cookies = parse(request.headers.get('Cookie') ?? '');
    const headers = new Headers();

    const supabaseClient = createServerClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_PUBLIC_KEY, {
        cookies: {
            get(key) {
                return cookies[key]
            },
            set(key, value, options) {
                headers.append('Set-Cookie', serialize(key, value, options))
            },
            remove(key, options) {
                headers.append('Set-Cookie', serialize(key, '', options))
            },
        }
    });
    return { supabaseClient, headers };
}

export async function logout(request) {
    const cookies = parse(request.headers.get('Cookie') ?? '');
    const headers = new Headers();

    const supabaseClient = createServerClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_PUBLIC_KEY, {
        cookies: {
            get(key) {
                return cookies[key]
            },
            set(key, value, options) {
                headers.append('Set-Cookie', serialize(key, value, options))
            },
            remove(key, options) {
                headers.append('Set-Cookie', serialize(key, '', options))
            },
        }
    });

    const { data: signoutUser } = await supabaseClient.auth.signOut();
    return redirect('/login', {
        headers
    });
}