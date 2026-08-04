// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("./database");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static frontend assets

app.use(express.static(path.join(__dirname, "../src/Mycomponents  ")));

// Default route redirect
app.get("/", (req, res) => res.redirect("/Register.js"));

// Integrated Signup Endpoint

app.post("/api/signup", (req, res) => {
  const { name, firstName, lastName, age, gender, email, password, role } =
    req.body;

  // Resolve full name (handles both single 'name' and React 'firstName' + 'lastName')
  const userFullName =
    name || [firstName, lastName].filter(Boolean).join(" ").trim();

  // Basic validation
  if (!userFullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided.",
    });
  }

  try {
    // Check if user already exists
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "That email is already registered." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Try inserting with extended schema (if table supports extra fields)
    try {
      db.prepare(
        `
        INSERT INTO users (
          name, 
          first_name, 
          last_name, 
          age, 
          gender, 
          email, 
          password, 
          role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        userFullName,
        firstName || null,
        lastName || null,
        age ? Number(age) : null,
        gender || null,
        email,
        hashedPassword,
        role || "User",
      );
    } catch (schemaErr) {
      // Fallback query if table only contains basic columns (name, email, password)
      db.prepare(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      ).run(userFullName, email, hashedPassword);
    }

    return res.json({
      success: true,
      message: `Account created successfully! Welcome ${firstName || userFullName}!`,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server." });
  }
});

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
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

    const displayName = user.first_name || user.name || "User";
    return res.json({
      success: true,
      message: `Welcome back, ${displayName}!`,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
