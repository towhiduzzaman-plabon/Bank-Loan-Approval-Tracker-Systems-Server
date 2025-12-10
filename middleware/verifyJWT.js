import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT verify error:", err);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // decoded = { email, role, id }
    req.user = decoded;
    next();
  });
};

export default verifyJWT;
