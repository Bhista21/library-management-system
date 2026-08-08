import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Css/Bookdetail.css";

function BookDetails() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [borrowRecord, setBorrowRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [borrowing, setBorrowing] = useState(false);
  const [returning, setReturning] = useState(false);

  // =====================================================
  // LOAD BOOK + USER'S BORROW RECORD
  // =====================================================

  const loadBook = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view book details.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // -------------------------
      // Get book
      // -------------------------

      const bookResponse = await fetch(`/api/books/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookData = await bookResponse.json();

      if (!bookResponse.ok || !bookData.success) {
        throw new Error(bookData.message || "Could not fetch book.");
      }

      setBook(bookData.book);

      // -------------------------
      // Get borrow records
      // -------------------------

      const borrowResponse = await fetch("/api/borrow", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const borrowData = await borrowResponse.json();

      if (!borrowResponse.ok || !borrowData.success) {
        throw new Error(
          borrowData.message || "Could not fetch borrow records.",
        );
      }

      // Find an ACTIVE borrow record
      // belonging to this book.

      const activeRecord = borrowData.records.find(
        (record) =>
          Number(record.book_id) === Number(id) && record.status === "issued",
      );

      setBorrowRecord(activeRecord || null);
    } catch (err) {
      console.error("Book details error:", err);
      setError(err.message || "Could not load book.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadBook();
  }, [id]);

  // =====================================================
  // BORROW BOOK
  // =====================================================

  const handleBorrow = async () => {
    if (!book) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (Number(book.stock) <= 0) {
      alert("This book is currently out of stock.");
      return;
    }

    // Don't allow borrowing if already borrowed
    if (borrowRecord) {
      alert("You already have this book.");
      return;
    }

    setBorrowing(true);

    try {
      const response = await fetch("/api/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Could not borrow book.");
        return;
      }

      alert("Book borrowed successfully!");

      // Reload book + borrow record
      await loadBook();
    } catch (err) {
      console.error("Borrow error:", err);
      alert("Could not reach the server.");
    } finally {
      setBorrowing(false);
    }
  };

  // =====================================================
  // RETURN BOOK
  // =====================================================

  const handleReturn = async () => {
    if (!borrowRecord) {
      alert("You have not borrowed this book.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    setReturning(true);

    try {
      const response = await fetch(`/api/borrow/${borrowRecord.id}/return`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Could not return book.");
        return;
      }

      alert(`${data.message}\nStock: ${data.stockBefore} → ${data.stockAfter}`);

      // Reload book and borrow status
      await loadBook();
    } catch (err) {
      console.error("Return error:", err);
      alert("Could not reach the server.");
    } finally {
      setReturning(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="bookdetail">
        <div className="info">
          <h2>Loading book...</h2>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="bookdetail">
        <div className="info">
          <h2>Could not load book</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // BOOK NOT FOUND
  // =====================================================

  if (!book) {
    return (
      <div className="bookdetail">
        <div className="info">
          <h2>Book not found.</h2>
        </div>
      </div>
    );
  }

  // =====================================================
  // DESCRIPTION
  // =====================================================

  // Your database column is "Description".
  // Depending on the SQLite result, it may come back
  // as Description rather than description.

  const description =
    book.description || book.Description || "No description available.";

  // =====================================================
  // COVER IMAGE
  // =====================================================

  let coverImage = book.cover_image;

  /*
    If your database contains a data URL:
      data:image/jpeg;base64,...

    it can be displayed directly.

    If there is no image, show "No Image".
  */

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="bookdetail">
      {/* ================= COVER ================= */}

      <div className="cover-pic">
        {coverImage ? (
          <img src={coverImage} alt={`${book.title} cover`} />
        ) : (
          <div className="no-cover">No Image</div>
        )}
      </div>

      {/* ================= BOOK INFO ================= */}

      <div className="info">
        <h1>{book.title}</h1>

        <div className="book-meta">
          <h3>Author:</h3>
          <p>{book.author || "Unknown"}</p>
        </div>

        <div className="book-meta">
          <h3>Genre:</h3>
          <p>{book.genre || "Unknown"}</p>
        </div>

        <div className="book-meta">
          <h3>Description:</h3>
          <p>{description}</p>
        </div>

        <div className="book-meta">
          <h3>Stock:</h3>
          <h4>{book.stock}</h4>
        </div>

        {book.isbn && (
          <div className="book-meta">
            <h3>ISBN:</h3>
            <p>{book.isbn}</p>
          </div>
        )}

        {/* ================= BORROW ================= */}

        {!borrowRecord && (
          <button
            type="button"
            className="borrow-btn"
            onClick={handleBorrow}
            disabled={Number(book.stock) <= 0 || borrowing}
          >
            {borrowing
              ? "Borrowing..."
              : Number(book.stock) > 0
                ? "Borrow Book"
                : "Out of Stock"}
          </button>
        )}

        {/* ================= RETURN ================= */}

        {borrowRecord && (
          <div className="return-section">
            <p className="borrow-status">You currently have this book.</p>

            <button
              type="button"
              className="return-btn"
              onClick={handleReturn}
              disabled={returning}
            >
              {returning ? "Returning..." : "Return Book"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetails;
