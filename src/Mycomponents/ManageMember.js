import React, { useEffect, useState } from "react";
import "./Css/ManageMembers.css";

function ManageMember() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  const loadMembers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not fetch members.");
      }

      // Only show members, never admins
      const memberUsers = data.users.filter(
        (user) => user.role !== "admin" && user.role !== "Admin",
      );

      setMembers(memberUsers);
    } catch (err) {
      console.error("Load members error:", err);
      setError(err.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    loadMembers();
  }, []);

  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const handleDelete = async (member) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    // Extra frontend protection
    if (member.role === "admin" || member.role === "Admin") {
      alert("You cannot delete an administrator.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${member.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(member.id);

    try {
      const response = await fetch(`/api/users/${member.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Could not delete member.");
        return;
      }

      alert("Member deleted successfully.");

      // Remove deleted member from table
      setMembers((currentMembers) =>
        currentMembers.filter((user) => user.id !== member.id),
      );
    } catch (err) {
      console.error("Delete member error:", err);
      alert("Could not reach the server.");
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="manage-members-page">
        <h1>Manage Members</h1>
        <p className="members-loading">Loading members...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="manage-members-page">
        <h1>Manage Members</h1>

        <div className="members-error">
          <h3>Could not load members</h3>
          <p>{error}</p>

          <button className="retry-btn" onClick={loadMembers}>
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
    <div className="manage-members-page">
      <div className="members-header">
        <div>
          <h1>Manage Members</h1>
          <p>View and manage registered library members.</p>
        </div>

        <div className="member-count">
          <span>{members.length}</span>
          <small>Members</small>
        </div>
      </div>

      <div className="members-table-container">
        {members.length === 0 ? (
          <div className="no-members">
            <h3>No members found</h3>
            <p>There are currently no registered members.</p>
          </div>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>

                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>

                  <td>{member.name || "N/A"}</td>

                  <td>{member.email || "N/A"}</td>

                  <td>
                    <span className="member-role">Member</span>
                  </td>

                  <td>
                    <button
                      className="member-delete-btn"
                      onClick={() => handleDelete(member)}
                      disabled={deleting === member.id}
                    >
                      {deleting === member.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageMember;
