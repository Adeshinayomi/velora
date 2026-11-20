import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14">
      <div className="grid overflow-hidden bg-[#30352d] text-white md:grid-cols-2">
        <div className="flex flex-col justify-center px-7 py-14 sm:px-14 sm:py-20">
          <p className="mb-5 text-[10px] tracking-[0.25em] text-white/60">
            A DIFFERENT WAY TO SHOP
          </p>

          <h2 className="max-w-md text-4xl font-light leading-tight sm:text-5xl">
            Make space for what matters.
          </h2>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
            We believe the things we bring into our lives should
            serve a purpose, feel considered and stand the test of time.
          </p>

          <Link
            href="/about"
            className="mt-9 inline-flex w-fit items-center gap-4 border-b border-white/50 pb-3 text-xs tracking-widest transition-colors hover:border-white"
          >
            OUR PHILOSOPHY
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="min-h-[350px] bg-[#77796e]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
            alt="Thoughtfully designed living space"
            className="h-full min-h-[350px] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}