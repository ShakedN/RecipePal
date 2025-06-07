import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchResults from "./SearchResults";
import "./Layout.css";
import "../pages/FeedPage.css";

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Get the user's profile image from localStorage or use default
  const profileImage =
    localStorage.getItem("profile_image") || "/images/default-profile.png";

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search users with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to first result if Enter is pressed
      navigate(`/profile/${searchResults[0]._id}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  const handleUserSelect = (user) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const closeSearch = () => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      <nav className="navbar">
        <img
          src="/images/RecipePal_logo_white_no logo.png"
          alt="RecipePal Logo"
          className="navbar-logo"
        />
        <div className="navbar-search-container" ref={searchRef}>
          <form className="navbar-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isSearching}>
              {isSearching ? "..." : "Search"}
            </button>
          </form>
          <SearchResults 
            results={searchResults}
            isVisible={showResults}
            onClose={closeSearch}
            onUserSelect={handleUserSelect}
          />
        </div>
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