"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  Check,
} from "lucide-react";
import { useProductBySlug } from "@/hooks/useProduct";
import { useCartStore } from "@/store/cartStore";

interface ProductDetailsProps {
  slug: string;
}

export default function ProductDetails({ slug }: ProductDetailsProps) {
  const { data: product, isLoading, isError } = useProductBySlug(slug);

  const addItem = useCartStore((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-14">
        <div className="aspect-[4/5] animate-pulse bg-[#eeece7]" />
        <div className="space-y-5 pt-8">
          <div className="h-4 w-1/3 animate-pulse bg-[#eeece7]" />
          <div className="h-10 w-2/3 animate-pulse bg-[#eeece7]" />
          <div className="h-5 w-1/4 animate-pulse bg-[#eeece7]" />
          <div className="h-20 animate-pulse bg-[#eeece7]" />
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl font-light">Product unavailable.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find this product. It may have been removed.
        </p>
        <Link
          href="/shop"
          className="mt-6 border-b border-foreground pb-1 text-xs uppercase tracking-widest"
        >
          Return to shop
        </Link>
      </main>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[selectedImage];

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG")}`;

  const categoryName =
    typeof product.category === "object"
      ? product.category.name
      : product.category;

  const isOutOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (!product || isOutOfStock) return;

    addItem(product, quantity);
    setAdded(true);

    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-14">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight size={13} />
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight size={13} />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Product images */}
        <section>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#f0eee9]">
            {currentImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Image coming soon
              </div>
            )}

            {product.isFeatured && (
              <span className="absolute left-4 top-4 bg-white px-3 py-2 text-[10px] uppercase tracking-widest">
                Featured
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`aspect-square overflow-hidden border ${
                    selectedImage === index
                      ? "border-foreground"
                      : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product information */}
        <section className="lg:sticky lg:top-10 lg:self-start lg:pt-8">
          {categoryName && (
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {categoryName}
            </p>
          )}

          <h1 className="text-3xl font-light leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-lg">{formatPrice(product.price)}</p>

            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
          </div>

          <div className="my-8 border-t border-border" />

          <p className="text-sm leading-7 text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isOutOfStock ? "bg-red-500" : "bg-green-700"
              }`}
            />
            <span className="text-muted-foreground">
              {isOutOfStock
                ? "Out of stock"
                : product.stock <= 5
                  ? `Only ${product.stock} left`
                  : "In stock"}
            </span>
          </div>

          {/* Quantity selector */}
          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-widest">
              Quantity
            </p>

            <div className="flex h-12 w-36 items-center justify-between border border-border">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-full w-11 items-center justify-center disabled:opacity-30"
              >
                <Minus size={15} />
              </button>

              <span className="text-sm">{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.min(product.stock, value + 1))
                }
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
                className="flex h-full w-11 items-center justify-center disabled:opacity-30"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 bg-[#30352d] px-6 text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#454b40] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? (
              <>
                <Check size={17} />
                Added to cart
              </>
            ) : (
              <>
                <ShoppingBag size={17} />
                {isOutOfStock ? "Out of stock" : "Add to cart"}
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
            Thoughtfully chosen. Made to last.
          </p>

          {product.SKU && (
            <p className="mt-8 text-xs text-muted-foreground">
              SKU: {product.SKU}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}