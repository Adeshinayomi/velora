import { Request, Response, NextFunction } from "express";

const allowedOrigins = [
  "http://localhost:3000",
  "https://velora-pi-topaz.vercel.app",
];

const originProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only protect state-changing requests
  const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (!protectedMethods.includes(req.method)) {
    return next();
  }

  // Allow requests without an Origin header.
  // This supports server-to-server requests and non-browser clients.
  const origin = req.get("origin");

  if (!origin) {
    return next();
  }

  // Validate the request origin
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  return next();
};

export default originProtection;