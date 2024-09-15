import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export class ImageUpload {
  
  static async upload(file: File, folder?: string) {
    try {
      //* Convertir el archivo a un buffer y luego a base64
      const buffer = await file.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      //* Guarda el tipo de archivo (mime type)
      const imageType = file.type.split("/")[1];

      const imageToUpload = `data:image/${imageType};base64,${base64Image}`;

      const result = await cloudinary.uploader.upload(imageToUpload, {
        folder,
      });

      return result.secure_url;
    } catch (error) {
      console.log(error);
      throw new Error(JSON.stringify(error));
    }
  }

  static async delete(imageUrl: string,folder?: string) { 
    try {
      //* Obtiene el nombre de la imagen de la URL de Cloudinary, este es el ID de la imagen que se necesita para eliminarla 
      const imageName = imageUrl.split("/").pop() ?? "";
      const imageId = imageName.split(".")[0];
      console.log({ imageName, imageId });
      
      const pathImage = folder ? `${folder}/${imageId}` : imageId;

      //* Elimina la imagen de Cloudinary 
      const result = await cloudinary.uploader.destroy(pathImage);
      // console.log(result);
      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }
}
