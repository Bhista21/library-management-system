import React from "react";
import "./Css/issuebook.css";
function Issuebook() {
  return (
    <div className="issuebook-container">
      <form id="issueBookForm">
        <h1 className="issuebook-title">Issue Books</h1>
        <h2 className="issuebook-subtitle">Book Details</h2>
        <div className="issuebook-group">
          <div>
            <label htmlFor="bookTitle">Title:</label>
            <input type="text" id="bookTitle" />
            <span className="issuebook-error" id="bookTitleError"></span>
          </div>

          <div>
            <label htmlFor="bookAuthor">Author:</label>
            <input type="text" id="bookAuthor" />
            <span className="issuebook-error" id="bookAuthorError"></span>
          </div>

          <div>
            <label htmlFor="bookGenre">Genre:</label>
            <input type="text" id="bookGenre" />
            <span className="issuebook-error" id="bookGenreError"></span>
          </div>

          <div>
            <label htmlFor="bookStock">Stock:</label>
            <input type="number" id="bookStock" min="1" max="120" />
            <span className="issuebook-error" id="bookStockError"></span>
          </div>

          <div>
            <label>Book Cover:</label>

            <button type="button" id="bookBrowseBtn">
              Browse...
            </button>

            <input
              type="file"
              id="bookCover"
              accept="image/*"
              style={{ display: "none" }}
            />

            <span id="bookFileName">No files selected.</span>

            <div id="bookImagePreview" style={{ marginTop: "10px" }}></div>
          </div>
          <div className="Submit-button">
            <button type="submit" id="Submit">
              Submit
            </button>
          </div>
          <div id="issueBookSuccessPopup" className="issuebook-success-popup">
            <h3>Registration Successful</h3>

            <p id="issueBookPopupMessage"></p>

            <button type="button" onClick={() => window.closepopup()}>
              OK
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Issuebook;
