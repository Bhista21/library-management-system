const express = require("express");
const { get, all, run } = require("../database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/books — list all books, optional search + sort (any logged-in user)
router.get("/", authenticateToken, async (req, res) => {
  const { search, sortBy } = req.query;

  const allowedSortColumns = {
    Title: "title",
    Author: "author",
    Genre: "genre",
    Stock: "stock",
  };
  const orderColumn = allowedSortColumns[sortBy] || "title";

  try {
    let books;
    if (search) {
      const term = `%${search}%`;
      books = await all(
        `SELECT * FROM books
         WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?
         ORDER BY ${orderColumn} COLLATE NOCASE`,
        [term, term, term],
      );
    } else {
      books = await all(
        `SELECT * FROM books ORDER BY ${orderColumn} COLLATE NOCASE`,
      );
    }
    return res.json({ success: true, books });
  } catch (err) {
    console.error("Fetch books error:", err);
    return res.status(500).json({ success: false, message: "Could not fetch books." });
  }
});

// GET /api/books/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const book = await get("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    return res.json({ success: true, book });
  } catch (err) {
    console.error("Fetch book error:", err);
    return res.status(500).json({ success: false, message: "Could not fetch book." });
  }
});

// POST /api/books — create a book (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const { title, author, genre, isbn, stock, cover_image } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required." });
  }

  try {
    const result = await run(
      `INSERT INTO books (title, author, genre, isbn, stock, cover_image, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author || null,
        genre || null,
        isbn || null,
        stock ? Number(stock) : 0,
        cover_image || null,
        req.user.id,
      ],
    );

    return res.json({ success: true, bookId: result.lastInsertRowid });
  } catch (err) {
    console.error("Create book error:", err);
    return res.status(500).json({ success: false, message: "Could not create book." });
  }
});

// PUT /api/books/:id — edit a book (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { title, author, genre, isbn, stock, cover_image } = req.body;
  const { id } = req.params;

  try {
    const existing = await get("SELECT * FROM books WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    await run(
      `UPDATE books SET
        title = ?, author = ?, genre = ?, isbn = ?, stock = ?, cover_image = ?
       WHERE id = ?`,
      [
        title ?? existing.title,
        author ?? existing.author,
        genre ?? existing.genre,
        isbn ?? existing.isbn,
        stock !== undefined ? Number(stock) : existing.stock,
        cover_image ?? existing.cover_image,
        id,
      ],
    );

    return res.json({ success: true, message: "Book updated." });
  } catch (err) {
    console.error("Update book error:", err);
    return res.status(500).json({ success: false, message: "Could not update book." });
  }
});

// DELETE /api/books/:id — delete a book (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await run("DELETE FROM books WHERE id = ?", [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    return res.json({ success: true, message: "Book deleted." });
  } catch (err) {
    console.error("Delete book error:", err);
    return res.status(500).json({ success: false, message: "Could not delete book." });
  }
});

module.exports = router;
