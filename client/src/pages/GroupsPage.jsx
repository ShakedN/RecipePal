import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Plus,
  Activity,
  UserPlus,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
} from "lucide-react";
import axios from "axios";
import "./GroupsPage.css";
import { useParams } from "react-router-dom";
import NewPostForm from "../components/NewPostForm";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [group, setGroup] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const { groupId } = useParams(); //Get group ID from URL
  const userId = localStorage.getItem("userId"); //Get user ID from local storage
  const userName = localStorage.getItem("username");
  const [currentUser, setCurrentUser] = useState(null); 
   // Fetch current user data including profile image
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("Fetching user profile for userId:", userId);
        console.log("Full URL:", `http://localhost:5000/api/auth/profile/${userId}`);
        
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const response = await axios.get(`http://localhost:5000/api/auth/profile/${userId}`, config);
        console.log("User profile response:", response.data);
        console.log("Profile image URL:", response.data.profile_image);
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      
      }
    };

    if (userId) {
      fetchCurrentUser();
    }
  }, [userId]);
  //Fetch group details and its posts when groupId changes
  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      try {
        const [groupRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/groups/${groupId}`),
          axios.get(`http://localhost:5000/api/groups/${groupId}/posts`),
        ]);
        setGroup(groupRes.data);
        setGroupPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching group data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
    fetchSuggestedGroups(); // Call suggested groups fetch
  }, [groupId]);

  //Not using it --> DELETE?
  const fetchUserGroups = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/groups/user/${userId}`
      );
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

  //Fetch 3 suggested groups for user
  const fetchSuggestedGroups = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await axios.get(
        `http://localhost:5000/api/groups/suggested/${userId}`
      );
      setSuggestedGroups(response.data.groups); // ✅ שליפה נכונה של המערך
    } catch (error) {
      console.error("Error fetching suggested groups:", error);
      setSuggestedGroups([]); // הגנה במקרה של כישלון
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchGroupPosts = async (groupId) => {
    if (!groupId) {
      console.error("Group ID is required to fetch group posts");
      return;
    }

    try {
      const url = `http://localhost:5000/api/groups/${groupId}/posts`;
      const response = await axios.get(url);
      setGroupPosts(response.data);
    } catch (error) {
      console.error("Error fetching group posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/join`, {
        userId,
      });
      fetchUserGroups();
      fetchSuggestedGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const filteredPosts = groupPosts.filter((post) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "myGroups")
      return groups.some((g) => g._id === post.group?._id);
    return true;
  });

  // const handleGroupSelect = (group) => {
  //   // If the same group is already selected, deselect it
  //   if (selectedGroup && selectedGroup._id === group._id) {
  //     setSelectedGroup(null);
  //     fetchGroupPosts(); // Fetch all posts again (without specific group filter)
  //   } else {
  //     // Select the new group
  //     setSelectedGroup(group);
  //     fetchGroupPosts(group._id);
  //   }
  // };

  return (
    <div className="groups-page">
      {/* Right Sidebar - Suggested Groups */}
      <div className="groups-right-sidebar">
        <div className="widget">
          <div className="sidebar-title">
            <UserPlus size={20} />
            Suggested Groups
          </div>
          {loadingSuggestions ? (
            <p>Loading suggestions...</p>
          ) : suggestedGroups.length === 0 ? (
            <p>No suggested groups right now.</p>
          ) : (
            suggestedGroups.map((group) => (
              <div key={group._id} className="suggested-group">
                <div className="group-avatar suggested">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="group-info">
                  <div className="group-name">{group.name}</div>
                  <div className="group-members">
                    {group.members?.length || 0} members
                  </div>
                </div>
                <button
                  className="join-btn"
                  onClick={() => handleJoinGroup(group._id)}
                >
                  Join
                </button>
              </div>
            ))
          )}
        </div>

        <div className="widget">
          <div className="sidebar-title">
            <Activity size={20} />
            Group Activity
          </div>
          {Array.isArray(groups) &&
            groups.slice(0, 3).map((group) => (
              <div key={group._id} className="activity-item">
                <div className="group-avatar activity">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="activity-info">
                  <div className="activity-text">New recipe posted</div>
                  <div className="activity-group">in {group.name}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="groups-main-content">
        {/*Group data*/}
        {group ? (
          <div className="group-data">
            <h2>{group.name}</h2>
            <p>{group.description}</p>
          </div>
        ) : (
          <div className="group-data">
            <p>Loading group...</p>
          </div>
        )}

        {/*New post container*/}
        <div className="new-post-container">
          <NewPostForm
            userId={userId}
            username={userName}
            isGroupPost={true}
            userProfileImage={currentUser?.profile_image}
            onPostCreated={() => fetchGroupPosts(groupId)}
          />
        </div>

        {/* Group Posts Feed */}
        <div className="groups-feed">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="no-posts">
              <p>
                No posts in groups yet. Join a group or create your first post!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post._id} className="group-post">
                <div className="post-header">
                  <img
                    src={
                      post.user?.profile_image || "/images/default-profile.png"
                    }
                    alt="User"
                    className="post-avatar"
                  />
                  <div className="post-user-info">
                    <div className="post-username">
                      {post.user?.username || "Unknown User"}
                    </div>
                    <div className="post-time">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {post.group && (
                    <div className="group-tag">{post.group.name}</div>
                  )}
                </div>

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-description">{post.content}</p>
                </div>

                {post.image && (
                  <div className="post-media">
                    <img src={post.image} alt="Post" className="post-image" />
                  </div>
                )}

                {post.video && (
                  <div className="post-media">
                    <video src={post.video} className="post-video" controls />
                  </div>
                )}

                <div className="post-actions">
                  <button className="post-action">
                    <Heart size={18} />
                    <span>{post.likes?.length || 0} likes</span>
                  </button>
                  <button className="post-action">
                    <MessageCircle size={18} />
                    <span>{post.comments?.length || 0} comments</span>
                  </button>
                  <button className="post-action">
                    <Bookmark size={18} />
                    Save
                  </button>
                  <button className="post-action">
                    <Share size={18} />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
