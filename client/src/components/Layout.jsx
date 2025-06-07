import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Users } from "lucide-react"; // Add Users icon import
import axios from "axios";
import SearchResults from "./SearchResults";
import "./Layout.css";
import "../pages/FeedPage.css";

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const searchRef = useRef(null);
  const friendRequestsRef = useRef(null);
  const navigate = useNavigate();

  // Get the user's profile image from localStorage or use default
  const profileImage =
    localStorage.getItem("profile_image") || "/images/default-profile.png";
  
  const currentUserId = localStorage.getItem("userId");

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (friendRequestsRef.current && !friendRequestsRef.current.contains(event.target)) {
        setShowFriendRequests(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch friend requests on component mount
  useEffect(() => {
    if (currentUserId) {
      fetchFriendRequests();
    }
  }, [currentUserId]);

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

  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/friend-requests/${currentUserId}`);
      setFriendRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch friend requests:", err);
    }
  };

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

  const handleFriendRequestClick = () => {
    setShowFriendRequests(!showFriendRequests);
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/accept-friend", {
        userId: currentUserId,
        requesterId
      });
      // Refresh friend requests after accepting
      fetchFriendRequests();
    } catch (err) {
      alert("Failed to accept friend request: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reject-friend", {
        userId: currentUserId,
        requesterId
      });
      // Refresh friend requests after rejecting
      fetchFriendRequests();
    } catch (err) {
      alert("Failed to reject friend request: " + (err.response?.data?.message || err.message));
    }
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
          {/* Friend Requests Icon */}
          <li className="friend-requests-container" ref={friendRequestsRef}>
            <button 
              className="friend-requests-btn"
              onClick={handleFriendRequestClick}
              aria-label="Friend Requests"
            >
              <Users size={28} />
              {friendRequests.length > 0 && (
                <span className="friend-requests-badge">{friendRequests.length}</span>
              )}
            </button>
            
            {/* Friend Requests Dropdown */}
            {showFriendRequests && (
              <div className="friend-requests-dropdown">
                <h4>Friend Requests</h4>
                {friendRequests.length === 0 ? (
                  <p className="no-requests">No pending requests</p>
                ) : (
                  <div className="requests-list">
                    {friendRequests.map((request) => (
                      <div key={request.from._id} className="request-item">
                        <img
                          src={request.from.profile_image || "/images/default-profile.png"}
                          alt={request.from.username}
                          className="request-avatar"
                        />
                        <div className="request-info">
                          <div className="request-name">
                            {request.from.firstName} {request.from.lastName}
                          </div>
                          <div className="request-username">@{request.from.username}</div>
                        </div>
                        <div className="request-actions">
                          <button
                            className="accept-btn"
                            onClick={() => handleAcceptRequest(request.from._id)}
                          >
                            Accept
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleRejectRequest(request.from._id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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