export interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  SKU: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: ProductCategory | string;
  stock: number;
  isFeatured: boolean;
  status: "draft" | "active" | "archived";
}

export interface ProductsResponse {
  success: boolean;
  message?: string;
  products: Product[];
}