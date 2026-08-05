import React from "react";
import "./Css/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>Library Management System</h2>
          <p>
            Manage books, members, and library activities easily and
            efficiently.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/books">Books</a>
          <a href="/issuebook">Issue Books</a>
          <a href="/Member">Member</a>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: library@gmail.com</p>
          <p>Phone: +977 981234567</p>
          <p>Kathmandu, Nepal</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Library Management System. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
