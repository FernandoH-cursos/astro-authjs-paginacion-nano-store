import { defineConfig } from "auth-astro";
import { db, eq, User } from "astro:db";

import Credentials from "@auth/core/providers/credentials";
import type { AdapterUser } from "@auth/core/adapters";

import bcrypt from 'bcryptjs';

export default defineConfig({
  providers: [
    //* Credentials() permite iniciar sesión con un correo y contraseña
    Credentials({
      //* 'credentials' es un objeto que contiene los campos que se van a solicitar al usuario
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      //* 'authorize()' es una función que se ejecuta cuando el usuario intenta iniciar sesión 
      authorize: async ({ email, password }) => {
        const [user] = await db.select().from(User).where(eq(User.email, email as string));

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        if (!bcrypt.compareSync(password as string, user.password)) {
          throw new Error("Contraseña incorrecta");
        }

        const { password: _, ...userData } = user;
        // console.log({userData});

        return userData;
      },
    }),
  ],
  //* 'callbacks' es un objeto que contiene funciones que se ejecutan en diferentes momentos del flujo de autenticación
  callbacks: {
    //* 'jwt' es una función que se ejecuta cuando el usuario inicia sesión y devuelve un token JWT 
    jwt: ({ token, user }) => {
      if (user) {
        //* Asigna el usuario al token JWT 
        token.user = user;
      }

      return token;
    },
    //* 'session' es una función que se ejecuta cuando el usuario inicia sesión y devuelve un objeto con la información del usuario 
    session({ session, token }) {
      //* Asigna el usuario al objeto de sesión con mayor información 
      session.user = token.user as AdapterUser;
      
      return session;
    },
  }
});
