import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Css/Bookdetail.css";

function BookDetails() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowing, setBorrowing] = useState(false);

  // =========================
  // FETCH BOOK
  // =========================
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view book details.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/books/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not fetch book.");
        }

        setBook(data.book);
      } catch (err) {
        console.error("Book details error:", err);
        setError(err.message || "Could not load book.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // =========================
  // BORROW BOOK
  // =========================
  const handleBorrow = async () => {
    if (!book) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (book.stock <= 0) {
      alert("This book is currently out of stock.");
      return;
    }

    setBorrowing(true);

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Could not borrow book.");
        return;
      }

      // Reduce stock immediately on the page
      setBook((previousBook) => ({
        ...previousBook,
        stock: previousBook.stock - 1,
      }));

      alert("Book borrowed successfully!");
    } catch (err) {
      console.error("Borrow error:", err);
      alert("Could not reach the server.");
    } finally {
      setBorrowing(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="bookdetail">
        <h2>Loading book...</h2>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
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

  // =========================
  // BOOK NOT FOUND
  // =========================
  if (!book) {
    return (
      <div className="bookdetail">
        <div className="info">
          <h2>Book not found.</h2>
        </div>
      </div>
    );
  }

  // =========================
  // BOOK DETAILS
  // =========================
  return (
    <div className="bookdetail">
      {/* BOOK COVER */}
      <div className="cover-pic">
        {book.cover_image ? (
          <img src={book.cover_image} alt={book.title} />
        ) : (
          <div className="no-cover">No Image</div>
        )}
      </div>

      {/* BOOK INFORMATION */}
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
          <p>{book.description || "No description available."}</p>
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

        {/* BORROW BUTTON */}
        <button
          className="borrow-btn"
          onClick={handleBorrow}
          disabled={book.stock <= 0 || borrowing}
        >
          {borrowing
            ? "Borrowing..."
            : book.stock > 0
              ? "Borrow Book"
              : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

export default BookDetails;
