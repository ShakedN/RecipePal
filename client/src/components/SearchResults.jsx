import React from "react";
import { useNavigate } from "react-router-dom";
import "./SearchResults.css";

export default function SearchResults({ results, isVisible, onClose, onUserSelect }) {
  const navigate = useNavigate();

  const handleUserClick = (user) => {
    navigate(`/profile/${user._id}`);
    onUserSelect(user);
    onClose();
  };

  if (!isVisible || results.length === 0) {
    return null;
  }

  return (
    <div className="search-results-dropdown">
      {results.map((user) => (
        <div 
          key={user._id} 
          className="search-result-item"
          onClick={() => handleUserClick(user)}
        >
          <img 
            src={user.profile_image || "/images/default-profile.png"} 
            alt={user.username}
            className="search-result-avatar"
          />
          <div className="search-result-info">
            <div className="search-result-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="search-result-username">@{user.username}</div>
            <div className="search-result-role">{user.cookingRole}</div>
          </div>
        </div>
      ))}
    </div>
  );
}