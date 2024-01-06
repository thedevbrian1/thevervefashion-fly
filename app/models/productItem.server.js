import { createClient } from "~/supabase.server";

export async function addProductItem(request, productId, quantity, price, comparePrice, purchasePrice, sku) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient
        .from('Product_item')
        .insert([
            {
                product_id: productId,
                quantity,
                price,
                compare_price: comparePrice,
                purchase_price: purchasePrice,
                sku
            }
        ]).select();
    return { data, error, headers };
}