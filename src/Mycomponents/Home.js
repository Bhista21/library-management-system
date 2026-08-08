import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Css/Home.css";

function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    const searchTerm = search.trim();

    if (!searchTerm) {
      navigate("/Books");
      return;
    }

    navigate(`/Books?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="Home-container">
      <section className="hero">
        <h1>Welcome to the Library</h1>

        <p>Search, Borrow and Manage Books Easily</p>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit" aria-label="Search books">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>
      </section>
    </div>
  );
}

export default Home;
