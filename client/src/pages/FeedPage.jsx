import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import PhotoEditor from "../components/PhotoEditor";
import VideoEditor from "../components/VideoEditor";
import { Users, Plus } from "lucide-react";
import "./FeedPage.css";
import axios from "axios";
import JoinGroupPopup from "../components/JoinGroupPopup";
import CreateGroupModal from "../components/CreateGroupModal";
import NewPostForm from "../components/NewPostForm";

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [groups, setGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const userId = localStorage.getItem("userId"); //Get userId from local storage
  const userName = localStorage.getItem("username"); //Get username from local storage

  //Fetch posts filtered for the current user (posts of user's friends and groups)
  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/filtered/${userId}`
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
    }
  }, [userId]);

  //Fetch user's groups (groups he is member in)
  const fetchUserGroups = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/groups/user/${userId}`
      );
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  }, [userId]);

  //Fetch suggested (trending) groups for the user based on his friends
  const fetchSuggestedGroups = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/groups/suggested/${userId}`
      );
      setSuggestedGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching suggested groups:", error);
      setSuggestedGroups([]);
    }
  }, [userId]);

  //Fetch current user data including profile image
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/profile/${userId}`
        );
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    if (userId) {
      fetchCurrentUser();
    }
  }, [userId]);

  //Fetch all necessary data and apply page styling
  useEffect(() => {
    document.body.classList.add("feed-page-background");

    const fetchData = async () => {
      await fetchPosts();
      await fetchUserGroups();
      await fetchSuggestedGroups();
    };

    fetchData();

    return () => {
      document.body.classList.remove("feed-page-background");
    };
  }, [fetchPosts, fetchUserGroups, fetchSuggestedGroups]);

  //Navigate to specific group pag
  const handleGroupSelect = (group) => {
    navigate(`/groups/${group._id}`);
  };

  //Open join group popup
  const handleTrendingGroupClick = (group) => {
    setSelectedGroup(group);
    setShowJoinGroupPopup(true);
  };

  //Send join group request
  const handleJoinGroupRequest = async () => {
    if (!selectedGroup) return;

    try {
      const userId = localStorage.getItem("userId");
      await axios.post(
        `http://localhost:5000/api/groups/${selectedGroup._id}/request-join`,
        {
          userId,
        }
      );

      alert("Join request sent to group admin successfully!");
      setShowJoinGroupPopup(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error("Error sending join request:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send join request. Please try again."
      );
    }
  };

  //Cancel join group request popup
  const handleCancelJoinRequest = () => {
    setShowJoinGroupPopup(false);
    setSelectedGroup(null);
  };

  //Post actions: like, comment and delete
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
      setPosts((prevPosts) =>
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
      setPosts((prevPosts) =>
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
      setPosts((prevPosts) =>
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
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      alert(
        "Failed to edit comment: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeletePost = async (postId) => {
    const userId = localStorage.getItem("userId");
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        data: { userId },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
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
          posts.find((post) => post._id === postId)?.title || "Updated Post",
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (err) {
      alert(
        "Failed to edit post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleSaveEdit = async (editData) => {
    try {
      let finalUrl = "";

      if (editingMedia.type === "video") {
        if (editData.blob) {
          const formData = new FormData();
          formData.append("file", editData.blob, "trimmed-video.webm");
          formData.append("upload_preset", "ml_default");

          const res = await fetch(
            "https://api.cloudinary.com/v1_1/djfulsk1f/video/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();
          if (!data.secure_url)
            throw new Error(data.error?.message || "Upload failed");
          finalUrl = data.secure_url;
        } else {
          throw new Error("No trimmed video blob created");
        }
      } else if (editingMedia.type === "image") {
        if (editData.blob) {
          const formData = new FormData();
          formData.append("file", editData.blob);
          formData.append("upload_preset", "ml_default");

          const res = await fetch(
            "https://api.cloudinary.com/v1_1/djfulsk1f/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();
          if (!data.secure_url)
            throw new Error(data.error?.message || "Upload failed");
          // Store uploaded URL for potential future use
          data.secure_url;
        }
      }

      setIsEdited(true);
      setShowPhotoEditor(false);
      setShowVideoEditor(false);
      setEditingMedia(null);
    } catch (error) {
      console.error("Failed to save edit:", error);
      alert("Failed to save edited media: " + error.message);
    }
  };

  const handleCancelEdit = () => {
    setShowPhotoEditor(false);
    setShowVideoEditor(false);
    setEditingMedia(null);
  };

  return (
    <div className="feed-page-container">
      {/*Groups Sidebar*/}
      <div className="groups-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">
            <Users size={20} />
            My Groups
          </div>
          {groups.map((group) => (
            <div
              key={group._id}
              className="group-item"
              onClick={() => handleGroupSelect(group)}
            >
              <div className="group-avatar">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-members">
                  {group.members?.length || 0} members
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">🔥 Trending Groups</div>
          {suggestedGroups.slice(0, 3).map((group) => (
            <div
              key={group._id}
              className="group-item"
              onClick={() => handleTrendingGroupClick(group)}
            >
              <div className="group-avatar trending">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-members">
                  {group.members?.length || 0} members
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">⚡ Quick Actions</div>
          <div className="group-item" onClick={() => setShowCreateGroup(true)}>
            <div className="group-avatar create">
              <Plus size={16} />
            </div>
            <div className="group-info">
              <div className="group-name">Create Group</div>
              <div className="group-members">Start cooking together</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="feed-content">
        {showPhotoEditor && editingMedia && (
          <PhotoEditor
            imageUrl={editingMedia.url}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
        {showVideoEditor && editingMedia && (
          <VideoEditor
            videoUrl={editingMedia.url}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}

        {/* MODERN NEW POST FORM */}
        <div className="new-post-container-modern">
          <NewPostForm
            userId={userId}
            username={userName}
            isGroupPost={false}
            userProfileImage={currentUser?.profile_image}
            onPostCreated={() => fetchPosts()}
          />
        </div>

        {/*Posts*/}
        {posts.length === 0 ? (
          <div className="no-posts-message">
            <p>No posts yet. Be the first to share something delicious!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
              onDeletePost={handleDeletePost}
              onEditPost={handleEditPost}
            />
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={() => {
            fetchUserGroups();
            setShowCreateGroup(false);
          }}
        />
      )}

      {/* Join Group Popup */}
      {showJoinGroupPopup && selectedGroup && (
        <JoinGroupPopup
          group={selectedGroup}
          onJoin={handleJoinGroupRequest}
          onCancel={handleCancelJoinRequest}
        />
      )}
    </div>
  );
}
