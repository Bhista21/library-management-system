import React from "react";
import "./Css/nav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Nav() {
  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.role;

  console.log("NAV ROLE:", role);

  const dashboardPath =
    role?.toLowerCase() === "admin" ? "/admin/dashboard" : "/Dashboard";
  return (
    <nav className="navbar">
      <h2>
        <FontAwesomeIcon icon={faBookOpenReader} /> Library Management System
      </h2>

      <ul>
        <li>
          <Link to="/Home">Home</Link>
        </li>
        <li>
          <Link to="/Books">Books</Link>
        </li>
        <li>
          <Link to="/Member">Member</Link>
        </li>
        <li>
          <Link to="/Issuebooks">Issue Books</Link>
        </li>
        <li>
          <Link to={dashboardPath}>Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
