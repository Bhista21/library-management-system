const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET is not set in .env — set it before running in production.",
  );
}

// Verifies the token and attaches the decoded user info to req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token." });
    }
    req.user = user; // { id, email, role }
    next();
  });
}

// Must be used AFTER authenticateToken
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required." });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
