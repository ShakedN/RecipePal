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
import PostCard from "../components/PostCard";

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
      const response = await axios.get(
        `http://localhost:5000/api/groups/suggested/${userId}`
      );
      setSuggestedGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching suggested groups:", error);
      setSuggestedGroups([]);
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

  //Posts functions

  const handleDeletePost = async (postId) => {
    const userId = localStorage.getItem("userId");
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        data: { userId },
      });
      setGroupPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== postId)
      );
    } catch (err) {
      alert(
        "Failed to delete post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEditPost = async (postId, newContent) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}`, {
        userId,
        content: newContent,
        title:
          groupPosts.find((post) => post._id === postId)?.title ||
          "Updated Post",
      });
      setGroupPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      alert(
        "Failed to edit post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to like posts.");
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        { userId }
      );
      setGroupPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      console.error("Failed to like post:", err);
      alert(
        "Failed to like post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleAddComment = async (postId, content) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to comment.");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { userId, content }
      );
      setGroupPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert(
        "Failed to add comment: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/posts/${postId}/comment/${commentId}`,
        { data: { userId } }
      );
      setGroupPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      alert(
        "Failed to delete comment: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleComment = (postId, content) => {
    if (content) {
      handleAddComment(postId, content);
    }
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${postId}/comment/${commentId}`,
        {
          userId,
          content: newContent,
        }
      );
      setGroupPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      alert(
        "Failed to edit comment: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

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
            groupId={groupId}
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
              <PostCard
                key={post._id}
                post={post}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onLike={handleLike}
                onComment={handleComment}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
