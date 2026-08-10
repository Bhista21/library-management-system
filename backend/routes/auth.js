const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { get, all, run } = require("../database");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// =====================================================
// POST /api/signup
// =====================================================

router.post("/signup", async (req, res) => {
  const { firstName, lastName, age, gender, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided.",
    });
  }

  try {
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "That email is already registered.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const finalRole = role === "Admin" ? "Admin" : "User";

    const result = await run(
      `INSERT INTO users
       (first_name, last_name, age, gender, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
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
      message: `Account created successfully! Welcome ${
        firstName + " " + lastName
      }!`,
      userId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error("Signup error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on the server.",
    });
  }
});

// =====================================================
// POST /api/login
// =====================================================

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    const displayName =
      `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

    return res.json({
      success: true,
      message: `Welcome back, ${displayName}!`,
      token,

      user: {
        id: user.id,
        name: displayName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

// =====================================================
// GET /api/users
// GET ONLY MEMBERS
// ADMINS ARE EXCLUDED
// =====================================================

router.get("/users", async (req, res) => {
  try {
    const users = await all(
      `SELECT
        id,
        first_name,
        last_name,
        age,
        gender,
        email,
        role
       FROM users
       WHERE role != 'Admin'
       ORDER BY id ASC`,
    );

    const members = users.map((user) => ({
      id: user.id,

      name:
        `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",

      age: user.age,

      gender: user.gender,

      email: user.email,

      role: user.role,
    }));

    return res.json({
      success: true,
      users: members,
    });
  } catch (err) {
    console.error("Get members error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not fetch members.",
    });
  }
});

// =====================================================
// DELETE /api/users/:id
// DELETE MEMBER
// =====================================================

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find user
    const user = await get("SELECT id, role FROM users WHERE id = ?", [id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    // Never allow an admin to be deleted
    if (user.role === "Admin" || user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrators cannot be deleted.",
      });
    }

    // Delete member
    await run("DELETE FROM users WHERE id = ?", [id]);

    return res.json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (err) {
    console.error("Delete member error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not delete member.",
    });
  }
});

module.exports = router;
