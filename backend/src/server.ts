
import "dotenv/config";
import configureDns from "./config/dns";
import app from "./app";
import connectDB from "./config/database";

configureDns();

const port = Number(process.env.PORT ?? 5000);

const startServer = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be configured with at least 32 characters");
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("PORT must be a valid TCP port");
    }

    // Connect to MongoDB before starting the server
    await connectDB();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Velora API running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start Velora server:", error);
    process.exit(1);
  }
};

startServer();
