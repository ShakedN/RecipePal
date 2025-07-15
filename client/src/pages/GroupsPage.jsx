import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Activity,
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
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const { groupId } = useParams();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("username");  const [currentUser, setCurrentUser] = useState(null);

  const fetchSuggestedGroups = useCallback(async () => {
    try {
      setLoadingSuggestions(true);
      const response = await axios.get(
        `http://localhost:5000/api/groups/suggested/${userId}`
      );
      setSuggestedGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching suggested groups:", error);
      setSuggestedGroups([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [userId]);

  // Fetch current user data including profile image
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {

        const token = localStorage.getItem("token");
        
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const response = await axios.get(`http://localhost:5000/api/auth/profile/${userId}`, config);
     
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
    fetchSuggestedGroups();
  }, [groupId, fetchSuggestedGroups]);

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
      fetchSuggestedGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const filteredPosts = groupPosts;

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
          <div className="activity-item">
            <div className="group-avatar activity">
              G
            </div>
            <div className="activity-info">
              <div className="activity-text">New recipe posted</div>
              <div className="activity-group">in this group</div>
            </div>
          </div>
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
