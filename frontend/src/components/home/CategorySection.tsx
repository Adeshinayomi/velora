import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "Everyday Essentials",
    description: "Considered pieces for everyday living.",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85",
    href: "/shop",
  },
  {
    name: "Lifestyle",
    description: "Make room for what matters.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    href: "/shop",
  },
  {
    name: "Accessories",
    description: "The details make the difference.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    href: "/shop",
  },
];

export default function CategorySection() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-3 text-[10px] tracking-[0.22em] text-muted-foreground">
            EXPLORE VELORA
          </p>

          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">
            Find your essentials.
          </h2>
        </div>

        <Link
          href="/shop"
          className="hidden items-center gap-2 text-xs sm:flex"
        >
          View all <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            href={category.href}
            key={category.name}
            className="group"
          >
            <div className="aspect-[4/5] overflow-hidden bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}