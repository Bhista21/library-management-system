import React, { Component } from "react";
import Nav from "./nav";
import Books from "./Books";
import Member from "./Member";
import Home from "./Home";
import Issuebook from "./Issue-book";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./Css/App.css";

function App() {
  let component;
  console.log(window.location.pathname);
  switch (window.location.pathname) {
    case "/Home":
      component = <Home />;
      break;
    case "/Books":
      component = <Books />;
      break;

    case "/Member":
      component = <Member />;
      break;
    case "/Issuebooks":
      component = <Issuebook />;
      break;
    default:
      component = <Home />;
      break;
  }
  return (
    <>
      <Nav />
      <div className="container">{component}</div>
    </>
  );
}

export default App;
