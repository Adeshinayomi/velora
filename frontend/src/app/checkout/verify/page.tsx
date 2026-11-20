
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";

interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentStatus: string;
    orderStatus: string;
  };
}

type VerificationStatus =
  | "loading"
  | "success"
  | "pending"
  | "missing";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY = 3000;

function VerifyPaymentPageContent() {
  const searchParams = useSearchParams();

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<VerificationStatus>(
    reference ? "loading" : "missing"
  );

  const [message, setMessage] = useState(
    reference
      ? "Please wait while we confirm your payment."
      : "No payment reference was provided."
  );

  const [orderId, setOrderId] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [isManualRetry, setIsManualRetry] = useState(false);

  const verifyPayment = useCallback(() => {
    setStatus("loading");
    setMessage("Please wait while we confirm your payment.");
    setIsManualRetry(true);
    setRetryKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    const verify = async () => {
      let lastError = "";

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (cancelled) return;

        try {
          const response = await api<VerificationResponse>(
            `/orders/verify/${encodeURIComponent(reference)}`
          );

          if (cancelled) return;

          if (
            response.success &&
            response.data?.paymentStatus === "paid"
          ) {
            setStatus("success");
            setMessage("Your payment has been confirmed successfully.");
            setOrderId(response.data.orderId);
            return;
          }

          lastError = response.message || "Payment is not confirmed yet.";
        } catch (error) {
          if (cancelled) return;

          lastError =
            error instanceof Error
              ? error.message
              : "We couldn't verify your payment yet.";
        }

        if (attempt < MAX_ATTEMPTS) {
          setMessage(
            `Payment confirmation is taking longer than expected. Checking again (${attempt}/${MAX_ATTEMPTS - 1})...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY)
          );
        }
      }

      if (cancelled) return;

      setStatus("pending");
      setMessage(
        "We haven't received confirmation yet. Your payment may still be processing. You can check again shortly."
      );
      setIsManualRetry(false);
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [reference, retryKey]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-lg text-center">

        <div className="mb-8 flex justify-center">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}

          {status === "success" && (
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          )}

          {status === "pending" && (
            <AlertCircle className="h-16 w-16 text-amber-500" />
          )}

          {status === "missing" && (
            <AlertCircle className="h-16 w-16 text-destructive" />
          )}
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Velora
        </p>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight">
          {status === "loading" && "Verifying your payment"}

          {status === "success" && "Thank you for your order"}

          {status === "pending" && "Payment confirmation pending"}

          {status === "missing" && "Unable to verify payment"}
        </h1>

        <p className="mx-auto max-w-sm text-sm leading-7 text-muted-foreground">
          {message}
        </p>

        {status === "success" && orderId && (
          <div className="mt-6 rounded-md border border-border p-4">
            <p className="text-xs text-muted-foreground">
              Order reference
            </p>

            <p className="mt-2 break-all text-sm font-medium text-foreground">
              {orderId}
            </p>
          </div>
        )}

        {status === "success" && (
          <Link
            href="/shop"
            className="mt-9 inline-flex items-center gap-3 bg-primary px-7 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue shopping
            <ArrowRight size={16} />
          </Link>
        )}

        {status === "pending" && (
          <div className="mt-9 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={verifyPayment}
              className="inline-flex items-center gap-3 bg-primary px-7 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <RefreshCw size={16} />
              Check payment again
            </button>

            <Link
              href="/contact"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Contact support
            </Link>
          </div>
        )}

        {status === "missing" && (
          <div className="mt-9 flex flex-col items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-primary px-7 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Contact support
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/shop"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Return to shop
            </Link>
          </div>
        )}

        {status === "loading" && (
          <p className="mt-8 text-xs text-muted-foreground">
            Please do not close this page while we check your payment.
          </p>
        )}

      </div>
    </main>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />

            <p className="mt-6 text-sm text-muted-foreground">
              Preparing payment verification...
            </p>
          </div>
        </main>
      }
    >
      <VerifyPaymentPageContent />
    </Suspense>
  );
}
