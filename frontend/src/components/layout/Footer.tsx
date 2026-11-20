"use client"
import Link from "next/link";

const footerLinks = {
  Explore: [
    { label: "Shop", href: "/shop" },
    { label: "About Velora", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "My Account", href: "/account" },
    { label: "Cart", href: "/cart" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#242720] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 lg:px-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-3xl font-semibold tracking-[0.2em]"
            >
              VELORA
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
              Thoughtfully chosen essentials for a more considered
              everyday life.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-5 text-xs tracking-[0.15em]">
                {heading.toUpperCase()}
              </h3>

              <div className="flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/15 pt-7 text-xs text-white/45 sm:flex-row">
         <p>© 2026 Velora. All rights reserved.</p>
          <p>Thoughtfully chosen. Made to last.</p>
        </div>
      </div>
    </footer>
  );
}