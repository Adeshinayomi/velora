
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register(
        form.firstName.trim(),
        form.lastName.trim(),
        form.email.trim(),
        form.password
      );

      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="flex min-h-[75vh] items-center justify-center px-5 py-20">
        <div className="w-full max-w-md">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Join Velora
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight">
              Create your account
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              A more considered shopping experience starts here.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                  First name
                </label>
                <input
                  id="firstName"
                  autoComplete="given-name"
                  required
                  maxLength={50}
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  className="h-12 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                  Last name
                </label>
                <input
                  id="lastName"
                  autoComplete="family-name"
                  required
                  maxLength={50}
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  className="h-12 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="At least 8 characters"
                className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Enter your password again"
                className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
