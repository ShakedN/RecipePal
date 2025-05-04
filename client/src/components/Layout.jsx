
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "./Layout.css"; // Add CSS for the navbar
import "../pages/FeedPage.css"; // Reuse navbar styles
export default function Layout(){
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery); // Replace with actual search logic
  
  };
  return (
    <>
      <nav className="navbar">
        <img src="/images/RecipePal_logo_white_no logo.png" alt="RecipePal Logo" className="navbar-logo" />
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        <ul className="navbar-links">
          <li><a href="/feed">Feed</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/">Logout</a></li>
        </ul>
      </nav>
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
}