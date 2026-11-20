import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f0eee9]">
        {image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Image coming soon
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute left-3 top-3 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.15em]">
            Featured
          </span>
        )}

        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={17} />
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium tracking-wide">
            {product.name}
          </h3>

          {typeof product.category === "object" && (
            <p className="mt-1 text-xs text-muted-foreground">
              {product.category.name}
            </p>
          )}
        </div>

        <p className="shrink-0 text-sm">
          ₦{product.price.toLocaleString("en-NG")}
        </p>
      </div>
    </Link>
  );
}