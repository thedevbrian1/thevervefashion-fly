import { createClient } from "~/supabase.server";
import { getVariationById } from "./variation.server";

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
    const [{ data: product, error: productError }, { data: variation, error: variationError }] = await Promise.all([
        supabaseClient
            .from('Product_item')
            .select(`quantity,price,compare_price,purchase_price, Products(title,description,Categories(title))`)
            .eq('product_id', Number(id)),
        getVariationById(request, id)
    ]);


    // TODO: Handle both errors
    const data = { ...product[0], variation }

    return { data, error: productError, headers };
}