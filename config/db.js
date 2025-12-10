import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(uri, {
      dbName: "loanlink",
    });

    console.log(" MongoDB connected");
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
