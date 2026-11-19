
import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";
import dns from "dns";
const PORT = process.env.PORT || 5000;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB before starting the server
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Velora API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start Velora server:", error);
    process.exit(1);
  }
};

startServer();
