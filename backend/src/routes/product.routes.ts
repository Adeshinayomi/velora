import { Router } from "express";
import upload from "../middleware/upload.middleware";
import {
  uploadProductImages,
  deleteProductImage,
} from "../controllers/productImage.controller";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  archiveProduct,
} from "../controllers/product.controller";
import { protect, authorizeAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);

router.post(
  "/:id/images",
  protect,
  authorizeAdmin,
  upload.array("images", 5),
  uploadProductImages
);

router.delete(
  "/:id/images/:publicId",
  protect,
  authorizeAdmin,
  deleteProductImage
);

// Admin-only routes
router.post("/", protect, authorizeAdmin, createProduct);
router.patch("/:id", protect, authorizeAdmin, updateProduct);
router.delete("/:id", protect, authorizeAdmin, archiveProduct);

export default router;
