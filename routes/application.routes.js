import express from "express";
import LoanApplication from "../models/LoanApplication.js";
import Loan from "../models/Loan.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();

/**
 * BORROWER APPLY
 * POST /api/applications
 */
router.post("/", verifyJWT, verifyRole("borrower"), async (req, res) => {
  try {
    const { loanId, ...rest } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const app = await LoanApplication.create({
      loan: loan._id,
      loanTitle: loan.title,
      loanCategory: loan.category,
      interestRate: loan.interestRate,
      loanAmount: rest.loanAmount,

      borrower: req.user.id,
      borrowerEmail: req.user.email,
      borrowerName: `${rest.firstName} ${rest.lastName}`,

      ...rest,
      status: "Pending",
      feeStatus: "Unpaid",
    });

    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * BORROWER: MY APPLICATIONS
 * GET /api/applications/my
 */
router.get(
  "/my",
  verifyJWT,
  verifyRole("borrower"),
  async (req, res) => {
    const apps = await LoanApplication.find({ borrower: req.user.id });
    res.json(apps);
  }
);

/**
 * ADMIN: ALL APPLICATIONS (optional filter by status)
 * GET /api/applications/admin?status=Pending
 */
router.get(
  "/admin",
  verifyJWT,
  verifyRole("admin"),
  async (req, res) => {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const apps = await LoanApplication.find(query);
    res.json(apps);
  }
);

/**
 * MANAGER: PENDING APPLICATIONS
 * GET /api/applications/manager/pending
 */
router.get(
  "/manager/pending",
  verifyJWT,
  verifyRole("manager"),
  async (req, res) => {
    const apps = await LoanApplication.find({ status: "Pending" });
    res.json(apps);
  }
);

/**
 * MANAGER: APPROVED APPLICATIONS
 * GET /api/applications/manager/approved
 */
router.get(
  "/manager/approved",
  verifyJWT,
  verifyRole("manager"),
  async (req, res) => {
    const apps = await LoanApplication.find({ status: "Approved" });
    res.json(apps);
  }
);

/**
 * MANAGER: APPROVE / REJECT
 * PATCH /api/applications/:id/status
 * body: { status: "Approved" | "Rejected" }
 */
router.patch(
  "/:id/status",
  verifyJWT,
  verifyRole("manager"),
  async (req, res) => {
    const { status } = req.body;
    const update = { status };

    if (status === "Approved") update.approvedAt = new Date();
    if (status === "Rejected") update.rejectedAt = new Date();

    const app = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json(app);
  }
);

/**
 * BORROWER: CANCEL (only if Pending)
 * PATCH /api/applications/:id/cancel
 */
router.patch(
  "/:id/cancel",
  verifyJWT,
  verifyRole("borrower"),
  async (req, res) => {
    const app = await LoanApplication.findOneAndUpdate(
      {
        _id: req.params.id,
        borrower: req.user.id,
        status: "Pending",
      },
      {
        status: "Cancelled",
        cancelledAt: new Date(),
      },
      { new: true }
    );

    if (!app) {
      return res.status(400).json({ message: "Cannot cancel" });
    }

    res.json(app);
  }
);

export default router;
