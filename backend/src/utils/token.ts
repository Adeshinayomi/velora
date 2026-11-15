import jwt from "jsonwebtoken";
import { Response } from "express";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, getJwtSecret(), {
    expiresIn: "7d",
  });
};

export const setAuthCookie = (
  res: Response,
  token: string
): void => {
  res.cookie("velora_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie("velora_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};
