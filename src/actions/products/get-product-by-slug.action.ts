import { db, eq, Product, ProductImage } from "astro:db";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const getProductBySlug = defineAction({
  accept: "json",
  input: z.string(),
  handler: async (slug) => { 
    //* Obtenemos el producto por el slug 
    const [product] = await db
      .select()
      .from(Product)
      .where(eq(Product.slug, slug));
    

    if (!product) {
     throw new Error(`Product with slug '${slug}' not found`);
      
    }

    //* Obtenemos las imagenes del producto por el id del producto 
    const images = await db
      .select()
      .from(ProductImage)
      .where(eq(ProductImage.productId, product.id));

    return {
      product,
      images: images.map((img) => img.image),
    };
  }
});