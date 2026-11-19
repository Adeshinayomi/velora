
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.model";
import {
  uploadImage,
  deleteImage,
} from "../services/cloudinary.service";


export const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const uploadedImages: {
    url: string;
    publicId: string;
  }[] = [];

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please select at least one image",
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (product.images.length + files.length > 5) {
      res.status(400).json({
        success: false,
        message: "A product can have a maximum of 5 images",
      });
      return;
    }

    // Upload sequentially so we can track every successful upload.
    for (const file of files) {
      const image = await uploadImage(file, "velora/products");
      uploadedImages.push(image);
    }

    product.images.push(
      ...uploadedImages.map((image) => ({
        url: image.url,
        publicId: image.publicId,
        alt: product.name,
      }))
    );

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product images uploaded successfully",
      data: product.images,
    });
  } catch (error) {
    // Roll back Cloudinary uploads if the operation fails.
    const cleanupResults = await Promise.allSettled(
      uploadedImages.map((image) => deleteImage(image.publicId))
    );

    cleanupResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Cloudinary cleanup failed:", result.reason);
      }
    });

    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, publicId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const image = product.images.find(
      (item) => item.publicId === publicId
    );

    if (!image) {
      res.status(404).json({
        success: false,
        message: "Image not found on this product",
      });
      return;
    }

    product.images = product.images.filter(
    (item) => item.publicId !== image.publicId
    );

    await product.save();

    try {
        if (image.publicId) {
        await deleteImage(image.publicId);
        }
    } catch (error) {
    console.error("Cloudinary image cleanup failed:", error);

    res.status(200).json({
        success: true,
        message: "Image removed from product, but Cloudinary cleanup is pending",
        cleanupPending: true,
        data: product.images,
    });
    return;
}

    res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
      data: product.images,
    });
  } catch (error) {
    next(error);
  }
};
