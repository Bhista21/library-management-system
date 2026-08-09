import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Register.css";

function Register() {
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Male",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    terms: false,
  });

  // Profile Picture State
  const [fileName, setFileName] = useState("No files selected.");
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();
  // Errors & Popup State
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fileInputRef = useRef(null);

  // Handle Input Changes
  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const key = name || id;

    setFormData((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? checked : value,
    }));

    // Clear field-specific error as user types
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  // Profile Picture File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset Form
  const handleReset = (e) => {
    if (e) e.preventDefault();
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      gender: "Male",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      terms: false,
    });
    setFileName("No files selected.");
    setPreviewUrl("");
    setErrors({});
    setShowPopup(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Email Validation Regex
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Integrated Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = "Please enter a valid age (1-120)";
    }

    if (!formData.email.trim() || !isValidEmail(formData.email.trim())) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
    }

    if (!formData.terms) {
      newErrors.terms = "You must accept the terms and policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newUser = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
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
            `Welcome ${formData.firstName}! You are now registered as ${formData.role}.`,
        );
        setShowPopup(true);

        setTimeout(() => {
          navigate("/Member");
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
    <div className="register-container">
      <form
        className="register-form"
        id="RegistrationForm"
        onSubmit={handleSubmit}
      >
        <h1 className="register-title">User Registration</h1>

        <h2 className="register-subtitle">Personal Details</h2>

        <div className="register-group">
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <span className="register-error">{errors.firstName}</span>
            )}
          </div>

          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <span className="register-error">{errors.lastName}</span>
            )}
          </div>

          <div>
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              min="1"
              max="120"
              value={formData.age}
              onChange={handleChange}
            />
            {errors.age && <span className="register-error">{errors.age}</span>}
          </div>

          <div>
            <label htmlFor="gender">Gender:</label>
            <select id="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Profile Picture:</label>
            <button
              type="button"
              id="browseBtn"
              onClick={() => fileInputRef.current.click()}
            >
              Browse...
            </button>

            <input
              type="file"
              id="profilepic"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <span id="FileName">{fileName}</span>

            <div id="imagePreview" style={{ marginTop: "10px" }}>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  width="120"
                  style={{ borderRadius: "8px", border: "2px solid #666" }}
                />
              )}
            </div>
          </div>

          <h2 className="register-subtitle">Account Details</h2>

          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="register-error">{errors.email}</span>
            )}
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="register-error">{errors.password}</span>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="register-error">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="register-radio-group">
            <label>Role:</label>

            <input
              type="radio"
              id="roleAdmin"
              name="role"
              value="Admin"
              checked={formData.role === "Admin"}
              onChange={handleChange}
            />
            <label htmlFor="roleAdmin">Admin</label>

            <input
              type="radio"
              id="roleUser"
              name="role"
              value="User"
              checked={formData.role === "User"}
              onChange={handleChange}
            />
            <label htmlFor="roleUser">User</label>
          </div>
          {errors.role && <span className="register-error">{errors.role}</span>}

          <div className="register-checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <label htmlFor="terms">I accept all the terms and policy.</label>
          </div>
          {errors.terms && (
            <span className="register-error">{errors.terms}</span>
          )}

          <div className="register-button-group">
            <button type="submit">Register</button>

            <button type="button" id="resetBtn" onClick={handleReset}>
              Reset
            </button>
          </div>

          <div
            id="successpopup"
            className="register-success-popup"
            style={{ display: showPopup ? "block" : "none" }}
          >
            <h3>Registration Successful</h3>
            <p id="popupMessage">{popupMessage}</p>

            <button type="button" onClick={() => setShowPopup(false)}>
              OK
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Register;
