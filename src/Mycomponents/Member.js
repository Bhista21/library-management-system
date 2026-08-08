import React, { useState } from "react";
import "./Css/Member.css";
import { Link, useNavigate } from "react-router-dom";

function Member() {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "User",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // LOGIN, NOT SIGNUP
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      console.log("Login response:", data);

      if (!res.ok || !data.success) {
        setErrors({
          login: data.message || "Invalid email or password.",
        });
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(data.user));

      // IMPORTANT:
      // Use the role returned by the BACKEND,
      // not the role selected in the frontend.
      if (data.user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);

      setErrors({
        login: "Could not reach the server. Is the backend running?",
      });
    }
  };

  return (
    <div className="member-container">
      <div className="member">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>

          {/* Role */}

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={formData.role === "Admin"}
                onChange={handleChange}
              />
              Admin
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="User"
                checked={formData.role === "User"}
                onChange={handleChange}
              />
              Member
            </label>
          </div>

          {/* Email */}

          <div className="email">
            <label htmlFor="Email">Email</label>

            <input
              type="text"
              id="Email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && (
              <span className="login-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}

          <div className="password">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            {errors.password && (
              <span className="login-error">{errors.password}</span>
            )}
          </div>

          {/* Login error */}

          {errors.login && <span className="login-error">{errors.login}</span>}

          {/* Submit */}

          <div className="Submit-button">
            <button type="submit" id="Submit">
              Submit
            </button>
          </div>

          {/* Register */}

          <div className="registration">
            <Link to="/Register">Not registered? Click Here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Member;
