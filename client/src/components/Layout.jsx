import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Users, MessageCircle,Search,LogOutIcon,Bell,HomeIcon } from "lucide-react"; // Add MessageCircle icon
import axios from "axios";
import SearchResults from "./SearchResults";
import AdvancedSearch from "./AdvancedSearch";
import ChatWindow from "./ChatWindow";
import FriendsList from "./FriendsList";
import "./Layout.css";
import "../pages/FeedPage.css";

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false); // New state for friends list
  const [friends, setFriends] = useState([]); // State for friends
  const [openChats, setOpenChats] = useState([]); // State for open chat windows
  const [groupRequests, setGroupRequests] = useState([]);
  const searchRef = useRef(null);
  const friendRequestsRef = useRef(null);
  const friendsListRef = useRef(null); // New ref for friends list
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("direct");
  //Get the user's profile image from localStorage or use default
  const profileImage =
    localStorage.getItem("profile_image") || "/images/default-profile.png";

  const currentUserId = localStorage.getItem("userId");
const handleQuickSearch = async () => {
  if (searchQuery.trim().length < 2) return;

  setIsSearching(true);
  try {
    const res = await axios.get(
      `http://localhost:5000/api/search/quick?query=${encodeURIComponent(
        searchQuery
      )}`
    );
    setSearchResults(res.data.results);
    setShowResults(true);
  } catch (err) {
    console.error("Search failed:", err);
    setSearchResults([]);
    setShowResults(false);
  } finally {
    setIsSearching(false);
  }
};

  const handleAdvancedSearch = async (searchData) => {
    setIsSearching(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/search/advanced',
        searchData
      );
      setSearchResults(res.data.results);
      setShowResults(true);
      setShowAdvancedSearch(false);
    } catch (err) {
      console.error("Advanced search failed:", err);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  //Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (
        friendRequestsRef.current &&
        !friendRequestsRef.current.contains(event.target)
      ) {
        setShowFriendRequests(false);
      }
      if (friendsListRef.current && !friendsListRef.current.contains(event.target)) {
        setShowFriendsList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //Fetch friend requests on component mount
  useEffect(() => {
    if (currentUserId) {
      fetchFriendRequests();
      fetchFriends();
    }
  }, [currentUserId]);

  //Search users with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); //300ms debounce

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

const fetchFriendRequests = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/auth/requests/${currentUserId}`
    );
    setFriendRequests(res.data.friendRequests);
    setGroupRequests(res.data.groupRequests); // Add this line to set group requests
  } catch (err) {
    console.error("Failed to fetch friend requests:", err);
  }
};

  // New function to fetch friends
  const fetchFriends = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/profile/${currentUserId}`);
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      const res = await axios.get(
      `http://localhost:5000/api/posts/search?query=${encodeURIComponent(
          searchQuery
        )}`
      );
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
      //Navigate to first result if Enter is pressed
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
    setShowFriendsList(false); // Close friends list when opening friend requests
  };

  // New function to handle chat icon click
  const handleChatClick = () => {
    setShowFriendsList(!showFriendsList);
    setShowFriendRequests(false); // Close friend requests when opening friends list
  };

  // New function to handle friend selection for chat
  const handleFriendSelect = (friend) => {
    // Check if chat with this friend is already open
    const existingChat = openChats.find(chat => chat.otherUser._id === friend._id);
    
    if (!existingChat) {
      // Add new chat window
      setOpenChats(prev => [...prev, {
        id: Date.now(),
        otherUser: friend
      }]);
    }
    
    setShowFriendsList(false);
  };

  // Function to close a chat window
  const closeChatWindow = (chatId) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/accept-friend", {
        userId: currentUserId,
        requesterId,
      });
      //Refresh friend requests after accepting
      fetchFriendRequests();
      fetchFriends();
    } catch (err) {
      alert(
        "Failed to accept friend request: " +
          (err.response?.data?.message || err.message)
      );
    }
  };
  const handleRejectRequest = async (requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reject-friend", {
        userId: currentUserId,
        requesterId,
      });
      //Refresh friend requests after rejecting
      fetchFriendRequests();
    } catch (err) {
      alert(
        "Failed to reject friend request: " +
          (err.response?.data?.message || err.message)
      );
    }
  };
    const handleAcceptGroupRequest = async (groupId, userId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/accept-request`, {
        userId,
      });
      fetchFriendRequests(); // Refresh requests
    } catch (err) {
      alert("Failed to accept group join request: " + (err.response?.data?.message || err.message));
    }
  };
  
  const handleRejectGroupRequest = async (groupId, userId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/reject-request`, {
        userId,
      });
      fetchFriendRequests(); // Refresh requests
    } catch (err) {
      alert("Failed to reject group join request: " + (err.response?.data?.message || err.message));
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
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
              className="search-input"
            />
            <button
              type="button"
              className="search-button"
              onClick={handleQuickSearch}
              disabled={isSearching}
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              className="advanced-search-button"
              onClick={() => setShowAdvancedSearch(true)}
            >
              Advanced
            </button>
          </div>
          <SearchResults
            results={searchResults}
            isVisible={showResults}
            onClose={() => setShowResults(false)}
            onUserSelect={() => setShowResults(false)}
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
              <HomeIcon size={28} />
            </a>
          </li>
          
          {/* Chat Icon */}
          <li className="chat-container" ref={friendsListRef}>
            <button 
              className="chat-btn"
              onClick={handleChatClick}
              aria-label="Chat with Friends"
            >
              <MessageCircle size={28} />
            </button>
            
            {/* Friends List Dropdown */}
            {showFriendsList && (
              <div className="friends-list-dropdown">
                <h4>Chat with Friends</h4>
                {friends.length === 0 ? (
                  <p className="no-friends">No friends to chat with</p>
                ) : (
                  <div className="friends-chat-list">
                    {friends.map((friend) => (
                      <div 
                        key={friend._id} 
                        className="friend-chat-item"
                        onClick={() => handleFriendSelect(friend)}
                      >
                        <img
                          src={friend.profile_image || "/images/default-profile.png"}
                          alt={friend.username}
                          className="friend-chat-avatar"
                        />
                        <div className="friend-chat-info">
                          <div className="friend-chat-name">
                            {friend.firstName} {friend.lastName}
                          </div>
                          <div className="friend-chat-username">@{friend.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>

          {/* Friend Requests Icon */}
          <li className="friend-requests-container" ref={friendRequestsRef}>
            <button
              className="friend-requests-btn"
              onClick={handleFriendRequestClick}
              aria-label="Friend Requests"
            >
              <Bell size={28} />
              {(friendRequests.length + groupRequests.reduce((total, group) => total + group.pendingRequests.length, 0)) > 0 && (
                <span className="friend-requests-badge">
                  {friendRequests.length + groupRequests.reduce((total, group) => total + group.pendingRequests.length, 0)}
                </span>
              )}
            </button>
     
            {/* Friend Requests Dropdown */}
         {showFriendRequests && (
  <div className="friend-requests-dropdown">
<h4 data-count={friendRequests.length + groupRequests.reduce((total, group) => total + group.pendingRequests.length, 0)}>
  Friend Requests
</h4>    
    {/* Add tabs */}
    <div className="friend-requests-tabs">  <button
    className={`friend-requests-tab ${activeTab === "direct" ? "active" : ""}`}
    onClick={() => setActiveTab("direct")}
  >
    Direct
  </button>
  <button
    className={`friend-requests-tab ${activeTab === "groups" ? "active" : ""}`}
    onClick={() => setActiveTab("groups")}
  >
    From Groups
  </button>
</div>
    
   {activeTab === "direct" && (
  friendRequests.length === 0 ? (
    <p className="no-requests">No pending requests</p>
  ) : (
    <div className="requests-list">
      {friendRequests.map((request) => (
        <div key={request.from._id} className="request-item">
          <img
            src={
              request.from.profile_image || "/images/default-profile.png"
            }
            alt={request.from.username}
            className="request-avatar"
          />
          <div className="request-info">
            <div className="request-name">
              {request.from.firstName} {request.from.lastName}
            </div>
            <div className="request-username">@{request.from.username}</div>
            <div className="request-message">Wants to be your friend</div>
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
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
)}

{activeTab === "groups" && (
  groupRequests.length === 0 ? (
    <p className="no-requests">No group join requests</p>
  ) : (
    <div className="requests-list">
      {groupRequests.map((group) => (
        <div key={group._id} className="request-item">
          <div className="request-info">
            <div className="request-name">
              {group.name}
            </div>
            {group.pendingRequests.map((user) => (
              <div key={user._id} className="group-request">
                <img
                  src={user.profile_image || "/images/default-profile.png"}
                  alt={user.username}
                  className="request-avatar"
                />
                <div className="request-info">
                  <div className="request-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="request-username">@{user.username}</div>
                  <div className="request-message">Wants to join your group</div>
                </div>
                <div className="request-actions">
                  <button
                    className="accept-btn"
                    onClick={() => handleAcceptGroupRequest(group._id, user._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleRejectGroupRequest(group._id, user._id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
)}
  </div>
)}
            
          </li>
          <li>
            <a href="/">
              <LogOutIcon  size={28} />
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="page-content">
        <Outlet />
      </div>
      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {/* Render open chat windows */}
      {openChats.map((chat) => (
        <ChatWindow
          key={chat.id}
          otherUser={chat.otherUser}
          currentUserId={currentUserId}
          onClose={() => closeChatWindow(chat.id)}
          style={{
            right: `${20 + (openChats.indexOf(chat) * 370)}px` // Offset multiple chat windows
          }}
        />
      ))}
    </>
  );
}