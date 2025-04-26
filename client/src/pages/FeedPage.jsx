
import React from "react";
import "./FeedPage.css"; // Add a CSS file for styling

export default function FeedPage() {
  return (
    <div>
      <nav className="navbar">
      <img src="/images/RecipePal_logo_white_no logo.png" alt="RecipePal Logo" className="navbar-logo" />
        <ul className="navbar-links">
          <li><a href="/feed">Home</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
      <div className="feed-content">
        <h1>Your Feed</h1>
        <p>Here you will see posts from your friends and groups.</p>
      </div>
    </div>
  );
}