// server/routes/stats.routes.js
import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRole } from "../middleware/verifyRole.js";
import Loan from "../models/Loan.js";
import LoanApplication from "../models/LoanApplication.js";

const router = express.Router();

/**
 * GET /api/stats/dashboard
 *
 * - admin / manager: সব লোন + সব অ্যাপ্লিকেশনের status অনুযায়ী কাউন্ট
 * - borrower: শুধু নিজের application গুলো থেকে pending / approved কাউন্ট
 */
router.get("/dashboard", verifyJWT, async (req, res) => {
  try {
    const user = req.user; // verifyJWT থেকে আসবে

    // সব role-এর জন্য total loans একই থাকবে
    const totalLoans = await Loan.countDocuments();

    // borrower হলে তার নিজের applications, নইলে সবগুলো
    const match = {};
    if (user.role === "borrower") {
      match.borrower = user.id;
    }

    const [pendingApps, approvedApps] = await Promise.all([
      LoanApplication.countDocuments({ ...match, status: "Pending" }),
      LoanApplication.countDocuments({ ...match, status: "Approved" }),
    ]);

    res.json({
      totalLoans,
      pendingApps,
      approvedApps,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});

export default router;
