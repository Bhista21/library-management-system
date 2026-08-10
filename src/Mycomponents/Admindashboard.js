import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Admindashboard.css";

function AdminDashboard() {
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

      const response = await fetch("/api/dashboard/admin", {
        method: "GET",
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
    return <div className="dashboard-loading">Loading admin dashboard...</div>;
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

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your library and monitor its activity.</p>
        </div>

        <button className="admin-add-btn" onClick={() => navigate("/books")}>
          + Manage Books
        </button>
      </div>

      {/* STATISTICS */}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <span>Total Books</span>
            <h2>{stats.totalBooks}</h2>
            <small>Book titles</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span>Total Members</span>
            <h2>{stats.totalMembers}</h2>
            <small>Registered users</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span>Books Issued</span>
            <h2>{stats.issuedBooks}</h2>
            <small>Currently borrowed</small>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="admin-actions-panel">
        <h2>Quick Actions</h2>

        <div className="admin-actions">
          <button onClick={() => navigate("/books")}>
            <span>Manage Books</span>
          </button>

          <button onClick={() => navigate("/ManageMember")}>
            <span>Manage Members</span>
          </button>

          <button onClick={() => navigate("/Issuebooks")}>
            <span>Issue Book</span>
          </button>

          <button onClick={() => navigate("/ReturnBooks")}>
            <span>Return Book</span>
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY */}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>Recent Activity</h2>
        </div>

        {data.recentActivity.length === 0 ? (
          <p className="empty-message">No borrowing activity yet.</p>
        ) : (
          data.recentActivity.map((activity) => {
            const name =
              `${activity.first_name || ""} ${activity.last_name || ""}`.trim() ||
              activity.email;

            return (
              <div className="admin-activity" key={activity.id}>
                <div className="activity-symbol">
                  {activity.status === "returned" ? "↩️" : "📖"}
                </div>

                <div>
                  <strong>
                    {activity.status === "returned"
                      ? "Book Returned"
                      : "Book Issued"}
                  </strong>

                  <p>
                    <b>{activity.book_title}</b>
                  </p>

                  <small>{name}</small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POPULAR BOOKS */}

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>Popular Books</h2>
        </div>

        <div className="admin-table">
          <div className="admin-table-row admin-table-heading">
            <span>Book</span>
            <span>Author</span>
            <span>Genre</span>
            <span>Issued</span>
            <span>Stock</span>
          </div>

          {data.popularBooks.map((book) => (
            <div className="admin-table-row" key={book.id}>
              <strong>{book.title}</strong>

              <span>{book.author || "Unknown"}</span>

              <span>{book.genre || "Other"}</span>

              <span>{book.times_issued}</span>

              <span
                className={book.stock > 0 ? "book-available" : "book-issued"}
              >
                {book.stock > 0 ? `${book.stock} available` : "Out of stock"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
