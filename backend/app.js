require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { ensureSchema } = require("./database");
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const borrowRoutes = require("./routes/borrow");
const dashboardRoutes = require("./routes/dashboard");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Make sure the Turso tables exist before handling any request.
// Matters most on Vercel, where a cold start shouldn't race a query
// against table creation.
app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error("Schema init error:", err);
    res.status(500).json({ success: false, message: "Database not ready." });
  }
});

app.use("/api", authRoutes); // /api/signup, /api/login
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Library Management System API is running." });
});

module.exports = app;
