import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Product, ProductImage } from "astro:db";

//* Definimos un nuevo producto con los valores por defecto para la creacion de un nuevo producto 
const newProduct = {
  id: '',
  description: 'Nueva descripción',
  gender: 'men',
  price: 100,
  sizes: 'XS,S,M',
  slug: 'nuevo-producto',
  stock: 5,
  tags: 'shirt,men, nuevo',
  title: 'Nuevo producto',
  type: 'shirts',
}

export const getProductBySlug = defineAction({
  accept: "json",
  input: z.string(),
  handler: async (slug) => { 
    //* Si el slug es igual a 'new' retornamos un nuevo producto con los valores por defecto
    if (slug === 'new') {
      return {
        product: newProduct,
        images: [],
      }
    }

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
      images,
      // images: images.map((img) => img.image),
    };
  }
});