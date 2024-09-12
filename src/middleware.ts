import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

const notAuthenticatedRoutes = ['/login', '/register'];

export const onRequest = defineMiddleware(
  async ({ url, locals, redirect, request }, next) => {
    //* Sesion de usuario que devuelve un objeto con la información del usuario 
    const session = await getSession(request);
    //* isLoggedIn es un booleano que indica si el usuario está autenticado 
    const isLoggedIn = !!session;

    const user = session?.user;

    locals.isLoggedIn = isLoggedIn;
    locals.user = null;

    if (user) {
      locals.user = {
        name: user.name!,
        email: user.email!,
      };

      //* Setea un booleano que indica si el usuario es administrador 
      locals.isAdmin = user.role === 'admin';
    }

    //* Si el usuario no es administrador y la ruta comienza con '/dashboard', redirige a la página de inicio
    if (!locals.isAdmin && url.pathname.startsWith('/dashboard')) {
      return redirect('/');
    }

    //* Si el usuario está autenticado y la ruta no está en 'notAuthenticatedRoutes', redirige a la página de inicio
    if (isLoggedIn && notAuthenticatedRoutes.includes(url.pathname)) {
      return redirect('/');
    }

    return next();
  }
);
