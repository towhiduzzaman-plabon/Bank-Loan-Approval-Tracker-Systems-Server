import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    photoURL: String,
    role: {
      type: String,
      enum: ["borrower", "manager", "admin"],
      default: "borrower",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    suspendReason: String,
    suspendFeedback: String
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
