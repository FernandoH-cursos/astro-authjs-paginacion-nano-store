import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, ProductImage } from "astro:db";

import { getSession } from "auth-astro/server";

import { ImageUpload } from "@/utils/image-upload";

export const deleteProductImage = defineAction({
  accept: "json",
  input: z.string(),
  handler: async (imageId, { request }) => {
    //* Obtener la sesion del usuario
    const session = await getSession(request);
    const user = session?.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    //* Verificar que la imagen exista 
    const [productImage] = await db
      .select()
      .from(ProductImage)
      .where(eq(ProductImage.id, imageId));

    if (!productImage) {
      throw new Error(`Image with id '${imageId}' not found`);
    }

    //* Eliminar la imagen de la base de datos
    await db
      .delete(ProductImage)
      .where(eq(ProductImage.id, imageId));
    
    //* Elimina la imagen de Cloudinary si es que la imagen es una URL 
    if (productImage.image.includes("http")) {
      await ImageUpload.delete(productImage.image, "astro-curso");
    }
    
    return {
      success: true,
    }
  },
});