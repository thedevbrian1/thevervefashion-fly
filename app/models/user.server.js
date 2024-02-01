import { createClient } from "~/supabase.server";

export async function sendResetLink(request, email) {
    const { supabaseClient, headers } = createClient(request);
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) {
        throw new Error(error);
    }
    return { headers };
}

export async function updatePassword(request, newPassword) {
    const { supabaseClient, headers } = createClient(request);

    const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) {
        throw new Error(error);
    }
    return { headers };
}