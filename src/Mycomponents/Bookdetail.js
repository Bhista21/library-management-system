import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Css/Bookdetail.css";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [borrowRecord, setBorrowRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [borrowing, setBorrowing] = useState(false);
  const [returning, setReturning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // CHECK IF USER IS ADMIN
  // =====================================================

  const isAdmin = () => {
    const token = localStorage.getItem("token");

    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      return (
        payload.role === "admin" ||
        payload.role === "Admin" ||
        payload.isAdmin === true
      );
    } catch (err) {
      console.error("Could not read token:", err);
      return false;
    }
  };

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

      // Get book
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

      // Get borrow records
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

      // Find active borrow record for this book
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

      await loadBook();
    } catch (err) {
      console.error("Return error:", err);
      alert("Could not reach the server.");
    } finally {
      setReturning(false);
    }
  };

  // =====================================================
  // DELETE BOOK - ADMIN ONLY
  // =====================================================

  const handleDelete = async () => {
    if (!book) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    if (!isAdmin()) {
      alert("Only administrators can delete books.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Could not delete book.");
        return;
      }

      alert("Book deleted successfully!");

      navigate("/Books");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <div>Loading book...</div>;
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div>
        <h2>Could not load book</h2>
        <p>{error}</p>
      </div>
    );
  }

  // =====================================================
  // BOOK NOT FOUND
  // =====================================================

  if (!book) {
    return <div>Book not found.</div>;
  }

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const description =
    book.description || book.Description || "No description available.";

  // =====================================================
  // COVER IMAGE
  // =====================================================

  const coverImage = book.cover_image;

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

        {/* ================= DELETE ================= */}

        {isAdmin() && (
          <div className="delete-section">
            <button
              type="button"
              className="delete-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Book"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetails;
