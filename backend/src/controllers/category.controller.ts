
import { Request, Response } from "express";
import Category from "../models/Category.model";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator";

const makeSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// PUBLIC: Get all active categories
export const getCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};

// PUBLIC: Get one active category by slug
export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
};

// ADMIN: Create category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = createCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid category data",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, description } = parsed.data;

    const category = await Category.create({
      name,
      description,
      slug: makeSlug(name),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
      return;
    }

    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// ADMIN: Update category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = updateCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid category data",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const updates = { ...parsed.data };

    if (updates.name) {
      Object.assign(updates, { slug: makeSlug(updates.name) });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
      return;
    }

    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// ADMIN: Deactivate category instead of deleting it
export const deactivateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate category",
    });
  }
};
