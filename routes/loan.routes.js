import express from "express";
import Loan from "../models/Loan.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();


router.get("/home", async (req, res) => {
  try {
    const loans = await Loan.find()
      .sort({ showOnHome: -1, createdAt: -1 })
      .limit(6);

    res.json(loans);
  } catch (error) {
    console.error("Home loans error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const { search = "", category, page = 1, limit = 9 } = req.query;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "all") {
      query.category = category;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;

    const [loans, total] = await Promise.all([
      Loan.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Loan.countDocuments(query),
    ]);

    res.json({
      loans,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("All loans error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get(
  "/manager/mine",
  verifyJWT,
  verifyRole("manager"),
  async (req, res) => {
    try {
      const { search = "" } = req.query;

      const query = {
        createdBy: req.user.id,
      };

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      const loans = await Loan.find(query).sort({ createdAt: -1 });

      res.json(loans);
    } catch (error) {
      console.error("Manager loans error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /api/loans/:id
 * Loan details
 */
router.get("/:id", async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.json(loan);
  } catch (error) {
    console.error("Loan details error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/loans
 * Manager -> Add Loan
 */
router.post("/", verifyJWT, verifyRole("manager"), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      interestRate,
      maxLimit,
      requiredDocuments,
      emiPlans,
      images,
      showOnHome,
    } = req.body;

    const loan = await Loan.create({
      title,
      description,
      category,
      interestRate,
      maxLimit,
      requiredDocuments,
      emiPlans,
      images,
      showOnHome: !!showOnHome,
      createdBy: req.user.id,
    });

    res.status(201).json(loan);
  } catch (error) {
    console.error("Create loan error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * PATCH /api/loans/:id
 * Manager/Admin -> Update Loan
 */
router.patch(
  "/:id",
  verifyJWT,
  verifyRole("manager", "admin"),
  async (req, res) => {
    try {
      const update = req.body;
      const loan = await Loan.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error) {
      console.error("Update loan error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * DELETE /api/loans/:id
 * Manager/Admin -> Delete Loan
 */
router.delete(
  "/:id",
  verifyJWT,
  verifyRole("manager", "admin"),
  async (req, res) => {
    try {
      const loan = await Loan.findByIdAndDelete(req.params.id);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete loan error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
