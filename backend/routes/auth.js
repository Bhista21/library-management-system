const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { get, run } = require("../database");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/signup
router.post("/signup", async (req, res) => {
  const { name, firstName, lastName, age, gender, email, password, role } =
    req.body;

  const userFullName =
    name || [firstName, lastName].filter(Boolean).join(" ").trim();

  if (!userFullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided.",
    });
  }

  try {
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);

    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "That email is already registered." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const finalRole = role === "Admin" ? "Admin" : "User";

    const result = await run(
      `INSERT INTO users (name, first_name, last_name, age, gender, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userFullName,
        firstName || null,
        lastName || null,
        age ? Number(age) : null,
        gender || null,
        email,
        hashedPassword,
        finalRole,
      ],
    );

    return res.json({
      success: true,
      message: `Account created successfully! Welcome ${firstName || userFullName}!`,
      userId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server." });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    const displayName = user.first_name || user.name || "User";

    return res.json({
      success: true,
      message: `Welcome back, ${displayName}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

module.exports = router;
