import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./nav";
import Books from "./Books";
import Member from "./Member";
import Home from "./Home";
import Issuebook from "./Issue-book";
import Register from "./Register";
import "./Css/App.css";

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/Books" element={<Books />} />
        <Route path="/Member" element={<Member />} />
        <Route path="/Issuebooks" element={<Issuebook />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
