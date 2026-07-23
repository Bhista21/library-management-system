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
const form = document.getElementById("RegistrationForm");
const successPopup = document.getElementById("successpopup");
const popupMessage = document.getElementById("popupMessage");

// Profile Picture
const browseBtn = document.getElementById("browseBtn");
const profilePicInput = document.getElementById("profilepic");
const fileNameSpan = document.getElementById("FileName");
const imagePreview = document.getElementById("imagePreview");

browseBtn.addEventListener("click", () => profilePicInput.click());

profilePicInput.addEventListener("change", function () {
  if (this.files[0]) {
    fileNameSpan.textContent = this.files[0].name;

    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" width="120" style="border-radius:8px; border:2px solid #666;">`;
    };

    reader.readAsDataURL(this.files[0]);
  }
});

// Reset Button
document.getElementById("resetBtn").addEventListener("click", function (e) {
  e.preventDefault();

  form.reset();
  fileNameSpan.textContent = "No files selected.";
  imagePreview.innerHTML = "";
  clearAllErrors();
  successPopup.style.display = "none";
});

// Clear Errors
function clearAllErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
}

// Email Validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Form Submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  clearAllErrors();

  let isValid = true;

  // First Name
  const firstName = document.getElementById("firstName").value.trim();

  if (firstName === "") {
    document.getElementById("firstNameError").textContent =
      "First name is required";
    isValid = false;
  }

  // Last Name
  const lastName = document.getElementById("lastName").value.trim();

  if (lastName === "") {
    document.getElementById("lastNameError").textContent =
      "Last name is required";
    isValid = false;
  }

  // Age
  const age = document.getElementById("age").value;

  if (age === "" || age < 1 || age > 120) {
    document.getElementById("ageError").textContent =
      "Please enter a valid age (1-120)";
    isValid = false;
  }

  // Email
  const email = document.getElementById("email").value.trim();

  if (email === "" || !isValidEmail(email)) {
    document.getElementById("emailError").textContent =
      "Please enter a valid email";
    isValid = false;
  }

  // Password
  const password = document.getElementById("password").value;

  if (password.length < 6) {
    document.getElementById("PasswordError").textContent =
      "Password must be at least 6 characters";
    isValid = false;
  }

  // Role
  let role = "";

  if (document.getElementById("roleAdmin").checked) {
    role = "Admin";
  } else if (document.getElementById("roleUser").checked) {
    role = "User";
  } else {
    alert("Please select a role.");
    isValid = false;
  }

  // Terms
  if (!document.getElementById("terms").checked) {
    alert("You must accept the terms and policy.");
    isValid = false;
  }

  if (!isValid) return;

  // Save to Local Storage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const newUser = {
    id: Date.now(),
    firstName: firstName,
    lastName: lastName,
    age: Number(age),
    gender: document.getElementById("gender").value,
    email: email,
    role: role,
    registeredDate: new Date().toLocaleDateString(),
  };

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  // Success Popup
  popupMessage.textContent = `Welcome ${firstName}! You are now registered as ${role}.`;

  successPopup.style.display = "block";
});

// Close Popup
window.closepopup = function () {
  successPopup.style.display = "none";
};

export default Register;
