import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/users?search=&role=&status=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      role,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    // Search query
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    if (role) query.role = role;
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
});

// PATCH /api/users/:id  (role / status update)
router.patch("/:id", async (req, res) => {
  try {
    const { role, status, suspendReason, suspendFeedback } = req.body;

    const update = {};
    if (role) update.role = role;
    if (status) update.status = status;

    if (status === "suspended") {
      update.suspendReason = suspendReason;
      update.suspendFeedback = suspendFeedback;
    } else if (status === "active") {
      update.suspendReason = "";
      update.suspendFeedback = "";
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("PATCH /api/users/:id error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

export default router;
