// server/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import userRoutes from "./routes/user.routes.js";     // (আগে ঠিক করলে ভালো)
import statsRoutes from "./routes/stats.routes.js";   // 🔥 new

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/users", userRoutes);       // manage users-এর জন্য
app.use("/api/stats", statsRoutes);      // 🔥 dashboard stats-এর জন্য

app.get("/", (req, res) => {
  res.send("LoanLink server running");
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
  });
