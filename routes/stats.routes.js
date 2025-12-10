import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRole } from "../middleware/verifyRole.js";
import Loan from "../models/Loan.js";
import LoanApplication from "../models/LoanApplication.js";

const router = express.Router();


router.get("/dashboard", verifyJWT, async (req, res) => {
  try {
    const user = req.user; // verifyJWT

  
    const totalLoans = await Loan.countDocuments();

    
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
