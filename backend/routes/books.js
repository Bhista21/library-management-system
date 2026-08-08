const express = require("express");
const { get, all, run } = require("../database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/*
====================================================
GET /api/books
Get all books
Any logged-in user can access
Supports:
  ?search=Harry
  ?sortBy=Title
  ?sortBy=Author
  ?sortBy=Genre
  ?sortBy=Stock
====================================================
*/

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

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;

      books = await all(
        `SELECT
          id,
          title,
          author,
          genre,
          isbn,
          stock,
          cover_image,
          description,
          created_by,
          created_at
         FROM books
         WHERE
           title LIKE ?
           OR author LIKE ?
           OR genre LIKE ?
           OR description LIKE ?
         ORDER BY ${orderColumn} COLLATE NOCASE`,
        [term, term, term, term],
      );
    } else {
      books = await all(
        `SELECT
          id,
          title,
          author,
          genre,
          isbn,
          stock,
          cover_image,
          description,
          created_by,
          created_at
         FROM books
         ORDER BY ${orderColumn} COLLATE NOCASE`,
      );
    }

    return res.json({
      success: true,
      books,
    });
  } catch (err) {
    console.error("Fetch books error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not fetch books.",
    });
  }
});

/*
====================================================
GET /api/books/:id
Get one specific book
Any logged-in user can access
====================================================
*/

router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const book = await get(
      `SELECT
        id,
        title,
        author,
        genre,
        isbn,
        stock,
        cover_image,
        description,
        created_by,
        created_at
       FROM books
       WHERE id = ?`,
      [id],
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.json({
      success: true,
      book,
    });
  } catch (err) {
    console.error("Fetch book error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not fetch book.",
    });
  }
});

/*
====================================================
POST /api/books
Create a new book
ADMIN ONLY
====================================================
*/

router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const { title, author, genre, isbn, stock, cover_image, description } =
    req.body;

  // Title validation
  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Book title is required.",
    });
  }

  // Stock validation
  const bookStock =
    stock === undefined || stock === null || stock === "" ? 0 : Number(stock);

  if (Number.isNaN(bookStock)) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a valid number.",
    });
  }

  if (bookStock < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock cannot be negative.",
    });
  }

  try {
    const result = await run(
      `INSERT INTO books (
          title,
          author,
          genre,
          isbn,
          stock,
          cover_image,
          description,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        author ? author.trim() : null,
        genre ? genre.trim() : null,
        isbn ? isbn.trim() : null,
        bookStock,
        cover_image || null,
        description ? description.trim() : null,
        req.user.id,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Book added successfully.",
      bookId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error("Create book error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not create book.",
    });
  }
});

/*
====================================================
PUT /api/books/:id
Update a book
ADMIN ONLY
====================================================
*/

router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const { title, author, genre, isbn, stock, cover_image, description } =
    req.body;

  try {
    // Check if book exists
    const existing = await get("SELECT * FROM books WHERE id = ?", [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // Keep existing values when fields aren't provided

    const updatedTitle = title !== undefined ? title.trim() : existing.title;

    const updatedAuthor =
      author !== undefined ? (author ? author.trim() : null) : existing.author;

    const updatedGenre =
      genre !== undefined ? (genre ? genre.trim() : null) : existing.genre;

    const updatedIsbn =
      isbn !== undefined ? (isbn ? isbn.trim() : null) : existing.isbn;

    const updatedDescription =
      description !== undefined
        ? description
          ? description.trim()
          : null
        : existing.description;

    const updatedCover =
      cover_image !== undefined ? cover_image : existing.cover_image;

    const updatedStock = stock !== undefined ? Number(stock) : existing.stock;

    // Validate title
    if (!updatedTitle) {
      return res.status(400).json({
        success: false,
        message: "Book title cannot be empty.",
      });
    }

    // Validate stock
    if (Number.isNaN(updatedStock)) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a valid number.",
      });
    }

    if (updatedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative.",
      });
    }

    await run(
      `UPDATE books
         SET
           title = ?,
           author = ?,
           genre = ?,
           isbn = ?,
           stock = ?,
           cover_image = ?,
           description = ?
         WHERE id = ?`,
      [
        updatedTitle,
        updatedAuthor,
        updatedGenre,
        updatedIsbn,
        updatedStock,
        updatedCover,
        updatedDescription,
        id,
      ],
    );

    return res.json({
      success: true,
      message: "Book updated successfully.",
    });
  } catch (err) {
    console.error("Update book error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not update book.",
    });
  }
});

/*
====================================================
DELETE /api/books/:id
Delete a book
ADMIN ONLY
====================================================
*/

router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if book exists
    const existing = await get("SELECT id FROM books WHERE id = ?", [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // Check whether the book is currently borrowed
    const borrowed = await get(
      `SELECT id
         FROM borrow_records
         WHERE book_id = ?
         AND status = 'issued'
         LIMIT 1`,
      [id],
    );

    if (borrowed) {
      return res.status(400).json({
        success: false,
        message: "This book cannot be deleted because it is currently issued.",
      });
    }

    await run("DELETE FROM books WHERE id = ?", [id]);

    return res.json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (err) {
    console.error("Delete book error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not delete book.",
    });
  }
});

module.exports = router;
