import React, { useState } from "react";
import "./Css/issuebook.css";

function Issuebook() {
  const [formData, setFormData] = useState({
    Title: "",
    Author: "",
    Stock: "",
    Genre: "",
  });

  const [fileName, setFileName] = useState("No files selected.");
  const [previewUrl, setPreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Handle text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Remove error while user is typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);

      const reader = new FileReader();

      reader.onload = (ev) => {
        setPreviewUrl(ev.target.result);
      };

      reader.readAsDataURL(file);

      // Remove cover error
      setErrors((prev) => ({
        ...prev,
        cover: "",
      }));
    }
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Title
    if (!formData.Title.trim()) {
      newErrors.Title = "Book title is required.";
    } else if (formData.Title.trim().length < 2) {
      newErrors.Title = "Book title must be at least 2 characters.";
    }

    // Author
    if (!formData.Author.trim()) {
      newErrors.Author = "Author name is required.";
    } else if (formData.Author.trim().length < 2) {
      newErrors.Author = "Author name must be at least 2 characters.";
    }

    // Genre
    if (!formData.Genre.trim()) {
      newErrors.Genre = "Genre is required.";
    }

    // Stock
    if (!formData.Stock) {
      newErrors.Stock = "Stock quantity is required.";
    } else if (Number(formData.Stock) < 1) {
      newErrors.Stock = "Stock must be at least 1.";
    } else if (Number(formData.Stock) > 120) {
      newErrors.Stock = "Stock cannot be more than 120.";
    }

    // Book cover
    if (!previewUrl) {
      newErrors.cover = "Please select a book cover.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newBook = {
      Title: formData.Title.trim(),
      Author: formData.Author.trim(),
      Stock: Number(formData.Stock),
      Genre: formData.Genre.trim(),
    };

    console.log("Book submitted:", newBook);

    // Success popup
    setPopupMessage(
      `"${newBook.Title}" has been successfully added to the library.`,
    );

    setShowPopup(true);
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="issuebook-container">
      <form id="issueBookForm" onSubmit={handleSubmit} noValidate>
        <h1 className="issuebook-title">Issue Books</h1>

        <h2 className="issuebook-subtitle">Book Details</h2>

        <div className="issuebook-group">
          {/* TITLE */}
          <div>
            <label htmlFor="bookTitle">Title:</label>

            <input
              type="text"
              id="bookTitle"
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              className={errors.Title ? "input-error" : ""}
              placeholder="Enter book title"
            />

            {errors.Title && (
              <span className="issuebook-error">{errors.Title}</span>
            )}
          </div>

          {/* AUTHOR */}
          <div>
            <label htmlFor="bookAuthor">Author:</label>

            <input
              type="text"
              id="bookAuthor"
              name="Author"
              value={formData.Author}
              onChange={handleChange}
              className={errors.Author ? "input-error" : ""}
              placeholder="Enter author name"
            />

            {errors.Author && (
              <span className="issuebook-error">{errors.Author}</span>
            )}
          </div>

          {/* GENRE */}
          <div>
            <label htmlFor="bookGenre">Genre:</label>

            <input
              type="text"
              id="bookGenre"
              name="Genre"
              value={formData.Genre}
              onChange={handleChange}
              className={errors.Genre ? "input-error" : ""}
              placeholder="Enter book genre"
            />

            {errors.Genre && (
              <span className="issuebook-error">{errors.Genre}</span>
            )}
          </div>

          {/* STOCK */}
          <div>
            <label htmlFor="bookStock">Stock:</label>

            <input
              type="number"
              id="bookStock"
              name="Stock"
              min="1"
              max="120"
              value={formData.Stock}
              onChange={handleChange}
              className={errors.Stock ? "input-error" : ""}
              placeholder="Enter stock"
            />

            {errors.Stock && (
              <span className="issuebook-error">{errors.Stock}</span>
            )}
          </div>

          {/* BOOK COVER */}
          <div>
            <label>Book Cover:</label>

            <button
              type="button"
              id="bookBrowseBtn"
              onClick={() => document.getElementById("bookCover").click()}
            >
              Browse...
            </button>

            <input
              type="file"
              id="bookCover"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <span
              id="bookFileName"
              className={errors.cover ? "file-error" : ""}
            >
              {fileName}
            </span>

            {errors.cover && (
              <span className="issuebook-error">{errors.cover}</span>
            )}

            {/* IMAGE PREVIEW */}
            {previewUrl && (
              <div id="bookImagePreview" style={{ marginTop: "10px" }}>
                <img
                  src={previewUrl}
                  alt="Book cover preview"
                  style={{
                    width: "120px",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="Submit-button">
            <button type="submit" id="Submit">
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div id="issueBookSuccessPopup" className="issuebook-success-popup">
          <h3>Registration Successful</h3>

          <p>{popupMessage}</p>

          <button type="button" onClick={closePopup}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}

export default Issuebook;
