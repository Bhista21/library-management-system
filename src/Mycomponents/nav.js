import React from "react";
import "./Css/nav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons";
import Member from "./Member";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function Nav() {
  return (
    <nav className="navbar">
      <h2>
        <FontAwesomeIcon icon={faBookOpenReader} /> Library Management System
      </h2>

      <ul>
        <li>
          <a href="/Home">Home</a>
        </li>
        <li>
          <a href="/Books">Books</a>
        </li>
        <li>
          <a href="/Member">Member</a>
        </li>
        <li>
          <a href="/Issuebooks">Issue Books</a>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
