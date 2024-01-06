import { createClient } from "~/supabase.server";

export async function addCategory(request, title) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Categories')
        .insert([
            {
                title
            }
        ]).select();
    return { data, error, headers };
}

export async function getCategoryId(request, category) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Categories').select('id').eq('title', category);
    return { data, error, headers };
}

export async function getCategories(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient.from('Categories').select('title');
    return { data, error, headers };
}