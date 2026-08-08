const express = require("express");
const { db, all } = require("../database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/borrow — issue a book to a user (Admin only)
// body: { bookId, userId, dueDate }
router.post("/", authenticateToken, async (req, res) => {
  const { bookId, dueDate } = req.body;

  if (!bookId) {
    return res.status(400).json({
      success: false,
      message: "bookId is required.",
    });
  }

  const userId = req.user.id;

  const tx = await db.transaction("write");

  try {
    const bookResult = await tx.execute({
      sql: "SELECT * FROM books WHERE id = ?",
      args: [bookId],
    });

    const book = bookResult.rows[0];

    if (!book) {
      await tx.rollback();

      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    if (book.stock < 1) {
      await tx.rollback();

      return res.status(400).json({
        success: false,
        message: "No copies available.",
      });
    }

    // Prevent user from borrowing the same book twice
    const existingResult = await tx.execute({
      sql: `
        SELECT id
        FROM borrow_records
        WHERE book_id = ?
        AND user_id = ?
        AND status = 'issued'
      `,
      args: [bookId, userId],
    });

    if (existingResult.rows.length > 0) {
      await tx.rollback();

      return res.status(400).json({
        success: false,
        message: "You already have this book.",
      });
    }

    await tx.execute({
      sql: "UPDATE books SET stock = stock - 1 WHERE id = ?",
      args: [bookId],
    });

    const insertResult = await tx.execute({
      sql: `
        INSERT INTO borrow_records
        (book_id, user_id, due_date, status)
        VALUES (?, ?, ?, 'issued')
      `,
      args: [bookId, userId, dueDate || null],
    });

    await tx.commit();

    return res.json({
      success: true,
      message: "Book borrowed successfully.",
      recordId: Number(insertResult.lastInsertRowid),
    });
  } catch (err) {
    console.error("Borrow book error:", err);

    try {
      await tx.rollback();
    } catch (_) {}

    return res.status(500).json({
      success: false,
      message: "Could not borrow book.",
    });
  }
});

// PUT /api/borrow/:id/return
router.put("/:id/return", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const tx = await db.transaction("write");
  try {
    const recResult = await tx.execute({
      sql: "SELECT * FROM borrow_records WHERE id = ?",
      args: [id],
    });
    const record = recResult.rows[0];
    if (!record) {
      await tx.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Borrow record not found." });
    }

    if (req.user.role !== "Admin" && record.user_id !== req.user.id) {
      await tx.rollback();
      return res.status(403).json({
        success: false,
        message: "You can only return your own books.",
      });
    }
    if (record.status === "returned") {
      await tx.rollback();
      return res
        .status(400)
        .json({ success: false, message: "This book was already returned." });
    }

    await tx.execute({
      sql: `UPDATE borrow_records SET status = 'returned', return_date = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [id],
    });
    await tx.execute({
      sql: "UPDATE books SET stock = stock + 1 WHERE id = ?",
      args: [record.book_id],
    });

    await tx.commit();

    return res.json({ success: true, message: "Book returned." });
  } catch (err) {
    console.error("Return book error:", err);
    try {
      await tx.rollback();
    } catch (_) {}
    return res
      .status(500)
      .json({ success: false, message: "Could not return book." });
  }
});

// GET /api/borrow — Admin sees all records, regular users see only their own
router.get("/", authenticateToken, async (req, res) => {
  try {
    let records;
    if (req.user.role === "Admin") {
      records = await all(`
  SELECT
    br.*,
    b.title AS book_title,
    TRIM(u.first_name || ' ' || u.last_name) AS user_name
  FROM borrow_records br
  JOIN books b ON b.id = br.book_id
  JOIN users u ON u.id = br.user_id
  ORDER BY br.issue_date DESC
`);
    } else {
      records = await all(
        `SELECT br.*, b.title AS book_title
         FROM borrow_records br
         JOIN books b ON b.id = br.book_id
         WHERE br.user_id = ?
         ORDER BY br.issue_date DESC`,
        [req.user.id],
      );
    }
    return res.json({ success: true, records });
  } catch (err) {
    console.error("Fetch borrow records error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not fetch borrow records." });
  }
});

module.exports = router;
