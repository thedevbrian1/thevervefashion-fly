import { createClient } from "~/supabase.server";

export async function addVariationOption(request, value, variationId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Variation_options')
        .insert([
            {
                value,
                variation_id: variationId
            }
        ]).select();
    return { data, error, headers };
}