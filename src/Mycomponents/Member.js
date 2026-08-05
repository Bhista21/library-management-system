import React, { useState } from "react";
import "./Css/Member.css";
import { Link } from "react-router-dom";
function Member() {
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [formData, setFormData] = useState({
    Username: "",
    role: "",
    password: "",
  });
  const validateForm = () => {
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.login = "Please enter username or password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newUser = {
      Username: formData.Username.trim(),
      password: formData.password,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (data.success) {
        setPopupMessage(
          data.message ||
            `Welcome ${formData.Username}! You are now registered as ${formData.role}.`,
        );
        setShowPopup(true);

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      alert("Could not reach the server. Is it running?");
      console.error(err);
    }
  };
  return (
    <div className="member-container">
      <div className="member">
        <form id="RegistrationForm" onSubmit={handleSubmit}>
          <div className="radio-group">
            <label>Role:</label>
            <input type="radio" id="roleAdmin" name="role" />
            <label htmlFor="roleAdmin">Admin</label>
            <input type="radio" id="roleMember" name="role" />
            <label htmlFor="roleMember">Member</label>
          </div>

          <div className="username">
            <label htmlFor="Username">Username</label>
            <input type="text" id="Username" placeholder="Username" />
          </div>

          <div className="password">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Password" />
          </div>
          {errors.login && <span className="login-error">{errors.login}</span>}

          <div className="Submit-button">
            <button type="submit" id="Submit">
              Submit
            </button>
          </div>

          <div className="registration">
            <Link to="/Register">Not registered? Click Here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Member;
