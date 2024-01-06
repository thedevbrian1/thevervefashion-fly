import { createClient } from "~/supabase.server";

export async function addVariation(request, title, productId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Variations')
        .insert([
            {
                title,
                product_id: productId
            }
        ]).select();
    return { data, error, headers };
}

export async function getVariationById(request, id) {
    const { supabaseClient, headers } = createClient(request);

    const { data: variation, error: variationError } = await supabaseClient.from('Variations').select('title, id').eq('product_id', id);

    const variationIds = variation.map(variation => variation.id);

    const variationOptions = await Promise.all(variationIds.map(async (variation, index) => {
        const { data, error } = await supabaseClient.from('Variation_options').select('value').eq('variation_id', variation)
        return { data, error };
    }));

    const variationValues = variationOptions.map(option => option.data);

    const newdata = { variation, variationValues };
    return { data: newdata, error: variationError, headers };
}