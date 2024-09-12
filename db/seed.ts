import { db, Product, ProductImage, Role, User } from "astro:db";

import { v4 as UUID } from 'uuid';
import bcrypt from 'bcryptjs';
import { seedProducts } from "./seed-data";

// https://astro.build/db/seed
export default async function seed() {
  const roles = [
    { id: 'admin', name: 'Administrador' },
    { id: 'user', name: 'Usuario de sistema' },
  ];

  const johnDoe = {
    id: UUID(),
    name: 'John Doe',
    email: 'john.doe@google.com',
    password: bcrypt.hashSync('123456'),
    role: 'admin',
  };

  const janeDoe = {
    id: UUID(),
    name: 'Jane Doe',
    email: 'jane.doe@google.com',
    password: bcrypt.hashSync('123456'),
    role: 'user',
  };

  await db.insert(Role).values(roles);
  await db.insert(User).values([johnDoe, janeDoe]);

  const queries: any = [];

  seedProducts.forEach(p => {
    const product = {
      id: UUID(),
      description: p.description,
      gender: p.gender,
      price: p.price,
      sizes: p.sizes.join(','),
      slug: p.slug,
      stock: p.stock,
      tags: p.tags.join(','),
      title: p.title,
      type: p.type,
      user: johnDoe.id,
    }

    //* Inserta el producto y guarda la promesa en el array de queries 
    queries.push(db.insert(Product).values(product));

    p.images.forEach(img => {
      const productImage = {
        id: UUID(),
        image: img,
        productId: product.id,
      };

      //* Inserta la imagen del producto y guarda la promesa en el array de queries 
      queries.push(db.insert(ProductImage).values(productImage));
    });
  });

  //* Ejecuta todas las promesas en paralelo insertando los productos eb la base de datos 
  await db.batch(queries);
}
