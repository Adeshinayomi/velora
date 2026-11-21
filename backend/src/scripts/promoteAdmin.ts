import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.model";
import configureDns from "../config/dns";

configureDns();

const promoteAdmin = async (): Promise<void> => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!email) {
      throw new Error("ADMIN_EMAIL is missing from environment variables");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true, runValidators: true }
    ).select("_id firstName lastName email role");

    if (!user) {
      throw new Error(
        `No account found for ${email}. Register this account first.`
      );
    }

    console.log("Admin account successfully promoted:");
    console.log({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Admin promotion failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

promoteAdmin();
