import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Nav from "./nav";
import Books from "./Books";
import Member from "./Member";
import Home from "./Home";
import Issuebook from "./Issue-book";
import Register from "./Register";
import Bookdeatils from "./Bookdetail";
import "./Css/App.css";

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />

        <Route path="/Home" element={<Home />} />
        <Route path="/Books" element={<Books />} />
        <Route path="/Member" element={<Member />} />
        <Route path="/Issuebooks" element={<Issuebook />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Book-detail" element={<Bookdeatils />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
