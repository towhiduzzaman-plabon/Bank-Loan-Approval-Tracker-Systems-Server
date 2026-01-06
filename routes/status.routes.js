import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const vars = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    CLIENT_URL: !!process.env.CLIENT_URL,
    COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    MANAGER_EMAIL: !!process.env.MANAGER_EMAIL,
  };

  const missing = Object.entries(vars)
    .filter(([, val]) => !val)
    .map(([key]) => key);

  res.json({
    uptime: process.uptime(),
    nodeEnv: process.env.NODE_ENV || "development",
    vars,
    missing,
    ok: missing.length === 0,
  });
});

export default router;