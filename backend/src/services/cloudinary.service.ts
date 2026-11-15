
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

interface UploadImageResult {
  url: string;
  publicId: string;
}

export const uploadImage = (
  file: Express.Multer.File,
  folder: string
): Promise<UploadImageResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1600, height: 1600, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error("Image upload failed"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteImage = async (
  publicId: string
): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Could not delete Cloudinary image: ${publicId}`);
  }
};
