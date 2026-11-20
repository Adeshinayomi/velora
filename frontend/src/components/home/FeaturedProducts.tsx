"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFeaturedProducts } from "./../../hooks/useProduct";
import ProductCard from "../product/ProductCard";
export default function FeaturedProducts() {
  const { data: products, isLoading, isError } = useFeaturedProducts();

  return (
    <section className="bg-[#f1f0eb] py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] tracking-[0.22em] text-muted-foreground">
              THE SELECTION
            </p>

            <h2 className="text-3xl font-light tracking-tight sm:text-4xl">
              Thoughtfully selected.
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-2 text-xs sm:flex"
          >
            Explore all <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="aspect-[4/5] animate-pulse bg-white" />
                <div className="mt-4 h-4 w-2/3 animate-pulse bg-white" />
                <div className="mt-2 h-3 w-1/3 animate-pulse bg-white" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            We couldn't load the products. Please try again later.
          </p>
        )}

        {!isLoading && !isError && products?.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No featured products available at the moment.
          </p>
        )}

        {products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}