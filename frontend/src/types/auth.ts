
export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  addresses?: unknown[];
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  message?: string;
  user: User;
}
