import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product, ProductsResponse } from "@/types/product";

interface ProductQuery
  extends Record<string, string | number | boolean | undefined> {
  limit?: number;
  page?: number;
  sort?: "newest" | "price-low" | "price-high";
  category?: string;
  search?: string;
}

export function useProducts(params: ProductQuery = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await api<ProductsResponse>("/products", {
        params,
      });

      console.log("PRODUCT API RESPONSE:", response);

      return response.products;
    },
  });
}
export function useFeaturedProducts() {
  const query = useProducts({ limit: 8, sort: "newest" });

  return {
    ...query,
    data: query.data?.filter((product: Product) => product.isFeatured),
  };
}
interface ProductResponse {
  success: boolean;
  message?: string;
  product: Product;
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await api<ProductResponse>(
        `/products/slug/${encodeURIComponent(slug)}`
      );

      return response.product;
    },
    enabled: Boolean(slug),
  });
}