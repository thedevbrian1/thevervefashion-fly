import { createClient } from "~/supabase.server";
import { getVariationById } from "./variation.server";
import { getImage, getImages } from "./image.server";
import { getCategoryId } from "./category.server";

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
            .select(`quantity,price,compare_price,purchase_price,product_id, Products(title,description,Categories(title))`)
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

export async function getCategorizedProducts(request, category) {
    const { supabaseClient, headers } = createClient(request);
    const { data: categories, error: categoryError } = await getCategoryId(request, category);
    const categoryId = categories[0].id;

    const { data: productIds, error: productIdError } = await supabaseClient
        .from('Products')
        .select('id')
        .eq('category_id', categoryId);

    const products = await Promise.all(productIds.map(async (productId) => {
        const { data, error } = await getProductById(request, productId.id);
        return { data, error };
    }));
    return { data: products, headers };
}