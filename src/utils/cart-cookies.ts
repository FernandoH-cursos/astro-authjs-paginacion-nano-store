import type { CartItem } from "@/interfaces";
import Cookies from "js-cookie";

export class CartCookiesClient {
  static getCart(): CartItem[] {
    //* Permite obtener la cookie cart y si no existe, se crea un arreglo vacío
    const cart = JSON.parse(Cookies.get("cart") ?? "[]");

    return cart;
  }

  static addItem(cartItem: CartItem): CartItem[] {
    const cart = CartCookiesClient.getCart();
    //* Validar si el item ya existe en el carrito tanto por id como por size del producto 
    const itemInCart = cart.find(item => item.productId === cartItem.productId && item.size === cartItem.size);

    if (itemInCart) {
      //* Si el item ya existe, se suma la cantidad del item actual con la cantidad del item en el carrito 
      itemInCart.quantity += cartItem.quantity;
    } else {
      //* Si el item no existe, se agrega el item al carrito 
      cart.push(cartItem);
    }

    //* Se actualiza la cookie cart con el nuevo carrito 
    Cookies.set("cart", JSON.stringify(cart));

    return cart;
  }

  static removeItem(productId: string,size: string): CartItem[] {
    const cart = CartCookiesClient.getCart();

    //* Se filtra el carrito para remover el item que coincida con el id y el size del producto
    const updatedCart = cart.filter(item => !(item.productId === productId && item.size === size));

    //* Se actualiza la cookie cart con el nuevo carrito
    Cookies.set("cart", JSON.stringify(updatedCart));


    return updatedCart;
  }
}
