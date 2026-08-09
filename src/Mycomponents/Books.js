import React, { useEffect, useState } from "react";
import "./Css/Books.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Title");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      let url = `/api/books?sortBy=${encodeURIComponent(sortBy)}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load books.");
      }

      setBooks(data.books || []);
    } catch (err) {
      console.error("Books error:", err);
      setError(err.message || "Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  // Load books when page opens and when sorting changes
  useEffect(() => {
    fetchBooks();
  }, [sortBy]);

  // Search button
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div className="book-container">
      <div className="Books">
        {/* SEARCH + SORT */}

        <div className="top-bar">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>

          {/* SORT */}

          <div className="sortby">
            <label htmlFor="Filter">Sort by</label>

            <select
              id="Filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Genre">Genre</option>

              <option value="Author">Author</option>

              <option value="Title">Title</option>

              <option value="Stock">Stock</option>
            </select>
          </div>
        </div>

        {/* BOOK LIST */}

        <div className="booklist">
          {loading && <p>Loading books...</p>}

          {error && <p className="issuebook-error">{error}</p>}

          {!loading && !error && books.length === 0 && <p>No books found.</p>}

          {!loading && !error && books.length > 0 && (
            <table id="Booklist">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Author</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr
                    key={book.id}
                    onClick={() => {
                      window.location.href = `/book/${book.id}`;
                    }}
                    style={{ cursor: "pointer" }}
                    className={Number(book.stock) < 5 ? "low-stock" : ""}
                  >
                    <td>{book.title}</td>
                    <td>{book.genre}</td>
                    <td>{book.author}</td>
                    <td>
                      {book.stock}
                      {Number(book.stock) < 5 && (
                        <span className="low-stock-alert"> Low Stock!</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Books;
