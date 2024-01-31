import { json, redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { addImage } from "~/models/image.server";
import { uploadImage } from "~/services/cloudinary.server";
import { getSession, sessionStorage, setSuccessMessage } from "~/session.server";

export async function action({ request }) {
    const uploadHandler = unstable_composeUploadHandlers(
        async ({ name, data }) => {
            if (name !== "image") {
                return undefined;
            }
            // TODO: Don't upload image if there is a validation error
            const uploadedImage = await uploadImage(data);
            // console.log({ uploadedImage });
            return uploadedImage.secure_url;
            // return null;
        },
        unstable_createMemoryUploadHandler()
    );
    const session = await getSession(request);

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const image = formData.getAll('image');
    const productId = formData.get('productId');
    const redirectTo = formData.get('redirectTo');

    const imageResponse = await Promise.all(image.map(async (image) => {
        const { data, error, headers } = await addImage(request, image, productId);
        return { data, error, headers };
    }));

    setSuccessMessage(session, 'Added successfully!');
    const allHeaders = { ...Object.fromEntries(imageResponse[0].headers.entries()), "Set-Cookie": await sessionStorage.commitSession(session) };
    return redirect(redirectTo, {
        headers: allHeaders
    });
}