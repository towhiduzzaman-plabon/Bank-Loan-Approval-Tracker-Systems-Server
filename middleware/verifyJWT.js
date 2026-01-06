import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("JWT verify error:", err);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // decoded = { email, role, id }
    req.user = decoded;

    // Check if user exists and is not suspended
    try {
      const user = await User.findOne({ email: decoded.email });
      if (user && user.status === "suspended") {
        return res.status(403).json({ message: "User suspended" });
      }
      // ensure role is in sync (in case DB changed)
      if (user && user.role) req.user.role = user.role;
    } catch (dbErr) {
      console.error("verifyJWT DB error:", dbErr);
      // proceed — don't block on DB lookup failure
    }

    next();
  });
};

export default verifyJWT;
