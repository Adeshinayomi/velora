
import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: {
    name: string;
    image?: string;
    quantity: number;
    price: number;
  }[];
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
}) {
  return api<{ success: boolean; message: string; user: User }>(
    "/auth/profile",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return api<{ success: boolean; message: string }>(
    "/auth/change-password",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function getOrders(page = 1) {
  return api<{
    success: boolean;
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  }>(`/orders/my-orders?page=${page}&limit=10`);
}

export async function getOrder(id: string) {
  return api<{ success: boolean; order: Order }>(
    `/orders/my-orders/${id}`
  );
}

export async function getAddresses() {
  const response = await api<{
    success: boolean;
    user: User & { addresses: Address[] };
  }>("/auth/me");

  return response.user.addresses ?? [];
}

export async function addAddress(data: Omit<Address, "_id">) {
  return api<{ success: boolean; addresses: Address[] }>("/auth/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "_id">>
) {
  return api<{ success: boolean; addresses: Address[] }>(
    `/auth/addresses/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteAddress(id: string) {
  return api<{ success: boolean; addresses: Address[] }>(
    `/auth/addresses/${id}`,
    { method: "DELETE" }
  );
}

export async function setDefaultAddress(id: string) {
  return api<{ success: boolean; addresses: Address[] }>(
    `/auth/addresses/${id}/default`,
    { method: "PATCH" }
  );
}
