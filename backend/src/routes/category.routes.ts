
import { Router } from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deactivateCategory,
} from "../controllers/category.controller";
import { protect, authorizeAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);

// Admin-only routes
router.post("/", protect, authorizeAdmin, createCategory);
router.patch("/:id", protect, authorizeAdmin, updateCategory);
router.delete("/:id", protect, authorizeAdmin, deactivateCategory);

export default router;
