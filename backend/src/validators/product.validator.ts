
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().max(250).optional(),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  tags: z.array(z.string().trim()).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price-low", "price-high"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
