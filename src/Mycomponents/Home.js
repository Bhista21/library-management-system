import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./Css/Home.css";

function Home() {
  return (
    <div className="Home-container">
      <section className="hero">
        <h1>Welcome to the Library</h1>
        <p>Search, Borrow and Manage Books Easily</p>

        <div className="search-box">
          <input type="text" placeholder="Search books..." />
          <button>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
