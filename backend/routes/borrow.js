const express = require("express");
const { db, get, all, run } = require("../database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/*
  POST /api/borrow
  Admin issues a book to a user
*/
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
    // ============================
    // FIND BOOK
    // ============================

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

    // ============================
    // CHECK STOCK
    // ============================

    if (Number(book.stock) <= 0) {
      await tx.rollback();

      return res.status(400).json({
        success: false,
        message: "No copies available.",
      });
    }

    // ============================
    // CHECK IF USER ALREADY
    // HAS THIS BOOK
    // ============================

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

    // ============================
    // REDUCE STOCK
    // ============================

    await tx.execute({
      sql: `
        UPDATE books
        SET stock = stock - 1
        WHERE id = ?
      `,
      args: [bookId],
    });

    // ============================
    // CREATE BORROW RECORD
    // ============================

    const result = await tx.execute({
      sql: `
        INSERT INTO borrow_records
        (
          book_id,
          user_id,
          due_date,
          status
        )
        VALUES (?, ?, ?, 'issued')
      `,
      args: [bookId, userId, dueDate || null],
    });

    await tx.commit();

    return res.json({
      success: true,
      message: "Book borrowed successfully.",
      recordId: Number(result.lastInsertRowid),

      stockBefore: Number(book.stock),
      stockAfter: Number(book.stock) - 1,
    });
  } catch (err) {
    console.error("Borrow error:", err);

    try {
      await tx.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    return res.status(500).json({
      success: false,
      message: "Could not borrow book.",
    });
  }
});

/*
  PUT /api/borrow/:id/return

  User:
    Can return their own book.

  Admin:
    Can return any book.
*/
router.put("/:id/return", authenticateToken, async (req, res) => {
  const recordId = req.params.id;

  const tx = await db.transaction("write");

  try {
    const recordResult = await tx.execute({
      sql: `
        SELECT
          br.*,
          b.title AS book_title,
          b.stock AS current_stock
        FROM borrow_records br
        JOIN books b
          ON b.id = br.book_id
        WHERE br.id = ?
      `,
      args: [recordId],
    });

    const record = recordResult.rows[0];

    if (!record) {
      await tx.rollback();

      return res.status(404).json({
        success: false,
        message: "Borrow record not found.",
      });
    }

    // User can only return their own book
    // Admin can return any book.
    if (
      req.user.role !== "Admin" &&
      Number(record.user_id) !== Number(req.user.id)
    ) {
      await tx.rollback();

      return res.status(403).json({
        success: false,
        message: "You can only return your own books.",
      });
    }

    // Prevent double return
    if (record.status === "returned") {
      await tx.rollback();

      return res.status(400).json({
        success: false,
        message: "This book has already been returned.",
      });
    }

    if (record.status !== "issued") {
      await tx.rollback();

      return res.status(400).json({
        success: false,
        message: "This borrow record cannot be returned.",
      });
    }

    const stockBefore = Number(record.current_stock);

    // Mark returned
    await tx.execute({
      sql: `
        UPDATE borrow_records
        SET
          status = 'returned',
          return_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [recordId],
    });

    // Return exactly ONE copy
    await tx.execute({
      sql: `
        UPDATE books
        SET stock = stock + 1
        WHERE id = ?
      `,
      args: [record.book_id],
    });

    await tx.commit();

    return res.json({
      success: true,
      message: `"${record.book_title}" returned successfully.`,
      stockBefore,
      stockAfter: stockBefore + 1,
    });
  } catch (err) {
    console.error("Return book error:", err);

    try {
      await tx.rollback();
    } catch (rollbackError) {}

    return res.status(500).json({
      success: false,
      message: "Could not return book.",
    });
  }
});

/*
  GET /api/borrow

  Admin:
    Gets every borrow record.

  User:
    Gets only their own borrow records.
*/
router.get("/", authenticateToken, async (req, res) => {
  try {
    let records;

    if (req.user.role === "Admin") {
      records = await all(`
        SELECT
          br.*,
          b.title AS book_title,
          b.author AS book_author,
          u.first_name AS first_name,
          u.last_name AS last_name,
          u.email AS user_email
        FROM borrow_records br
        JOIN books b
          ON b.id = br.book_id
        JOIN users u
          ON u.id = br.user_id
        ORDER BY br.issue_date DESC
      `);
    } else {
      records = await all(
        `
        SELECT
          br.*,
          b.title AS book_title,
          b.author AS book_author
        FROM borrow_records br
        JOIN books b
          ON b.id = br.book_id
        WHERE br.user_id = ?
        ORDER BY br.issue_date DESC
        `,
        [req.user.id],
      );
    }

    return res.json({
      success: true,
      records,
    });
  } catch (err) {
    console.error("Fetch borrow records error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not fetch borrow records.",
    });
  }
});
// =====================================================
// GET /api/borrow/active
// GET ALL CURRENTLY BORROWED BOOKS
// =====================================================

router.get("/active", async (req, res) => {
  try {
    const records = await all(`
      SELECT
        br.id,
        br.book_id,
        br.user_id,
        br.issue_date,
        br.status,

        b.title AS book_title,

        u.first_name,
        u.last_name,
        u.email

      FROM borrow_records br

      JOIN books b
        ON br.book_id = b.id

      JOIN users u
        ON br.user_id = u.id

      WHERE br.status = 'issued'

      ORDER BY br.issue_date DESC
    `);

    const borrowedBooks = records.map((record) => ({
      id: record.id,
      book_id: record.book_id,
      user_id: record.user_id,

      book_title: record.book_title,

      member_name:
        `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
        "Unknown",

      email: record.email,

      issue_date: record.issue_date,

      status: record.status,
    }));

    return res.json({
      success: true,
      records: borrowedBooks,
    });
  } catch (err) {
    console.error("Get active borrow records error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not fetch borrowed books.",
    });
  }
});
module.exports = router;
