import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "./Layout.css";
import "../pages/FeedPage.css";

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState("");

  // Get the user's profile image from localStorage or use default
  const profileImage =
    localStorage.getItem("profile_image") || "/images/default-profile.png";

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      <nav className="navbar">
        <img
          src="/images/RecipePal_logo_white_no logo.png"
          alt="RecipePal Logo"
          className="navbar-logo"
        />
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        <ul className="navbar-links">
          <li>
            <a href="/profile">
              <img
                src={profileImage}
                alt="Profile"
                className="avatar"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "8px",
                  border: "2px solid #fff",
                  verticalAlign: "middle",
                }}
              />
              
            </a>
          </li>
          <li>
            <a href="/feed">
              <i className="lni lni-home" style={{ fontSize: "2em" }}></i>
            </a>
          </li>
          <li>
            <a href="/">
              <i className="lni lni-exit" style={{ fontSize: "2em" }}></i>
            </a>
          </li>
        </ul>
      </nav>
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
}