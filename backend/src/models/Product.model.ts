
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  images: {
    url: string;
    publicId: string;
    alt?: string;
  }[];
  category: Types.ObjectId;
  stock: number;
  lowStockThreshold: number;
  variants: {
    name: string;
    options: string[];
  }[];
  tags: string[];
  isFeatured: boolean;
  status: "draft" | "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: {
            type: String,
            default: "",
        },
        alt: { type: String, trim: true },
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    variants: [
      {
        name: { type: String, required: true, trim: true },
        options: [{ type: String, trim: true }],
      },
    ],
    tags: [{ type: String, lowercase: true, trim: true }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Search and filtering indexes
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, status: 1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
