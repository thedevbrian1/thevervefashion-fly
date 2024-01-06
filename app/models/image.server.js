import { createClient } from "~/supabase.server";

export async function addImage(request, imageSrc, productId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Images')
        .insert([
            {
                image_src: imageSrc,
                product_id: productId
            }
        ])
        .select();

    return { data, error, headers };
}