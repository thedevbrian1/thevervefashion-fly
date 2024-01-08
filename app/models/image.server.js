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

export async function getImages(request) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient.from('Images').select('image_src,product_id');
    return { data, error, headers };
}

export async function getImage(request, productId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Images')
        .select('image_src, id')
        .eq('product_id', productId);
    return { data, error, headers };
}

export async function deletemage(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Images')
        .delete()
        .eq('id', id);
    return { data, error, headers };
}