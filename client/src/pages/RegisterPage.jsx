import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css"; // Add a CSS file for styling

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    profile_image: null, // Add profile_image field
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_image") {
      setForm({ ...form, profile_image: files[0] }); // Handle file input
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      localStorage.setItem("token", res.data.token);
      navigate("/feed");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone_number"
          type="tel"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
        // Add file input for profile image
          name="profile_image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}