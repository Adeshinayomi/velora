
import { Request, Response } from "express";
import Product from "../models/Product.model";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../validators/product.validator";

const makeSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// PUBLIC: Get products with search, filters and pagination
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = productQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product filters",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    } = parsed.data;

    const filter: Record<string, unknown> = { status: "active" };

    if (category) filter.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      filter.price = priceFilter;
    }

    if (search?.trim()) {
      filter.$text = { $search: search.trim() };
    }

    const sortOptions: Record<string, 1 | -1> =
      sort === "price-low"
        ? { price: 1 }
        : sort === "price-high"
          ? { price: -1 }
          : { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
    });
  }
};

// PUBLIC: Get one active product by its slug
export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "active",
    }).populate("category", "name slug");

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

// ADMIN: Create a product
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parsed.data;
    const slug = makeSlug(data.name);
    const sku = `VEL-${Date.now().toString(36).toUpperCase()}`;

    const product = await Product.create({
      ...data,
      slug,
      sku,
      images: [],
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
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
        message: "A product with this unique value already exists",
      });
      return;
    }

    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// ADMIN: Update a product
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const updates = { ...parsed.data };

    if (updates.name) {
      Object.assign(updates, { slug: makeSlug(updates.name) });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// ADMIN: Archive a product instead of permanently deleting it
export const archiveProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    console.error("Archive product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive product",
    });
  }
};
