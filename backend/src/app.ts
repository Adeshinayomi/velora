import cookieParser from "cookie-parser";
import express, { Request } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { notFound, errorHandler } from "./middleware/error.middleware";
import originProtection from "./middleware/origin.middleware";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

app.set("trust proxy", 1);

// Set FRONTEND_URLS to a comma-separated list of deployed browser origins.
// Local development keeps localhost available without requiring an env file.
const allowedOrigins = (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"))
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-checkout-token",
    ],
  })
);

// Parse JSON and preserve raw body for Paystack webhook verification
app.use(
  express.json({
    verify: (req, _res, buffer) => {
      (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Velora API!",
  });
});

// Protect state-changing browser requests.
// Paystack webhook uses its own HMAC signature verification.
app.use((req, res, next) => {
  if (
    req.path === "/api/orders/paystack/webhook"
  ) {
    return next();
  }

  return originProtection(req, res, next);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// 404 and error handling
app.use(notFound);
app.use(errorHandler);

export default app;
