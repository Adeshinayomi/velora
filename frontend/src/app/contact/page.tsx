
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPrepared(false);

    if (!contactEmail) {
      setError(
        "Our contact email has not been configured yet. Please try again later."
      );
      return;
    }

    const subject = encodeURIComponent(
      form.subject || `Velora enquiry from ${form.name}`
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );

    const mailto = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    setPrepared(true);
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-background text-foreground">
        <section className="px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Get in touch
            </p>

            <h1 className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl md:text-7xl">
              We'd love to hear from you.
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
              Have a question about an order, a product, or something else?
              Send us a message and we'll be happy to help.
            </p>
          </div>
        </section>

        <section className="border-t border-border px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.8fr_1.2fr] md:gap-24">
            {/* Contact information */}
            <aside>
              <h2 className="text-xl font-medium">Contact information</h2>

              <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                Whether you need help with an order or simply want to ask
                us something, we're here to help.
              </p>

              <div className="mt-10 space-y-8">
                <div className="flex gap-4">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />

                  <div>
                    <h3 className="text-sm font-medium">Email</h3>

                    {contactEmail ? (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="mt-2 block text-sm text-muted-foreground underline underline-offset-4"
                      >
                        {contactEmail}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Contact email coming soon.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />

                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Online store
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 border-t border-border pt-8">
                <p className="text-sm text-muted-foreground">
                  Looking for something?
                </p>

                <Link
                  href="/shop"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium hover:opacity-60"
                >
                  Browse our collection
                  <ArrowRight size={15} />
                </Link>
              </div>
            </aside>

            {/* Contact form */}
            <div>
              <h2 className="text-xl font-medium">Send us a message</h2>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Your name
                    </label>

                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      placeholder="Your name"
                      className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      placeholder="you@example.com"
                      className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    required
                    maxLength={150}
                    value={form.subject}
                    onChange={(event) =>
                      setForm({ ...form, subject: event.target.value })
                    }
                    placeholder="How can we help?"
                    className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium"
                    >
                      Message
                    </label>

                    <span className="text-xs text-muted-foreground">
                      {form.message.length}/2000
                    </span>
                  </div>

                  <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={7}
                    value={form.message}
                    onChange={(event) =>
                      setForm({ ...form, message: event.target.value })
                    }
                    placeholder="Write your message here..."
                    className="w-full resize-y border border-border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                {prepared && (
                  <div
                    role="status"
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <p>
                      Your email app should open with your message ready.
                      Sending it from that app is the final step.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-3 bg-primary px-7 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
                >
                  Prepare message
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
