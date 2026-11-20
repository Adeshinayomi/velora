import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-[#eae7df] sm:min-h-[700px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(20,20,17,0.58), rgba(20,20,17,0.05)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=85')",
        }}
      />

      <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] items-center px-6 py-20 sm:min-h-[700px] sm:px-12 lg:px-20">
        <div className="max-w-xl text-white">
          <p className="mb-6 text-[10px] tracking-[0.3em] sm:text-xs">
            THE VELORA COLLECTION
          </p>

          <h1 className="text-5xl font-light leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Less, but
            <br />
            better.
          </h1>

          <p className="mt-7 max-w-sm text-sm leading-7 text-white/80 sm:text-base">
            Discover thoughtfully selected essentials that bring
            simplicity, purpose and lasting quality into everyday life.
          </p>

          <Link
            href="/shop"
            className="mt-9 inline-flex items-center gap-5 border border-white px-7 py-4 text-[10px] tracking-[0.18em] transition-colors hover:bg-white hover:text-black"
          >
            EXPLORE THE COLLECTION
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}