import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Clock, Heart } from 'lucide-react';
import './SearchResults.css';

export default function SearchResults({ results, isVisible, onClose, onUserSelect, searchType }) {
  const navigate = useNavigate();

  const handleResultClick = (item) => {
    if (item.type === 'user') {
      navigate(`/profile/${item._id}`);
    } else if (item.type === 'post') {
      // Navigate to a post detail page or show post modal
      navigate(`/post/${item._id}`);
    }
    onUserSelect(item);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDietaryPreferenceBadges = (preferences) => {
    if (!preferences || preferences.length === 0) return null;
    
    return preferences.map((pref, index) => (
      <span
        key={index}
        className="dietary-preference-badge"
      >
        {pref}
      </span>
    ));
  };

  if (!isVisible || results.length === 0) {
    return null;
  }

  return (
    <div className="search-results-dropdown">
      <div className="search-results-header">
        <span className="search-results-count">
          {results.length} {searchType || 'result'}(s) found
        </span>
        <button onClick={onClose} className="close-results-btn">×</button>
      </div>
      
      {results.map((item) => (
        <div
          key={`${item.type}-${item._id}`}
          className={`search-result-item ${item.type === 'user' ? 'user-result' : 'post-result'}`}
          onClick={() => handleResultClick(item)}
        >
          {item.type === 'user' ? (
            <>
              <div className="search-result-avatar-container">
                <img
                  src={item.profile_image || "/images/default-profile.png"}
                  alt={item.username}
                  className="search-result-avatar"
                />
                <User size={12} className="result-type-icon user-icon" />
              </div>
              <div className="search-result-info">
                <div className="search-result-name">
                  {item.firstName} {item.lastName}
                </div>
                <div className="search-result-username">@{item.username}</div>
                <div className="search-result-meta">
                  <span className="search-result-role">{item.cookingRole}</span>
                  {item.group && (
                    <span className="search-result-group">
                      Group: {item.group}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="search-result-avatar-container">
                <img
                  src={item.image || item.user?.profile_image || "/images/default-profile.png"}
                  alt={item.title}
                  className="search-result-avatar post-image"
                />
                <FileText size={12} className="result-type-icon post-icon" />
              </div>
              <div className="search-result-info">
                <div className="search-result-name post-title">
                  {item.title}
                </div>
                <div className="search-result-username">
                  by @{item.user?.username || item.userName}
                </div>
                <div className="search-result-meta">
                  <span className="search-result-post-type">
                    {item.kindOfPost}
                  </span>
                  {item.typeRecipe && (
                    <span className="search-result-recipe-type">
                      {item.typeRecipe}
                    </span>
                  )}
                  {item.createdAt && (
                    <span className="search-result-date">
                      <Clock size={12} />
                      {formatDate(item.createdAt)}
                    </span>
                  )}
                  {item.likes && item.likes.length > 0 && (
                    <span className="search-result-likes">
                      <Heart size={12} />
                      {item.likes.length}
                    </span>
                  )}
                </div>
                {item.dietaryPreferences && item.dietaryPreferences.length > 0 && (
                  <div className="dietary-preferences">
                    {getDietaryPreferenceBadges(item.dietaryPreferences)}
                  </div>
                )}
                {item.content && (
                  <div className="search-result-snippet">
                    {item.content.substring(0, 100)}...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}