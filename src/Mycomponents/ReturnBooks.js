import React, { useEffect, useState } from "react";
import "./Css/ReturnBooks.css";

function ReturnBooks() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returning, setReturning] = useState(null);

  const loadBorrowedBooks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/borrow/active", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load borrowed books.");
      }

      setRecords(data.records || []);
    } catch (err) {
      console.error("Load borrowed books error:", err);
      setError(err.message || "Could not load borrowed books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowedBooks();
  }, []);

  // =====================================================
  // RETURN BOOK
  // =====================================================

  const handleReturn = async (record) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in.");
      return;
    }

    const confirmed = window.confirm(
      `Return "${record.book_title}" borrowed by ${record.member_name}?`,
    );

    if (!confirmed) return;

    setReturning(record.id);

    try {
      const response = await fetch(`/api/borrow/${record.id}/return`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Could not return the book.");
        return;
      }

      alert(
        `Book returned successfully!\n\nStock: ${data.stockBefore} → ${data.stockAfter}`,
      );

      // Remove returned book from the table
      setRecords((currentRecords) =>
        currentRecords.filter((item) => item.id !== record.id),
      );
    } catch (err) {
      console.error("Return book error:", err);
      alert("Could not reach the server.");
    } finally {
      setReturning(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="return-books-page">
        <h1>Return Books</h1>
        <p className="loading-text">Loading borrowed books...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="return-books-page">
        <h1>Return Books</h1>

        <div className="error-box">
          <h2>Could not load borrowed books</h2>
          <p>{error}</p>

          <button className="retry-btn" onClick={loadBorrowedBooks}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="return-books-page">
      <div className="return-books-header">
        <div>
          <h1>Return Books</h1>
          <p>Manage books currently borrowed by members.</p>
        </div>

        <div className="borrowed-count">
          {records.length} {records.length === 1 ? "Book" : "Books"} Borrowed
        </div>
      </div>

      {records.length === 0 ? (
        <div className="empty-box">
          <h2>No Books Currently Borrowed</h2>
          <p>All books have been returned.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="return-books-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Member</th>
                <th>Email</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record, index) => (
                <tr key={record.id}>
                  <td>{index + 1}</td>

                  <td className="book-title">{record.book_title}</td>

                  <td>{record.member_name}</td>

                  <td>{record.email}</td>

                  <td>
                    {record.issue_date
                      ? new Date(record.issue_date).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td>
                    <span className="issued-badge">Issued</span>
                  </td>

                  <td>
                    <button
                      className="return-book-btn"
                      onClick={() => handleReturn(record)}
                      disabled={returning === record.id}
                    >
                      {returning === record.id ? "Returning..." : "Return Book"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReturnBooks;
