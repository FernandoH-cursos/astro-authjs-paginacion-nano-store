import { defineAction } from "astro:actions";
import { db, eq, Product, ProductImage } from "astro:db";
import { z } from "astro:schema";

import { getSession } from 'auth-astro/server';

import { ImageUpload } from "@/utils/image-upload";
import { v4 as UUID } from 'uuid';

//* Permite subir archivos de hasta 5MB 
const MAX_FILE_SIZE = 5_000_000;
//* Permite aceptar solo archivos de tipo imagen como jpg, jpeg, png, webp y svg 
const ACCEPTED_IMAGE_TYPES = ['image/jpeg','image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

export const createUpdateProduct = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().optional(),
    description: z.string(),
    gender: z.string(),
    price: z.number(),
    sizes: z.string(),
    slug: z.string(),
    stock: z.number(),
    tags: z.string(),
    title: z.string(),
    type: z.string(),

    //? Valida que sea un arreglo de archivos de tipo imagen
    imageFiles: z.array(
      z.instanceof(File)
        //* Valida que el tamaño del archivo sea menor o igual a 5MB 
        .refine((file) => file.size <= MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1_000_000}MB`)
        //* Valida que el tipo del archivo sea una imagen 
        .refine((file) => {
          if(file.size === 0) return true;

          return ACCEPTED_IMAGE_TYPES.includes(file.type), `Image file type must be one of ${ACCEPTED_IMAGE_TYPES.join(',')}`
        })
    ).optional(),
  }),
  handler: async (form, { request }) => {
    //* Obtener la sesion del usuario
    const session = await getSession(request);
    const user = session?.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { id = UUID(), imageFiles, ...data } = form;
    //* Formatear el slug para que sea en minusculas y sin espacios
    data.slug = data.slug.toLowerCase().replace(/ /g, "_").trim();

    const product = {
      id: id,
      user: user.id!,
      ...data,
    };

    //* Array de queries para insertar o actualizar el producto
    const queries: any = [];

    //* Si no hay un id se inserta un nuevo producto, de lo contrario se actualiza el producto con el id proporcionado
    if (!form.id) {
      //* Inserta el producto y guarda la promesa en el array de queries
      queries.push(db.insert(Product).values(product));
    } else {
      //* Actualiza el producto y guarda la promesa en el array de queries
      queries.push(db.update(Product).set(product).where(eq(Product.id, id)));
    }

    //? Imagenes
    const secureUrls: string[] = [];

    //* Validar si hay imagenes cargadas en el formulario
    if (
      form.imageFiles &&
      form.imageFiles.length > 0 &&
      form.imageFiles[0].size > 0
    ) {
      //* Subimos todas las imagenes cargadas del producto a cloudinary y guardamos las urls en un array
      const urls = await Promise.all(
        form.imageFiles.map(async (file) =>
          ImageUpload.upload(file, "astro-curso")
        )
      );

      //* Guardamos las urls de las imagenes en el array de imagenes del producto
      secureUrls.push(...urls);
    }

    //* Inserta la imagen del producto y guarda la promesa en el array de queries
    secureUrls.forEach((url) => {
      const productImage = {
        id: UUID(),
        image: url,
        productId: product.id,
      };

      queries.push(db.insert(ProductImage).values(productImage));
    });

    //* Ejecutar todas las promesas de queries para insertar o actualizar el producto
    await db.batch(queries);


    return product;
  },
});