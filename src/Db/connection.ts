import mongoose from "mongoose";
import envConfig from "../Config/env.ts";

const config = envConfig();

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
/**
 * Disconnect MongoDB (useful for testing or graceful shutdown)
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log(" MongoDB disconnected");
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
  }
};