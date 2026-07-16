import React from "react";
import "./Css/Member.css";

function Member() {
  return (
    <form id="RegistrationForm">
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

      <span className="error" id="loginError">
        Username or password is not correct
      </span>

      <div className="Submit-button">
        <button type="submit" id="Submit">
          Submit
        </button>
      </div>

      <div className="registration">
        <a href="#register">Not registered? Click Here</a>
      </div>
    </form>
  );
}
export default Member;
