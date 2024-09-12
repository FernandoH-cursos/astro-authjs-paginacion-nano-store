import { useMemo, useState } from "react";
import type { ProductWithImage } from "@/interfaces";

interface Props{
  product: ProductWithImage;
}

export const ProductCard = ({ product }: Props) => {
  //* Guardando las 2 imagenes del producto en un arreglo 
  const images = useMemo(() => {
    return product.images.split(",").map((img) => {
      return img.startsWith("http")
        ? img
        : `${import.meta.env.PUBLIC_URL}/images/products/${img}`;
    });
  },[product.images]);

  const [currentImage, setCurrentImage] = useState(images[0]);
  const [fade, setFade] = useState(false);

  const handleMouseEnter = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentImage(images[1] ?? images[0]);
      setFade(false);
    }, 400); // Tiempo de la transición
  };

  const handleMouseLeave = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentImage(images[0]);
      setFade(false);
    }, 400); // Tiempo de la transición
  };

  return (
    <a href={`/products/${product.slug}`}>
      <img
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`h-[350px] object-contain transition-opacity ${fade ? 'opacity-20' : 'opacity-100'}`}
        src={currentImage}
        alt={product.title}
      />

      <h4>{product.title}</h4>
      <p>{product.price}</p>
    </a>
  );
};
