import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import axios from "axios";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate(); //Hook for navigation

  //Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); //Prevent default form behavior (page reload)
    try {
      //Send login request to backend
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: form.username,
        password: form.password,
      });

      //Store token and user info in local storage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("userId", res.data.user._id);

      //Navigate to the feed page on successful login
      navigate("/feed");
    } catch (err) {
      //Show alert if login fails
      alert(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="/images/logo_recipePal_no_text.png"
          alt="RecipePal Logo"
          className="big-logo"
        />
        <h1>RecipePal</h1>
        <p className="slogan">Cook it. Love it. Share it.</p>

        {/*Login form*/}
        <div className="login-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {/*Submit button*/}
            <button type="submit">Login</button>
            <p className="register-link">
              Don’t have an account? <a href="/register">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
