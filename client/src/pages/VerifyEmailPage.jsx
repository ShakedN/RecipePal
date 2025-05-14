import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
        setMessage(res.data.message);
      } catch (err) {
        setMessage(err.response?.data?.message || "Email verification failed.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="verify-email-page">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}