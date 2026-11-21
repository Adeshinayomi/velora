import { Request, Response, NextFunction } from "express";

const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const candidate = err as Error & {
    status?: number;
    statusCode?: number;
    code?: number;
    name?: string;
  };
  let status = candidate.statusCode ?? candidate.status ?? 500;
  let message = candidate.message || "Internal server error";

  // Give clients useful request errors without exposing internal failures.
  if (candidate.code === 11000) {
    status = 409;
    message = "A record with this value already exists";
  } else if (candidate.name === "ValidationError" || candidate.name === "CastError") {
    status = 400;
  } else if (candidate.name === "MulterError") {
    status = 400;
  } else if (candidate.name === "SyntaxError" && status === 400) {
    message = "Invalid JSON request body";
  }

  if (status >= 500) console.error(err.stack || err);

  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message,
  });
};

export { notFound, errorHandler };
