
import { Request, Response, NextFunction } from "express";

const originProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  // Safe methods do not change server state.
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  const allowedOrigin = process.env.FRONTEND_URL;

  // Browser requests that modify data must have the expected origin.
  if (origin) {
    if (!allowedOrigin || origin !== allowedOrigin) {
      res.status(403).json({
        success: false,
        message: "Request origin not allowed",
      });
      return;
    }

    next();
    return;
  }

  // Allow server-to-server requests and non-browser clients.
  // These must still pass their own authentication/signature checks.
  next();
};

export default originProtection;
