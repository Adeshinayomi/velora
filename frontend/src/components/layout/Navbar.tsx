"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  ShoppingCart
} from "lucide-react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <button
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold tracking-[0.22em]"
        >
          VELORA
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/shop" aria-label="Search" className="hidden sm:block">
            <Search size={19} strokeWidth={1.5} />
          </Link>

          <Link href="/account" aria-label="Account" className="hidden sm:block">
            <UserRound size={19} strokeWidth={1.5} />
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart size={22} />

            {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
                </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-background px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-6">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm tracking-wide"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-sm"
            >
              <Search size={17} />
              Search
            </Link>

            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-sm"
            >
              <UserRound size={17} />
              My account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}