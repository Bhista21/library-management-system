import React from "react";
import "./Css/Register.css";

function Register() {
  return (
    <div className="register-container">
      <form className="register-form">
        <h1 className="register-title">User Registration</h1>

        <h2 className="register-subtitle">Personal Details</h2>

        <div className="register-group">
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input type="text" id="firstName" />
            <span className="register-error" id="firstNameError"></span>
          </div>

          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input type="text" id="lastName" />
            <span className="register-error" id="lastNameError"></span>
          </div>

          <div>
            <label htmlFor="age">Age:</label>
            <input type="number" id="age" min="1" max="120" />
            <span className="register-error" id="ageError"></span>
          </div>

          <div>
            <label htmlFor="gender">Gender:</label>
            <select id="gender">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Profile Picture:</label>

            <button type="button" id="browseBtn">
              Browse...
            </button>

            <input
              type="file"
              id="profilepic"
              accept="image/*"
              style={{ display: "none" }}
            />

            <span id="FileName">No files selected.</span>

            <div id="imagePreview" style={{ marginTop: "10px" }}></div>
          </div>

          <h2 className="register-subtitle">Account Details</h2>

          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" />
            <span className="register-error" id="emailError"></span>
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" />
            <span className="register-error" id="PasswordError"></span>
          </div>

          <div className="register-radio-group">
            <label>Role:</label>

            <input type="radio" id="roleAdmin" name="role" />
            <label htmlFor="roleAdmin">Admin</label>

            <input type="radio" id="roleUser" name="role" />
            <label htmlFor="roleUser">User</label>
          </div>

          <div className="register-checkbox-group">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">I accept all the terms and policy.</label>
          </div>

          <div className="register-button-group">
            <button type="submit">Register</button>

            <button type="reset" id="resetBtn">
              Reset
            </button>
          </div>

          <div id="successpopup" className="register-success-popup">
            <h3>Registration Successful</h3>

            <p id="popupMessage"></p>

            <button type="button">OK</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Register;
