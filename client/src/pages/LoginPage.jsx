import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // נשייך CSS ייעודי

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem("username", form.username);
    navigate("/feed");
  };

  return (
  <div className="login-container">
    <div className="login-left">
      <img src="/images/logo_recipePal_no_text.png" alt="RecipePal Logo" className="big-logo" />
      <h1>RecipePal</h1>
      <p className="slogan">Cook it. Love it. Share it.</p>
      
     
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
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
