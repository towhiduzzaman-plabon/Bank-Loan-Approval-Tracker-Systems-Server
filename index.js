import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import userRoutes from "./routes/user.routes.js"; 
import statsRoutes from "./routes/stats.routes.js";
import statusRoutes from "./routes/status.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://loanlink-client.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  console.warn(
    "CLIENT_URL is not set in production. Set CLIENT_URL to your deployed client domain (e.g. https://your-domain.vercel.app) to ensure redirects (Stripe/links) work correctly."
  );
}
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/stats", statsRoutes); 
app.use("/api/status", statusRoutes);
import paymentRoutes from "./routes/payment.routes.js";
app.use("/api/payments", paymentRoutes);

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
