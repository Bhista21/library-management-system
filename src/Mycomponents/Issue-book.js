import React, { useState } from "react";
import "./Css/issuebook.css";

function Issuebook() {
  const [formData, setFormData] = useState({
    Title: "",
    Author: "",
    Stock: "",
    Genre: "",
    ISBN: "",
    Description: "",
  });

  const [fileName, setFileName] = useState("No files selected.");
  const [previewUrl, setPreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle image
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        cover: "Please select an image file.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        cover: "Image must be smaller than 5 MB.",
      }));
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };

    reader.readAsDataURL(file);

    setErrors((prev) => ({
      ...prev,
      cover: "",
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.Title.trim()) {
      newErrors.Title = "Book title is required.";
    } else if (formData.Title.trim().length < 2) {
      newErrors.Title = "Book title must be at least 2 characters.";
    }

    if (!formData.Author.trim()) {
      newErrors.Author = "Author name is required.";
    } else if (formData.Author.trim().length < 2) {
      newErrors.Author = "Author name must be at least 2 characters.";
    }

    if (!formData.Genre.trim()) {
      newErrors.Genre = "Genre is required.";
    }

    if (!formData.Stock) {
      newErrors.Stock = "Stock quantity is required.";
    } else if (Number(formData.Stock) < 1) {
      newErrors.Stock = "Stock must be at least 1.";
    } else if (Number(formData.Stock) > 120) {
      newErrors.Stock = "Stock cannot be more than 120.";
    }

    if (!previewUrl) {
      newErrors.cover = "Please select a book cover.";
    }
    if (!formData.Description) {
      newErrors.Description = "please enter desception";
    }
    if (!formData.ISBN) {
      newErrors.ISBN = "please enter ISBN number";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setErrors({
        server: "You must be logged in as an admin.",
      });
      return;
    }

    setLoading(true);

    try {
      const newBook = {
        title: formData.Title.trim(),
        author: formData.Author.trim(),
        genre: formData.Genre.trim(),
        isbn: formData.ISBN.trim() || null,
        stock: Number(formData.Stock),
        description: formData.Description,
        cover_image: previewUrl,
      };

      console.log("Sending book:", newBook);

      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBook),
      });

      const data = await res.json();

      console.log("Server response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not add the book.");
      }

      // Success
      setPopupMessage(
        `"${newBook.title}" has been successfully added to the library.`,
      );

      setShowPopup(true);

      // Clear form
      setFormData({
        Title: "",
        Author: "",
        Stock: "",
        Genre: "",
        ISBN: "",
        Description: "",
      });

      setFileName("No files selected.");
      setPreviewUrl("");
      setErrors({});

      const fileInput = document.getElementById("bookCover");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Add book error:", err);

      setErrors({
        server: err.message || "Could not reach the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="issuebook-container">
      <h1 className="issuebook-title">Issue Books</h1>

      <form id="issueBookForm" onSubmit={handleSubmit}>
        <h2 className="issuebook-subtitle">Book Details</h2>

        {/* TITLE */}

        <div className="issuebook-group">
          <label htmlFor="bookTitle">Title:</label>

          <input
            type="text"
            id="bookTitle"
            name="Title"
            value={formData.Title}
            onChange={handleChange}
            placeholder="Enter book title"
          />

          {errors.Title && (
            <span className="issuebook-error">{errors.Title}</span>
          )}
        </div>

        {/* AUTHOR */}

        <div className="issuebook-group">
          <label htmlFor="bookAuthor">Author:</label>

          <input
            type="text"
            id="bookAuthor"
            name="Author"
            value={formData.Author}
            onChange={handleChange}
            placeholder="Enter author name"
          />

          {errors.Author && (
            <span className="issuebook-error">{errors.Author}</span>
          )}
        </div>

        {/* GENRE */}

        <div className="issuebook-group">
          <label htmlFor="bookGenre">Genre:</label>

          <input
            type="text"
            id="bookGenre"
            name="Genre"
            value={formData.Genre}
            onChange={handleChange}
            placeholder="Enter book genre"
          />

          {errors.Genre && (
            <span className="issuebook-error">{errors.Genre}</span>
          )}
        </div>

        {/* ISBN */}

        <div className="issuebook-group">
          <label htmlFor="bookISBN">ISBN:</label>

          <input
            type="text"
            id="bookISBN"
            name="ISBN"
            value={formData.ISBN}
            onChange={handleChange}
            placeholder="Enter ISBN (optional)"
          />
          {errors.ISBN && <span className="login-error">{errors.ISBN}</span>}
        </div>
        <div className="issuebook-group">
          <label htmlFor="bookdesc">Description:</label>

          <input
            type="text"
            id="bookdesc"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            placeholder="Enter Desception"
          />

          {errors.Description && (
            <span className="issuebook-error">{errors.Description}</span>
          )}
        </div>
        {/* STOCK */}

        <div className="issuebook-group">
          <label htmlFor="bookStock">Stock:</label>

          <input
            type="number"
            id="bookStock"
            name="Stock"
            min="1"
            max="120"
            value={formData.Stock}
            onChange={handleChange}
            placeholder="Enter stock"
          />

          {errors.Stock && (
            <span className="issuebook-error">{errors.Stock}</span>
          )}
        </div>

        {/* BOOK COVER */}

        <div className="issuebook-group">
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

          <span id="bookFileName" className={errors.cover ? "file-error" : ""}>
            {fileName}
          </span>

          {errors.cover && (
            <span className="issuebook-error">{errors.cover}</span>
          )}

          {/* PREVIEW */}

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

        {/* SERVER ERROR */}

        {errors.server && (
          <span className="issuebook-error">{errors.server}</span>
        )}

        {/* SUBMIT */}

        <div className="Submit-button">
          <button type="submit" id="Submit" disabled={loading}>
            {loading ? "Adding..." : "Submit"}
          </button>
        </div>
      </form>

      {/* SUCCESS POPUP */}

      {showPopup && (
        <div
          id="issueBookSuccessPopup"
          className="issuebook-success-popup"
          style={{ display: "block" }}
        >
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
