"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Handles the case where hydration has already completed.
    if (useCartStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG")}`;

  if (!isHydrated) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14">
          <div className="h-8 w-40 animate-pulse bg-[#eeece7]" />
          <div className="mt-10 h-40 animate-pulse bg-[#eeece7]" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-14">
        {/* Heading */}
        <div className="mb-12">
          <p className="mb-3 text-[10px] tracking-[0.22em] text-muted-foreground">
            YOUR SELECTION
          </p>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
              Your bag.
            </h1>

            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty cart */
          <section className="flex min-h-[40vh] flex-col items-center justify-center border-y border-border py-16 text-center">
            <ShoppingBag
              size={34}
              strokeWidth={1}
              className="mb-6 text-muted-foreground"
            />

            <h2 className="text-2xl font-light">Your bag is empty.</h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              It looks like you haven't discovered your next favourite
              essential yet.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex h-12 items-center gap-3 bg-[#30352d] px-7 text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#454b40]"
            >
              Explore the collection
              <ArrowRight size={15} />
            </Link>
          </section>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            {/* Cart items */}
            <section>
              <div className="hidden grid-cols-[1fr_120px_110px] border-b border-border pb-4 text-[10px] uppercase tracking-widest text-muted-foreground sm:grid">
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <div className="divide-y divide-border">
                {items.map(({ product, quantity }) => {
                  const image = product.images?.[0];

                  return (
                    <article
                      key={product._id}
                      className="grid gap-5 py-7 sm:grid-cols-[1fr_120px_110px] sm:items-center"
                    >
                      {/* Product information */}
                      <div className="flex min-w-0 gap-5">
                        <Link
                          href={`/product/${product.slug}`}
                          className="h-32 w-24 shrink-0 overflow-hidden bg-[#f0eee9] sm:h-36 sm:w-28"
                        >
                          {image?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image.url}
                              alt={image.alt || product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </Link>

                        <div className="flex min-w-0 flex-col items-start py-1">
                          <Link
                            href={`/product/${product.slug}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {product.name}
                          </Link>

                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatPrice(product.price)}
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            {product.stock > 0
                              ? "Available"
                              : "Stock needs checking"}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeItem(product._id)}
                            className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground transition-colors hover:text-red-600"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center sm:justify-center">
                        <div className="flex h-10 items-center border border-border">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product._id, quantity - 1)
                            }
                            disabled={quantity <= 1}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="flex h-full w-9 items-center justify-center disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="w-7 text-center text-xs">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product._id, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="flex h-full w-9 items-center justify-center disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="text-right text-sm font-medium">
                        <span className="sm:hidden text-xs font-normal text-muted-foreground">
                          Item total:{" "}
                        </span>
                        {formatPrice(product.price * quantity)}
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={14} />
                Continue shopping
              </Link>
            </section>

            {/* Order summary */}
            <aside className="h-fit bg-[#f1f0eb] p-6 sm:p-8">
              <h2 className="text-lg font-light">Order summary.</h2>

              <div className="mt-8 space-y-5 border-b border-neutral-300 pb-6 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-xs text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-4 py-6">
                <span className="text-sm font-medium">Estimated total</span>
                <span className="text-sm font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="flex h-14 w-full items-center justify-center gap-3 bg-[#30352d] text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#454b40]"
              >
                Proceed to checkout
                <ArrowRight size={15} />
              </Link>

              <p className="mt-5 text-center text-[11px] leading-5 text-muted-foreground">
                Shipping and final order total will be confirmed at checkout.
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}