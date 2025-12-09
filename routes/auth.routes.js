// server/routes/auth.routes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// decide correct role
const getRole = (email) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const managerEmail = process.env.MANAGER_EMAIL?.trim();

  if (email === adminEmail) return "admin";
  if (email === managerEmail) return "manager";
  return "borrower";
};

router.post("/jwt", async (req, res) => {
  try {
    const { email, name, photoURL } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findOne({ email });

    const forcedRole = getRole(email); // role detection

    if (!user) {
      // নতুন user → role সরাসরি assign
      user = await User.create({
        email,
        name: name || "User",
        photoURL,
        role: forcedRole,
      });
    } else {
      // পুরোনো user হলেও role ভুল থাকলে force update
      if (user.role !== forcedRole) {
        user.role = forcedRole;
        await user.save();
      }
    }

    // JWT তৈরি
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
