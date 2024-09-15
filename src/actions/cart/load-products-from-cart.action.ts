import { defineAction } from "astro:actions";
import { db, eq, inArray, Product, ProductImage } from "astro:db";
import { z } from "astro:schema";

import type { CartItem } from "@/interfaces";


export const loadProductsFromCart = defineAction({
  accept: "json",
  input: z.object({
    cookies: z.string(),
  }),
  handler: async ({ cookies }) => {
    //* Se obtiene los productos del carrito desde las cookies
    const cart = JSON.parse(cookies) as CartItem[];
    if (cart.length === 0) return [];
    
    //* Ids de los productos
    const productIds = cart.map(({ productId }) => productId);

    //* Se obtienen los productos de la base de datos en base a los ids del carrito
    //* 'inArray' es una función de utilidad que permite hacer una consulta con un array de valores en un campo, es decir, se
    //* obtienen los productos cuyo id esté en el array de ids.
    const dbProducts = await db
      .select()
      .from(Product)
      .innerJoin(ProductImage, eq(Product.id, ProductImage.productId))
      .where(inArray(Product.id, productIds));
    
    return cart.map(item => {
      //* Se busca el producto en la lista de productos de la base de datos 
      const dbProduct = dbProducts.find(p => p.Product.id === item.productId);
      //* Validación de que el producto exista en la base de datos 
      if (!dbProduct) {
        throw new Error(`Product with id ${item.productId} not found`);
      };

      const {title,price} = dbProduct.Product;
      const image = dbProduct.ProductImage.image;

      return {
        productId: item.productId,
        title: title,
        size: item.size,
        quantity: item.quantity,
        image: image.startsWith("http") ? image : `${import.meta.env.PUBLIC_URL}/images/products/${image}`,
        price: price,
        slug: dbProduct.Product.slug,
      }
    });
  },
});