"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  LockKeyhole,
  MapPin,
  Package,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/providers/AuthProvider";

import {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getOrders,
  getOrder,
} from "@/lib/account";

type AccountUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

type AccountAddress = {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
};

type AddressFormState = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type AccountOrder = {
  _id: string;
  orderNumber?: string;
  total: number;
  paymentStatus?: string;
  orderStatus?: string;
  estimatedDeliveryDate?: string;
  createdAt?: string;
  items?: {
    name: string;
    image?: string;
    quantity: number;
    price: number;
  }[];
};

type AccountSection = "profile" | "security" | "addresses" | "orders";

const EMPTY_ADDRESS: AddressFormState = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  country: "Nigeria",
  postalCode: "",
};

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(value: number): string {
  return `₦${Number(value ?? 0).toLocaleString("en-NG")}`;
}

function getDisplayOrderStatus(order: AccountOrder): string {
  const status = (order.orderStatus ?? "pending").toLowerCase();

  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";

  if (
    status === "shipped" &&
    order.estimatedDeliveryDate &&
    new Date(order.estimatedDeliveryDate).getTime() < Date.now()
  ) {
    return "Delayed";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "Delivered":
      return "bg-green-50 text-green-700";

    case "Delayed":
      return "bg-red-50 text-red-700";

    case "Cancelled":
      return "bg-neutral-100 text-neutral-600";

    case "Shipped":
      return "bg-blue-50 text-blue-700";

    case "Processing":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-[#f1f0eb] text-[#30352d]";
  }
}

export default function AccountPage() {
  const router = useRouter();

  const auth = useAuth();
  const accountUser = auth.user as AccountUser | null;
  const authLoading = auth.loading;

  const [activeSection, setActiveSection] =
    useState<AccountSection>("profile");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Address state
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressForm, setAddressForm] =
    useState<AddressFormState>(EMPTY_ADDRESS);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(
    null
  );

  // Order state
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<AccountOrder | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // Keep the profile form in sync with the authenticated user.
  useEffect(() => {
    if (!accountUser) return;

    setFirstName(accountUser.firstName ?? "");
    setLastName(accountUser.lastName ?? "");
  }, [accountUser]);

  // Redirect users who are not signed in.
  useEffect(() => {
    if (!authLoading && !accountUser) {
      router.replace("/login?redirect=/account");
    }
  }, [authLoading, accountUser, router]);

  const loadAddresses = useCallback(async () => {
    try {
      setAddressesLoading(true);

      const result = await getAddresses();

      const possibleResult = result as unknown as
        | AccountAddress[]
        | {
            addresses?: AccountAddress[];
            data?: { addresses?: AccountAddress[] };
          };

      const list = Array.isArray(possibleResult)
        ? possibleResult
        : possibleResult.addresses ??
          possibleResult.data?.addresses ??
          [];

      setAddresses(list);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your addresses."
      );
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);

      const result = await getOrders();

      const possibleResult = result as unknown as
        | AccountOrder[]
        | {
            orders?: AccountOrder[];
            data?: { orders?: AccountOrder[] };
          };

      const list = Array.isArray(possibleResult)
        ? possibleResult
        : possibleResult.orders ?? possibleResult.data?.orders ?? [];

      setOrders(list);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accountUser) return;

    void loadAddresses();
    void loadOrders();
  }, [accountUser, loadAddresses, loadOrders]);

  function showMessage(message: string) {
    setNotice(message);
    setError("");
  }

  function showError(message: string) {
    setError(message);
    setNotice("");
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      showError("Please enter your first and last name.");
      return;
    }

    try {
      setIsBusy(true);
      setError("");
      setNotice("");

      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      } as Parameters<typeof updateProfile>[0]);

      await auth.refreshUser();

      showMessage("Your profile has been updated.");
    } catch (submitError) {
      showError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update your profile."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      showError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Your new passwords do not match.");
      return;
    }

    try {
      setIsBusy(true);
      setError("");
      setNotice("");

      await changePassword({
        currentPassword,
        newPassword,
      } as Parameters<typeof changePassword>[0]);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showMessage("Your password has been changed.");
    } catch (submitError) {
      showError(
        submitError instanceof Error
          ? submitError.message
          : "Could not change your password."
      );
    } finally {
      setIsBusy(false);
    }
  }

  function openNewAddressForm() {
    setAddressForm(EMPTY_ADDRESS);
    setEditingAddressId(null);
    setShowAddressForm(true);
    setError("");
    setNotice("");
  }

  function openEditAddressForm(address: AccountAddress) {
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode ?? "",
    });

    setEditingAddressId(address._id);
    setShowAddressForm(true);
    setError("");
    setNotice("");
  }

  function updateAddressField(
    field: keyof AddressFormState,
    value: string
  ) {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const requiredFields = [
      addressForm.fullName,
      addressForm.phone,
      addressForm.street,
      addressForm.city,
      addressForm.state,
      addressForm.country,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      showError("Please complete all required address fields.");
      return;
    }

    const payload = {
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      street: addressForm.street.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      country: addressForm.country.trim(),
      postalCode: addressForm.postalCode.trim(),
    };

    try {
      setIsBusy(true);
      setError("");
      setNotice("");

      if (editingAddressId) {
        await updateAddress(
          editingAddressId,
          payload as Parameters<typeof updateAddress>[1]
        );

        showMessage("Your address has been updated.");
      } else {
        await addAddress(
          payload as Parameters<typeof addAddress>[0]
        );

        showMessage("Your new address has been saved.");
      }

      setAddressForm(EMPTY_ADDRESS);
      setEditingAddressId(null);
      setShowAddressForm(false);

      await loadAddresses();
    } catch (submitError) {
      showError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save this address."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setIsBusy(true);
      setError("");
      setNotice("");

      await deleteAddress(addressId);
      await loadAddresses();

      showMessage("Address deleted successfully.");
    } catch (deleteError) {
      showError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this address."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSetDefaultAddress(addressId: string) {
    try {
      setIsBusy(true);
      setError("");
      setNotice("");

      await setDefaultAddress(addressId);
      await loadAddresses();

      showMessage("Default delivery address updated.");
    } catch (defaultError) {
      showError(
        defaultError instanceof Error
          ? defaultError.message
          : "Could not update your default address."
      );
    } finally {
      setIsBusy(false);
    }
  }


async function handleOpenOrder(order: AccountOrder) {
  setSelectedOrder(order);
  setOrderDetailLoading(true);

  try {
    const result = await getOrder(order._id);

    setSelectedOrder(result.order);
  } catch (detailError) {
    showError(
      detailError instanceof Error
        ? detailError.message
        : "Could not load order details."
    );
  } finally {
    setOrderDetailLoading(false);
  }
}

  async function handleLogout() {
    try {
      await auth.logout();
      router.replace("/");
    } catch (logoutError) {
      showError(
        logoutError instanceof Error
          ? logoutError.message
          : "Could not sign you out."
      );
    }
  }

  const sections = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: UserRound,
    },
    {
      id: "security" as const,
      label: "Security",
      icon: LockKeyhole,
    },
    {
      id: "addresses" as const,
      label: "Addresses",
      icon: MapPin,
    },
    {
      id: "orders" as const,
      label: "Orders",
      icon: Package,
    },
  ];

  if (authLoading) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14">
          <div className="h-8 w-48 animate-pulse bg-[#eeece7]" />
          <div className="mt-10 h-72 animate-pulse bg-[#eeece7]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!accountUser) {
    return null;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-14">
        <div className="mb-12">
          <p className="mb-3 text-[10px] tracking-[0.22em] text-muted-foreground">
            YOUR VELORA
          </p>

          <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
            My account.
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Welcome back, {accountUser.firstName || "there"}.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Account navigation */}
          <aside>
            <nav className="flex gap-2 overflow-x-auto border-b border-border pb-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:pb-0">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id);
                      setNotice("");
                      setError("");
                      setSelectedOrder(null);
                    }}
                    className={`flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm transition-colors lg:w-full ${
                      isActive
                        ? "bg-[#f1f0eb] text-[#30352d]"
                        : "text-muted-foreground hover:bg-[#f7f6f2] hover:text-foreground"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.6} />
                    {section.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 lg:w-full"
              >
                <LogOut size={17} strokeWidth={1.6} />
                Sign out
              </button>
            </nav>
          </aside>

          {/* Main account content */}
          <section className="min-w-0">
            {notice && (
              <div
                role="status"
                className="mb-7 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {notice}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-7 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* PROFILE */}
            {activeSection === "profile" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-light">Personal details</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Update the information associated with your account.
                  </p>
                </div>

                <form
                  onSubmit={handleProfileSubmit}
                  className="max-w-2xl space-y-6"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-xs text-muted-foreground"
                      >
                        First name
                      </label>

                      <input
                        id="firstName"
                        value={firstName}
                        onChange={(event) =>
                          setFirstName(event.target.value)
                        }
                        required
                        className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-xs text-muted-foreground"
                      >
                        Last name
                      </label>

                      <input
                        id="lastName"
                        value={lastName}
                        onChange={(event) =>
                          setLastName(event.target.value)
                        }
                        required
                        className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs text-muted-foreground"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={accountUser.email ?? ""}
                      readOnly
                      className="h-12 w-full border border-border bg-[#f7f6f2] px-4 text-sm text-muted-foreground outline-none"
                    />

                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Your email address cannot be changed here.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="flex h-12 items-center justify-center gap-2 bg-[#30352d] px-7 text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#454b40] disabled:opacity-60"
                  >
                    {isBusy && (
                      <LoaderCircle size={15} className="animate-spin" />
                    )}
                    Save changes
                  </button>
                </form>
              </div>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-light">Security</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Change your password to keep your account secure.
                  </p>
                </div>

                <form
                  onSubmit={handlePasswordSubmit}
                  className="max-w-xl space-y-6"
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-xs text-muted-foreground"
                    >
                      Current password
                    </label>

                    <input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      required
                      className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-xs text-muted-foreground"
                    >
                      New password
                    </label>

                    <input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      required
                      minLength={8}
                      className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-xs text-muted-foreground"
                    >
                      Confirm new password
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                      minLength={8}
                      className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="flex h-12 items-center justify-center gap-2 bg-[#30352d] px-7 text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#454b40] disabled:opacity-60"
                  >
                    {isBusy && (
                      <LoaderCircle size={15} className="animate-spin" />
                    )}
                    Update password
                  </button>
                </form>
              </div>
            )}

            {/* ADDRESSES */}
            {activeSection === "addresses" && (
              <div>
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-light">Your addresses</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Manage the addresses used for your deliveries.
                    </p>
                  </div>

                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={openNewAddressForm}
                      className="flex h-11 items-center gap-2 bg-[#30352d] px-5 text-xs uppercase tracking-widest text-white hover:bg-[#454b40]"
                    >
                      <Plus size={15} />
                      Add address
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form
                    onSubmit={handleAddressSubmit}
                    className="mb-10 border border-border p-5 sm:p-7"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-light">
                        {editingAddressId ? "Edit address" : "New address"}
                      </h3>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                          setAddressForm(EMPTY_ADDRESS);
                        }}
                        aria-label="Close address form"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {(
                        [
                          ["fullName", "Full name"],
                          ["phone", "Phone number"],
                          ["street", "Street address"],
                          ["city", "City"],
                          ["state", "State"],
                          ["country", "Country"],
                          ["postalCode", "Postal code (optional)"],
                        ] as const
                      ).map(([field, label]) => (
                        <div
                          key={field}
                          className={
                            field === "street" ? "sm:col-span-2" : ""
                          }
                        >
                          <label
                            htmlFor={field}
                            className="mb-2 block text-xs text-muted-foreground"
                          >
                            {label}
                          </label>

                          <input
                            id={field}
                            value={addressForm[field]}
                            onChange={(event) =>
                              updateAddressField(field, event.target.value)
                            }
                            required={field !== "postalCode"}
                            className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none focus:border-foreground"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="flex h-12 items-center gap-2 bg-[#30352d] px-6 text-xs uppercase tracking-widest text-white hover:bg-[#454b40] disabled:opacity-60"
                      >
                        {isBusy && (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        )}
                        {editingAddressId ? "Save address" : "Add address"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                          setAddressForm(EMPTY_ADDRESS);
                        }}
                        className="h-12 border border-border px-6 text-xs uppercase tracking-widest hover:bg-[#f7f6f2]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addressesLoading ? (
                  <p className="py-10 text-sm text-muted-foreground">
                    Loading your addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <div className="border border-dashed border-border px-6 py-14 text-center">
                    <MapPin
                      size={25}
                      strokeWidth={1.3}
                      className="mx-auto text-muted-foreground"
                    />

                    <p className="mt-4 text-base font-light">
                      No saved addresses.
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Add an address to make your next checkout quicker.
                    </p>

                    {!showAddressForm && (
                      <button
                        type="button"
                        onClick={openNewAddressForm}
                        className="mt-6 text-xs uppercase tracking-widest underline underline-offset-4"
                      >
                        Add your first address
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <article
                        key={address._id}
                        className="border border-border p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {address.fullName}
                            </p>

                            {address.isDefault && (
                              <span className="mt-2 inline-flex items-center gap-1 bg-[#f1f0eb] px-2 py-1 text-[9px] uppercase tracking-wider text-[#30352d]">
                                <Star size={10} />
                                Default
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                openEditAddressForm(address)
                              }
                              aria-label="Edit address"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteAddress(address._id)
                              }
                              aria-label="Delete address"
                              disabled={isBusy}
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 space-y-1 text-xs leading-5 text-muted-foreground">
                          <p>{address.phone}</p>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.state}
                          </p>
                          {address.postalCode && (
                            <p>{address.postalCode}</p>
                          )}
                          <p>{address.country}</p>
                        </div>

                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleSetDefaultAddress(address._id)
                            }
                            disabled={isBusy}
                            className="mt-5 text-[10px] uppercase tracking-widest underline underline-offset-4 hover:text-muted-foreground disabled:opacity-50"
                          >
                            Set as default
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS */}
            {activeSection === "orders" && (
              <div>
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-light">Your orders</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Follow your purchases and delivery progress.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadOrders()}
                    disabled={ordersLoading}
                    className="text-xs uppercase tracking-widest underline underline-offset-4 disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
                    <LoaderCircle size={17} className="animate-spin" />
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="border border-dashed border-border px-6 py-14 text-center">
                    <Package
                      size={27}
                      strokeWidth={1.3}
                      className="mx-auto text-muted-foreground"
                    />

                    <p className="mt-4 text-base font-light">
                      No orders yet.
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Your purchases will appear here once you place an order.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push("/shop")}
                      className="mt-6 text-xs uppercase tracking-widest underline underline-offset-4"
                    >
                      Explore the collection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => {
                      const displayStatus =
                        getDisplayOrderStatus(order);

                      return (
                        <article
                          key={order._id}
                          className="border border-border p-5 sm:p-6"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium">
                                {order.orderNumber ?? order._id}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider ${getStatusClasses(
                                displayStatus
                              )}`}
                            >
                              {displayStatus}
                            </span>
                          </div>

                          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Estimated delivery
                              </p>

                              <p className="mt-1 text-sm">
                                {order.orderStatus?.toLowerCase() ===
                                "delivered"
                                  ? "Delivered"
                                  : formatDate(
                                      order.estimatedDeliveryDate
                                    )}
                              </p>

                              {displayStatus === "Delayed" && (
                                <p className="mt-1 text-xs text-red-600">
                                  This order is past its estimated delivery
                                  date.
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Order total
                              </p>

                              <p className="mt-1 text-sm font-medium">
                                {formatPrice(order.total)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                              Payment:{" "}
                              <span className="capitalize">
                                {order.paymentStatus ?? "Unknown"}
                              </span>
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                void handleOpenOrder(order)
                              }
                              className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-muted-foreground"
                            >
                              View order details
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Selected order details */}
                {selectedOrder && (
                  <div className="mt-8 border border-border p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          ORDER DETAILS
                        </p>

                        <h3 className="mt-2 text-lg font-light">
                          {selectedOrder.orderNumber ??
                            selectedOrder._id}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        aria-label="Close order details"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {orderDetailLoading ? (
                      <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                        Loading order details...
                      </div>
                    ) : (
                      <>
                        <div className="mt-6 space-y-4">
                          {(selectedOrder.items ?? []).map(
                            (item, index) => (
                              <div
                                key={`${selectedOrder._id}-${index}`}
                                className="flex items-center gap-4"
                              >
                                <div className="h-16 w-14 shrink-0 overflow-hidden bg-[#f1f0eb]">
                                  {item.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm">{item.name}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>

                                <p className="text-sm">
                                  {formatPrice(
                                    item.price * item.quantity
                                  )}
                                </p>
                              </div>
                            )
                          )}
                        </div>

                        <div className="mt-6 flex justify-between border-t border-border pt-5">
                          <span className="text-sm text-muted-foreground">
                            Total
                          </span>
                          <span className="text-sm font-medium">
                            {formatPrice(selectedOrder.total)}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Order status
                            </p>
                            <p className="mt-1 text-sm">
                              {getDisplayOrderStatus(selectedOrder)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Estimated delivery
                            </p>
                            <p className="mt-1 text-sm">
                              {selectedOrder.orderStatus?.toLowerCase() ===
                              "delivered"
                                ? "Delivered"
                                : formatDate(
                                    selectedOrder.estimatedDeliveryDate
                                  )}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}