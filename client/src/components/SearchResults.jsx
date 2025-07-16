import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Clock, Heart, Users } from 'lucide-react';
import axios from 'axios';
import JoinGroupPopup from './JoinGroupPopup';
import './SearchResults.css';

export default function SearchResults({ results, isVisible, onClose, onUserSelect, searchType }) {
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState([]);
  const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const currentUserId = localStorage.getItem('userId');

  const fetchUserGroups = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/user/${currentUserId}`);
      setUserGroups(response.data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setUserGroups([]);
    }
  }, [currentUserId]);

  // Fetch user's groups when component mounts
  useEffect(() => {
    if (currentUserId) {
      fetchUserGroups();
    }
  }, [currentUserId, fetchUserGroups]);

  const isUserMemberOfGroup = (groupId) => {
    if (!currentUserId) return false;
    return userGroups.some(group => group._id === groupId);
  };

const handleResultClick = (item) => {
  if (item.type === 'user') {
    navigate(`/profile/${item._id}`);
  } else if (item.type === 'post') {
    navigate(`/post/${item._id}`);
  } else if (item.type === 'group') {
    // Check if user is logged in
    if (!currentUserId) {
      alert('Please log in to view groups');
      return;
    }
    
    // Check if user is a member of the group
    if (isUserMemberOfGroup(item._id)) {
      // User is a member, navigate to group page
      navigate(`/groups/${item._id}`);
    } else {
      // User is not a member, show join popup
      setSelectedGroup(item);
      setShowJoinGroupPopup(true);
      return; // Don't close search results yet
    }
  }
  onUserSelect(item);
  onClose();
};

  const handleJoinGroup = async () => {
    if (!selectedGroup) return;

    try {
      await axios.post(`http://localhost:5000/api/groups/${selectedGroup._id}/request-join`, {
        userId: currentUserId,
      });
      alert('Join request sent successfully!');
      setShowJoinGroupPopup(false);
      setSelectedGroup(null);
      onClose();
    } catch (error) {
      console.error('Error sending join request:', error);
      alert(error.response?.data?.message || 'Failed to send join request. Please try again.');
    }
  };

  const handleCancelJoinRequest = () => {
    setShowJoinGroupPopup(false);
    setSelectedGroup(null);
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
            className={`search-result-item ${item.type === 'user' ? 'user-result' : item.type === 'post' ? 'post-result' : 'group-result'}`}
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
          ) : item.type === 'group' ? (
            <>
              <div className="search-result-avatar-container">
                <div className="search-result-avatar group-avatar">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <Users size={12} className="result-type-icon group-icon" />
              </div>
              <div className="search-result-info">
                <div className="search-result-name group-name">
                  {item.name}
                </div>
                <div className="search-result-description">
                  {item.description}
                </div>
                <div className="search-result-meta">
                  <span className="search-result-members">
                    {item.members?.length || 0} members
                  </span>
                  <span className="search-result-admin">
                    Admin: @{item.admin?.username}
                  </span>
                  {currentUserId && isUserMemberOfGroup(item._id) && (
                    <span className="search-result-membership-status member">
                      Member
                    </span>
                  )}
                  {currentUserId && !isUserMemberOfGroup(item._id) && (
                    <span className="search-result-membership-status non-member">
                      Click to join
                    </span>
                  )}
                  {!currentUserId && (
                    <span className="search-result-membership-status non-member">
                      Login to join
                    </span>
                  )}
                  {item.createdAt && (
                    <span className="search-result-date">
                      <Clock size={12} />
                      {formatDate(item.createdAt)}
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
      
      {/* Join Group Popup */}
      {showJoinGroupPopup && selectedGroup && (
        <JoinGroupPopup
          group={selectedGroup}
          onJoin={handleJoinGroup}
          onCancel={handleCancelJoinRequest}
        />
      )}
    </div>
  );
}