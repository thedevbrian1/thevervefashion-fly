import { createClient } from "~/supabase.server";
import { getVariationById } from "./variation.server";
import { getImage, getImages } from "./image.server";

export async function addProduct(request, title, description, categoryId) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient.from('Products').insert([
        {
            title,
            description,
            category_id: categoryId
        }
    ]).select();
    return { data, error, headers };
}

export async function getProductById(request, id) {
    const { supabaseClient, headers } = createClient(request);
    // 1. Get product and productId
    // 2. Get product item
    // 3. Get images 
    // 4. Get variations
    const [
        { data: product, error: productError },
        { data: variation, error: variationError },
        { data: images, error: imagesError }
    ] = await Promise.all([
        supabaseClient
            .from('Product_item')
            .select(`quantity,price,compare_price,purchase_price, Products(title,description,Categories(title))`)
            .eq('product_id', Number(id)),
        getVariationById(request, Number(id)),
        getImage(request, Number(id))
    ]);


    // TODO: Handle both errors
    const data = { ...product[0], variation, images }

    return { data, error: productError, headers };
}

export async function getProducts(request) {
    const { supabaseClient, headers } = createClient(request);
    const [
        { data: product, error: productError },
        { data: image, error: imageError }
    ] = await Promise.all([
        supabaseClient
            .from('Product_item')
            .select('price,compare_price,product_id,Products(title)'),
        getImages(request)
    ]);
    const data = { product, image };
    return { data, error: productError, headers };
}