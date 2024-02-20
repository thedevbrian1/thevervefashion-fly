import { createClient } from "~/supabase.server";
import { getVariationById } from "./variation.server";
import { getImage, getImages } from "./image.server";
import { getCategoryId } from "./category.server";
import { getSession } from "~/session.server";

export async function addProduct(request, title, description, categoryId, price, comparePrice, purchasePrice, quantity) {
    const { supabaseClient, headers } = createClient(request);
    const { data, error } = await supabaseClient.from('Products').insert([
        {
            title,
            description,
            category_id: Number(categoryId),
            price: Number(price),
            compare_price: Number(comparePrice),
            purchase_price: Number(purchasePrice),
            quantity: Number(quantity)
        }
    ]).select();
    return { data, error, headers };
}

export async function getProductById(request, id) {
    const { supabaseClient, headers } = createClient(request);
    // 1. Get product 
    // 3. Get images 
    // 4. Get variations
    const [
        { data: item, error: itemError },
        { data: variation },
        { data: images, error: imagesError }
    ] = await Promise.all([
        supabaseClient
            .from('Products')
            .select(`id,title,description,quantity,price,compare_price,purchase_price, Categories(title)`)
            .eq('id', Number(id)),
        getVariationById(request, Number(id)),
        getImage(request, Number(id))
    ]);

    if (itemError) {
        throw new Error(itemError);
    }

    // TODO: Handle both errors

    const product = item[0];

    const data = { product, variation, images }

    return { data, headers };
}

export async function getProducts(request) {
    const { supabaseClient, headers } = createClient(request);
    const [
        { data: product, error: productError },
        { data: image, error: imageError }
    ] = await Promise.all([
        supabaseClient
            .from('Products')
            .select('id,title,price,compare_price'),
        getImages(request)
    ]);

    // console.log({ product });

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

export async function deleteProduct(request, id) {
    const { supabaseClient, headers } = createClient(request);
    const { status, error } = await supabaseClient
        .from('Products')
        .delete()
        .eq('id', id);
    return { status, error, headers };
}

export async function getCartProducts(request) {
    const session = await getSession(request);
    const cartItems = session.get('cartItems') ?? [];
    const cartItemIds = cartItems.map(item => item.id);

    const { supabaseClient, headers } = createClient(request);

    const [{ data: product, error: productError }, { data: images, error: imageError }] = await Promise.all([
        supabaseClient.from('Products').select('id,title,price').in('id', cartItemIds),
        supabaseClient.from('Images').select('image_src,product_id').in('product_id', cartItemIds)
    ]);
    if (productError) {
        throw new Error(productError);
    }
    if (imageError) {
        throw new Error(imageError);
    }
    const data = { product, images };
    return { data, headers };
}