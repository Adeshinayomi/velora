
import { z } from "zod";

const customerSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(20),
});

const shippingAddressSchema = z.object({
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().min(2).max(100),
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
      quantity: z.number().int().min(1).max(100),
    })
  ).min(1).max(50),
  customer: customerSchema,
  shippingAddress: shippingAddressSchema,
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});
