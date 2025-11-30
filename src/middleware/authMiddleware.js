import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: Map decoded.id to userId
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
