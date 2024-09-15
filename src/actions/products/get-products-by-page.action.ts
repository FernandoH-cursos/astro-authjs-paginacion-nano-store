import { count, db, Product, ProductImage, sql } from "astro:db";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

import type { ProductWithImage } from "@/interfaces";


export const getProductsByPage = defineAction({
  accept: "json",
  input: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),
  handler: async ({ page, limit }) => {
    //* Valida que si el numero de pagina es menor o igual a 0, se establezca en 1 sino se mantiene el valor
    page = page <= 0 ? 1 : page;
    
    //* Obtiene la cantidad total de productos
    const [totalRecords] = await db.select({ count: count() }).from(Product);
    //* Calcula el total de paginas de productos
    const totalPages = Math.ceil(totalRecords.count / limit);
    // console.log({page, totalPages});
    
    if (page > totalPages) {
      return {
        products: [] as ProductWithImage[],
        totalPages,
      };
    }
    //* Obtiene los productos de la pagina actual con el limite establecido. Ademas se realiza un inner join
    //* con la tabla de imagenes de productos.
    
    //* limit() permite establecer el limite de registros a obtener de la tabla de productos
    //* offset() permite establecer el numero de registros a omitir antes de obtener los registros 
    // const products = await db
    //   .select()
    //   .from(Product)
    //   .innerJoin(ProductImage,eq(Product.id,ProductImage.productId))
    //   .limit(limit)
    //   .offset((page - 1) * 12);
    
    const offset = (page - 1) * limit;
    
    //* Consulta SQL para obtener los productos de la pagina actual con el limite establecido.
    //* Ademas se usa GROUP_CONCAT para concatenar las imagenes de los productos en un solo campo. 
    //* Se usa LIMIT y OFFSET para establecer el limite de registros a obtener y el numero de registros a omitir.  
    //* Se limita a 2 imagenes por producto.
    //* Se usa el alias 'a' para referenciar a la tabla de productos.
    //* Se usa el alias 'images' para referenciar a la columna de imagenes concatenadas.
    //* Se usan 2 subconsultas para obtener las imagenes de los productos. 
    const productsQuery = sql`
      SELECT a.*,
      ( SELECT GROUP_CONCAT(image,',') FROM 
        ( SELECT * FROM ${ProductImage} WHERE productId = a.id LIMIT 2 )
      ) as images
      FROM ${Product} a
      LIMIT ${limit} OFFSET ${offset};
    `;

    //* Ejecuta la consulta SQL y obtiene los registros de productos 
    const { rows } = await db.run(productsQuery);
    // console.log(rows);

    //* Nos permite agregar la imagen por defecto en caso de que no exista una imagen para el 
    //* producto(evitamos el error de imagen no encontrada) 
    const products = rows.map((product) => {
      return {
        ...product,
        images: product.images ? product.images : "no-image.png",
      };
    }) as unknown as ProductWithImage[];

    return {
      products,
      totalPages,
    };
  },
});
