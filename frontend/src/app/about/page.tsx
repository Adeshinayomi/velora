
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const values = [
  {
    number: "01",
    title: "Thoughtful selection",
    description:
      "We believe good products earn their place. Every choice should serve a purpose, feel considered, and add something meaningful to everyday life.",
  },
  {
    number: "02",
    title: "Less, but better",
    description:
      "Rather than chasing more, we focus on the things worth keeping. A considered collection makes choosing easier and living simpler.",
  },
  {
    number: "03",
    title: "Made for everyday",
    description:
      "The things we use every day deserve attention. We value practical design, lasting appeal, and details that make a difference.",
  },
];

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="bg-background text-foreground">
        {/* Hero */}
        <section className="px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-7xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Our philosophy
            </p>

            <h1 className="max-w-5xl text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl md:text-7xl">
              A more considered way to live.
            </h1>

            <div className="mt-10 grid gap-8 md:grid-cols-2 md:items-end">
              <p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
                Velora is built around a simple idea: everyday things should
                be thoughtfully chosen, beautifully considered, and made to
                matter.
              </p>

              <p className="max-w-md text-sm leading-7 text-muted-foreground md:ml-auto">
                We bring together a considered collection of everyday
                essentials, with an appreciation for simplicity, function,
                and timeless design.
              </p>
            </div>
          </div>
        </section>

        {/* Editorial image */}
        <section className="px-5 md:px-10">
          <div
            role="img"
            aria-label="Minimal, warm-toned contemporary interior"
            className="mx-auto min-h-[360px] max-w-7xl bg-cover bg-center md:min-h-[600px]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85')",
            }}
          />
        </section>

        {/* Story */}
        <section className="px-5 py-24 md:px-10 md:py-36">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:gap-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                The Velora approach
              </p>

              <h2 className="mt-6 text-3xl font-medium leading-tight tracking-tight md:text-5xl">
                Intentional choices.
                <br />
                Everyday meaning.
              </h2>
            </div>

            <div className="space-y-6 text-sm leading-8 text-muted-foreground md:pt-10 md:text-base">
              <p>
                We created Velora for people who appreciate the details.
                The objects we choose, the spaces we create, and the things
                we reach for every day all shape how we experience life.
              </p>

              <p>
                Our approach is simple: focus on quality, thoughtful design,
                and usefulness. We want shopping to feel less overwhelming
                and more intentional.
              </p>

              <p>
                Velora is an evolving collection shaped by the belief that
                the best things do not need to be complicated.
              </p>

              <Link
                href="/shop"
                className="inline-flex items-center gap-3 border-b border-foreground pb-2 pt-4 text-sm font-medium text-foreground transition-opacity hover:opacity-60"
              >
                Explore the collection
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#efeee9] px-5 py-24 text-[#292a25] md:px-10 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#77786f]">
                What guides us
              </p>

              <h2 className="mt-5 text-3xl font-medium tracking-tight md:text-5xl">
                The principles behind every choice.
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-3 md:gap-10">
              {values.map((value) => (
                <article
                  key={value.number}
                  className="border-t border-[#c9c8c0] pt-6"
                >
                  <span className="text-xs text-[#77786f]">
                    {value.number}
                  </span>

                  <h3 className="mt-8 text-xl font-medium">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#77786f]">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-5 py-24 text-center md:px-10 md:py-32">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Discover Velora
            </p>

            <h2 className="mt-6 text-3xl font-medium tracking-tight md:text-5xl">
              Make room for what matters.
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              Explore a collection built around considered choices and
              everyday essentials.
            </p>

            <Link
              href="/shop"
              className="mt-9 inline-flex items-center gap-3 bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop the collection
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
