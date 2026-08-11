const express = require("express");
const { get, all } = require("../database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/*
====================================================
ADMIN DASHBOARD
GET /api/dashboard/admin
====================================================
*/

router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalBooks = await get(`
      SELECT COUNT(*) AS count
      FROM books
    `);

    const totalMembers = await get(`
      SELECT COUNT(*) AS count
      FROM users
      WHERE role = 'User'
    `);

    const issuedBooks = await get(`
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE status = 'issued'
    `);

    const overdueBooks = await get(`
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE status = 'issued'
    `);

    const availableCopies = await get(`
      SELECT COALESCE(SUM(stock), 0) AS count
      FROM books
    `);

    const recentActivity = await all(`
      SELECT
        br.id,
        br.issue_date,
  
        br.return_date,
        br.status,
        b.title AS book_title,
        u.first_name,
        u.last_name,
        u.email
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      JOIN users u ON u.id = br.user_id
      ORDER BY br.issue_date DESC
      LIMIT 10
    `);

    const popularBooks = await all(`
      SELECT
        b.id,
        b.title,
        b.author,
        b.genre,
        b.stock,
        COUNT(br.id) AS times_issued
      FROM books b
      LEFT JOIN borrow_records br
        ON br.book_id = b.id
      GROUP BY b.id
      ORDER BY times_issued DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      stats: {
        totalBooks: Number(totalBooks?.count || 0),
        totalMembers: Number(totalMembers?.count || 0),
        issuedBooks: Number(issuedBooks?.count || 0),
        overdueBooks: Number(overdueBooks?.count || 0),
        availableCopies: Number(availableCopies?.count || 0),
      },
      recentActivity,
      popularBooks,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not load admin dashboard.",
    });
  }
});

/*
====================================================
USER DASHBOARD
GET /api/dashboard/user
====================================================
*/

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const currentlyBorrowed = await get(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE user_id = ?
      AND status = 'issued'
    `,
      [userId],
    );

    const totalBorrowed = await get(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE user_id = ?
    `,
      [userId],
    );

    const overdueBooks = await get(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE user_id = ?
      AND status = 'issued'
    `,
      [userId],
    );

    const availableBooks = await get(`
      SELECT COUNT(*) AS count
      FROM books
      WHERE stock > 0
    `);

    const myBooks = await all(
      `
      SELECT
        br.id,
        br.book_id,
        br.issue_date,
        br.return_date,
        br.status,
        b.title,
        b.author,
        b.genre,
        b.cover_image
      FROM borrow_records br
      JOIN books b ON b.id = br.book_id
      WHERE br.user_id = ?
      ORDER BY br.issue_date DESC
      LIMIT 10
    `,
      [userId],
    );

    const recentBooks = await all(`
      SELECT
        id,
        title,
        author,
        genre,
        stock,
        cover_image
      FROM books
      ORDER BY created_at DESC
      LIMIT 6
    `);

    const user = await get(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        role
      FROM users
      WHERE id = ?
    `,
      [userId],
    );

    return res.json({
      success: true,

      user,

      stats: {
        currentlyBorrowed: Number(currentlyBorrowed?.count || 0),
        totalBorrowed: Number(totalBorrowed?.count || 0),
        overdueBooks: Number(overdueBooks?.count || 0),
        availableBooks: Number(availableBooks?.count || 0),
      },

      myBooks,
      recentBooks,
    });
  } catch (err) {
    console.error("User dashboard error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not load user dashboard.",
    });
  }
});

module.exports = router;
