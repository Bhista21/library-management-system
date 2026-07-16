import React from "react";
import "./Css/Books.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
function Books() {
  return (
    <div className="Books">
      <div className="top-bar">
        <div className="search-box">
          <input type="text" placeholder="Search books..." />
          <button>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        <div className="sortby">
          <label for="Filter">Sort by</label>
          <select id="Filter">
            <option value="Genre">Genre</option>
            <option value="Author">Author</option>
            <option value="Title">Title</option>
            <option value="Stock">Stock</option>
          </select>
        </div>
      </div>
      <div className="booklist">
        <table id="Booklist">
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Author</th>
            <th>Stock</th>
          </tr>
        </table>
      </div>
    </div>
  );
}

export default Books;
