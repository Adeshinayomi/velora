"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProduct";

type SortOption = "newest" | "price-low" | "price-high";

export default function ShopPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProducts({
    limit: 24,
    search: search || undefined,
    sort,
  });

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* Page heading */}
        <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 sm:px-8 sm:pt-24 lg:px-14">
          <p className="mb-4 text-[10px] tracking-[0.22em] text-muted-foreground">
            THE VELORA COLLECTION
          </p>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
                Shop all.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Thoughtfully chosen essentials for everyday living.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              {products?.length ?? 0} products
            </p>
          </div>
        </section>

        {/* Search and sorting */}
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-md items-center border-b border-neutral-400 pb-2"
            >
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                className="ml-3 text-xs uppercase tracking-widest"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-3">
              <label
                htmlFor="sort"
                className="text-xs text-muted-foreground"
              >
                Sort by
              </label>

              <select
                id="sort"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="bg-transparent text-xs outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product listing */}
        <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
          {isLoading && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-[4/5] animate-pulse bg-[#eeece7]" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse bg-[#eeece7]" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse bg-[#eeece7]" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="py-20 text-center">
              <p className="text-sm text-muted-foreground">
                We couldn't load the products.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 border-b border-foreground pb-1 text-xs"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && products?.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-xl font-light">No products found.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another search.
              </p>
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="mt-5 border-b border-foreground pb-1 text-xs"
              >
                Clear search
              </button>
            </div>
          )}

          {!isLoading && !isError && products && products.length > 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}