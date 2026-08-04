import React from "react";
import "./Css/Bookdetail.css";
import Harry from "../Pics/harry.jpg";

function BookDetails() {
  return (
    <div className="bookdetail">
      <div className="cover-pic">
        <img src={Harry} alt="Harry Potter Cover" />
      </div>

      <div className="info">
        <h1>Harry Potter and the Philosopher's Stone</h1>

        <div className="book-meta">
          <h3>Author:</h3>
          <p>J. K. Rowling</p>
        </div>

        <div className="book-meta">
          <h3>Genre:</h3>
          <p>Fantasy, Adventure</p>
        </div>

        <div className="book-meta">
          <h3>Description:</h3>
          <p>
            Harry Potter discovers that he is a wizard and begins his magical
            journey at Hogwarts School of Witchcraft and Wizardry. Along the way
            he makes lifelong friends and uncovers the mystery surrounding the
            Philosopher's Stone.
          </p>
        </div>
        <div className="book-meta">
          <h3>Stock</h3>
          <h4>5</h4>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
