import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Userdashboard.css";

function UserDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/Member");
        return;
      }

      const response = await fetch("/api/dashboard/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load dashboard");
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>

        <button onClick={loadDashboard}>Try Again</button>
      </div>
    );
  }

  const stats = data.stats;

  const firstName = data.user?.first_name || "User";

  return (
    <div className="user-dashboard">
      <div className="user-welcome">
        <div>
          <h1>Welcome back, {firstName} </h1>

          <p>Here's what's happening with your library account.</p>
        </div>

        <button className="browse-btn" onClick={() => navigate("/books")}>
          Browse Books
        </button>
      </div>

      {/* USER STATS */}

      <div className="user-stats">
        <div className="user-stat-card">
   

          <div>
            <small>Currently Borrowed</small>
            <h2>{stats.currentlyBorrowed}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          

          <div>
            <small>Overdue</small>
            <h2>{stats.overdueBooks}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          

          <div>
            <small>Total Borrowed</small>
            <h2>{stats.totalBorrowed}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          
          <div>
            <small>Available Books</small>
            <h2>{stats.availableBooks}</h2>
          </div>
        </div>
      </div>

      {/* MY BOOKS */}

      <div className="user-panel">
        <div className="user-panel-header">
          <h2>My Books</h2>

          <button onClick={() => navigate("/books")}>Browse Books</button>
        </div>

        {data.myBooks.length === 0 ? (
          <div className="empty-message">
            <p>You haven't borrowed any books yet.</p>

            <button onClick={() => navigate("/books")}>Find a Book</button>
          </div>
        ) : (
          data.myBooks.map((book) => (
            <div className="user-book" key={book.id}>
              
              <div className="user-book-info">
                <h3>{book.title}</h3>

                <p>{book.author || "Unknown author"}</p>

                <small>
                  Status: <strong>{book.status}</strong>
                </small>

                {book.due_date && (
                  <div>Due: {new Date(book.due_date).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* RECENT BOOKS */}

      <div className="user-panel">
        <div className="user-panel-header">
          <h2>Recently Added Books</h2>

          <button onClick={() => navigate("/books")}>View All</button>
        </div>

        <div className="recommended-books">
          {data.recentBooks.map((book) => (
            <div className="recommended-book" key={book.id}>
         

              <h3>{book.title}</h3>

              <p>{book.author || "Unknown author"}</p>

              <span>{book.stock > 0 ? "Available" : "Out of stock"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
