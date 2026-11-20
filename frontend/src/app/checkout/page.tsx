
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  LockKeyhole,
  LoaderCircle,
  Truck,
} from "lucide-react";

import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";
import { api } from "@/lib/api";

const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name"),
  lastName: z.string().trim().min(2, "Enter your last name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your delivery address"),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state"),
  country: z.string().trim().min(2, "Enter your country"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CreateOrderResponse {
  success: boolean;
  message?: string;
  order?: {
    _id?: string;
    id?: string;
    estimatedDeliveryDate?: string;
  };
  checkoutToken?: string;
}

interface InitializePaymentResponse {
  success: boolean;
  message?: string;
  authorizationUrl?: string;
  authorization_url?: string;
  data?: {
    authorizationUrl?: string;
    authorization_url?: string;
  };
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isHydrated, setIsHydrated] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Nigeria",
    },
  });

  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG")}`;

  async function onSubmit(formData: CheckoutFormData) {
    if (items.length === 0) return;

    setCheckoutError("");

    try {
      const orderResponse = await api<CreateOrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
          },
        }),
      });

      const orderId = orderResponse.order?._id;

      if (!orderId) {
        throw new Error("Order was created, but its ID was not returned.");
      }

      const checkoutToken = orderResponse.checkoutToken;

      if (checkoutToken) {
        sessionStorage.setItem(
          `velora-checkout-${orderId}`,
          checkoutToken
        );
      }

      const paymentResponse =
        await api<InitializePaymentResponse>(
          `/orders/${orderId}/pay`,
          {
            method: "POST",
            headers: checkoutToken
              ? { "x-checkout-token": checkoutToken }
              : {},
          }
        );

      const authorizationUrl =
        paymentResponse.authorizationUrl ||
        paymentResponse.authorization_url ||
        paymentResponse.data?.authorizationUrl ||
        paymentResponse.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Payment was not initialized correctly. Your order may have been created. Please contact support before trying again."
        );
      }

      if (checkoutToken) {
        sessionStorage.removeItem(`velora-checkout-${orderId}`);
      }

      clearCart();
      window.location.assign(authorizationUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "We couldn't process your checkout. Please try again."
      );
    }
  }

  if (!isHydrated) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14">
          <div className="h-8 w-48 animate-pulse bg-[#eeece7]" />
          <div className="mt-10 h-64 animate-pulse bg-[#eeece7]" />
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="mx-auto flex min-h-[65vh] max-w-[1440px] flex-col items-center justify-center px-5 text-center">
          <h1 className="text-3xl font-light">Your bag is empty.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add something to your bag before checking out.
          </p>
          <Link
            href="/shop"
            className="mt-7 bg-[#30352d] px-7 py-4 text-xs uppercase tracking-widest text-white"
          >
            Explore the collection
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-14">
        <div className="mb-12">
          <p className="mb-3 text-[10px] tracking-[0.22em] text-muted-foreground">
            ALMOST YOURS
          </p>
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
            Checkout.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter your details so we know where to send your order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16"
        >
          <section>
            <div>
              <h2 className="text-xl font-light">
                Contact information
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                We'll use these details for order updates.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <FormField
                  label="First name"
                  name="firstName"
                  register={register}
                  error={errors.firstName?.message}
                />
                <FormField
                  label="Last name"
                  name="lastName"
                  register={register}
                  error={errors.lastName?.message}
                />
                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  register={register}
                  error={errors.email?.message}
                />
                <FormField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  register={register}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div className="mt-14">
              <h2 className="text-xl font-light">
                Delivery address
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Where should we deliver your order?
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField
                    label="Street address"
                    name="address"
                    register={register}
                    error={errors.address?.message}
                  />
                </div>

                <FormField
                  label="City"
                  name="city"
                  register={register}
                  error={errors.city?.message}
                />

                <FormField
                  label="State"
                  name="state"
                  register={register}
                  error={errors.state?.message}
                />

                <div className="sm:col-span-2">
                  <FormField
                    label="Country"
                    name="country"
                    register={register}
                    error={errors.country?.message}
                  />
                </div>
              </div>
            </div>

            {checkoutError && (
              <div
                role="alert"
                className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {checkoutError}
              </div>
            )}
          </section>

          <aside className="h-fit bg-[#f1f0eb] p-6 sm:p-8">
            <h2 className="text-xl font-light">Your order.</h2>

            <div className="mt-7 max-h-[360px] space-y-5 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-white">
                    {product.images?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-[#30352d] px-1 text-[10px] text-white">
                      {quantity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty: {quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-neutral-300 pt-6">
              <div className="flex items-start gap-3">
                <Truck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#30352d]"
                />
                <div>
                  <p className="text-sm font-medium">
                    Estimated delivery
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Within 5 business days after placing your order.
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Your account will show the order's delivery estimate
                    and status.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-4 border-t border-neutral-300 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-right text-xs text-muted-foreground">
                  Calculated by the store
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-neutral-300 pt-6">
              <span className="text-sm font-medium">
                Estimated total
              </span>
              <span className="text-sm font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 bg-[#30352d] text-xs uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#454b40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LockKeyhole size={15} />
                  Continue to payment
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
              Secure payment powered by Paystack. Your final total will
              be calculated and confirmed by the store.
            </p>

            <Link
              href="/cart"
              className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={13} />
              Return to bag
            </Link>
          </aside>
        </form>
      </main>

      <Footer />
    </>
  );
}

type FormFieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "country";

function FormField({
  label,
  name,
  register,
  error,
  type = "text",
}: {
  label: string;
  name: FormFieldName;
  register: UseFormRegister<CheckoutFormData>;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs text-muted-foreground"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        autoComplete={name === "address" ? "street-address" : name}
        {...register(name)}
        aria-invalid={Boolean(error)}
        className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none transition-colors focus:border-foreground aria-invalid:border-red-500"
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
