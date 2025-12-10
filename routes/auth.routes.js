import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/jwt", async (req, res) => {
  try {
    const { email, name, photoURL } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    // ১. ইমেইল সব সময় ছোট হাতের অক্ষরে কনভার্ট করে নিন
    const userEmail = email.toLowerCase();
    
    // Debugging: কনসোলে দেখুন আসলে কী ইমেইল আসছে
    console.log("Login Attempt:", userEmail);
    console.log("Admin Email in ENV:", process.env.ADMIN_EMAIL);

    let user = await User.findOne({ email: userEmail });

    // ২. রোল নির্ধারণের লজিক (Role Determination Logic)
    let finalRole = "borrower"; // ডিফল্ট

    // যদি ইউজার আগে থেকেই থাকে, তার বর্তমান রোলটিই আমরা রাখব
    if (user) {
      finalRole = user.role;
    }

    // ৩. কিন্তু যদি .env এর সাথে মিলে যায়, তবে অবশ্যই ADMIN হতে হবে (Override)
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const managerEmail = process.env.MANAGER_EMAIL?.trim().toLowerCase();

    if (userEmail === adminEmail) {
      finalRole = "admin";
    } else if (userEmail === managerEmail) {
      finalRole = "manager";
    }

    // ৪. ডাটাবেস অপারেশন (Update or Create)
    // এখানে findOneAndUpdate ব্যবহার করা নিরাপদ
    const updateDoc = {
      $set: {
        email: userEmail,
        name: name || "User",
        photoURL: photoURL,
        role: finalRole, // এখানে ক্যালকুলেটেড রোলটি বসবে
      },
    };

    // upsert: true মানে হলো ইউজার না থাকলে বানাবে, থাকলে আপডেট করবে
    user = await User.findOneAndUpdate(
      { email: userEmail },
      updateDoc,
      { new: true, upsert: true }
    );

    // JWT create
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.COOKIE_SECURE === "true";

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        role: user.role,
      });

  } catch (error) {
    console.error("JWT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;