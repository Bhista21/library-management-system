import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ManageMember from "./ManageMember";
import Footer from "./footer";
import Nav from "./nav";
import Books from "./Books";
import Member from "./Member";
import Home from "./Home";
import Issuebook from "./Issue-book";
import Register from "./Register";
import Bookdeatils from "./Bookdetail";
import AdminDashboard from "./Admindashboard";
import UserDashboard from "./Userdashboard";
import ReturnBooks from "./ReturnBooks";
import "./Css/App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Nav />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/Home" replace />} />

            <Route path="/Home" element={<Home />} />
            <Route path="/Books" element={<Books />} />
            <Route path="/Member" element={<Member />} />
            <Route path="/Issuebooks" element={<Issuebook />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Book/:id" element={<Bookdeatils />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/ManageMember" element={<ManageMember />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/ReturnBooks" element={<ReturnBooks />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
