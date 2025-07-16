import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const { token } = useParams(); //Extract the verification token from URL parameters
  const [message, setMessage] = useState(""); //State to store success or error message

  useEffect(() => {
    //Function to send verification request to the server
    const verifyEmail = async () => {
      try {
        //Send GET request to backend to verify email with token
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`
        );
        setMessage(res.data.message);
      } catch (err) {
        setMessage(err.response?.data?.message || "Email verification failed.");
      }
    };

    verifyEmail();
  }, [token]); //Run again if token changes

  return (
    <div className="verify-email-page">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}
