import React, { useState } from "react";
import axios from "axios";
import "./RegisterPage.css";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate(); //Hook to programmatically navigate

  //Initial form state
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    about: "",
    cookingRole: "",
    password: "",
    phone_number: "",
    birthDate: "",
  });

  const [error, setError] = useState(""); //Error message state
  const [success, setSuccess] = useState(""); //Success message state

  //Handle changes to input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value }); //Update only the changed field
  };

  //Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); //Prevent default page reload
    setError(""); //Clear previous error
    setSuccess(""); //Clear previous success

    try {
      console.log("Submitting form:", form);

      //Send POST request to backend registration route
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      //If successful show success message
      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );
      console.log("Verification email sent to:", form.email);
    } catch (err) {
      //If there is error show error message
      console.error("Error in registration:", err.response?.data);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>

      {/*Registration Form*/}
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
          name="firstName"
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={form.lastName}
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
          name="about"
          type="text"
          placeholder="About (optional)"
          value={form.about}
          onChange={handleChange}
        />
        <select
          name="cookingRole"
          value={form.cookingRole}
          onChange={handleChange}
          required
        >
          {/*Cooking Role Selection*/}
          <option value="">Select Cooking Role</option>
          <option value="Professional Chef">Professional Chef</option>
          <option value="Home Cook">Home Cook</option>
          <option value="Beginner">Beginner</option>
          <option value="Food lover">Food lover</option>
        </select>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
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
          name="birthDate"
          type="date"
          placeholder="Birth Date"
          value={form.birthDate}
          onChange={handleChange}
          required
        />

        {/*Submit button*/}
        <button type="submit">Sign Up</button>

        {error && <p className="error">{error}</p>}

        {success && (
          <div className="success-message">
            <p className="success">{success}</p>
            <button onClick={() => navigate("/")}>Back to Login</button>
          </div>
        )}
      </form>
    </div>
  );
}
