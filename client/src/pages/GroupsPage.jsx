import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserPlus,
  Activity,
  LogOut,
  Trash2,
  Users,
  UserMinus,
} from "lucide-react";
import axios from "axios";
import "./GroupsPage.css";
import { useParams } from "react-router-dom";
import NewPostForm from "../components/NewPostForm";
import PostCard from "../components/PostCard";

export default function GroupsPage() {
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  //Params and localStorage user info
  const { groupId } = useParams();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("username");
  const [currentUser, setCurrentUser] = useState(null);

  //Fetch suggested groups for the user (based on his friend's groups)
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

  //Fetch current user data including profile image
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(
          `http://localhost:5000/api/auth/profile/${userId}`,
          config
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

  const isGroupAdmin = useMemo(() => {
    if (!group || !currentUser) return false;
    return String(group.admin._id) === String(currentUser._id);
  }, [group, currentUser]); //Check if the user is the admin of the group, useMemo to ensure it happend only when both group and currentUser loaded

  //Refetch group posts
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

  //Leave or delete group depending on user status (admin/member)
  const handleLeaveGroup = async () => {
    if (!group || !userId) return;

    const confirmMessage = isGroupAdmin
      ? "Are you sure you want to delete this group? This action cannot be undone and will remove all posts and members."
      : "Are you sure you want to leave this group?";

    if (!window.confirm(confirmMessage)) return;

    try {
      if (isGroupAdmin) {
        //Delete group (admin only)
        await axios.delete(`http://localhost:5000/api/groups/${groupId}`, {
          data: { userId },
        });
        alert("Group deleted successfully!");
        //Navigate main feed
        window.location.href = "/";
      } else {
        //Leave group (group member)
        await axios.post(`http://localhost:5000/api/groups/${groupId}/leave`, {
          userId,
        });
        alert("You have left the group successfully!");
        //Navigate to groups page or main feed
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error leaving/deleting group:", error);
      alert(
        error.response?.data?.message ||
          "Failed to perform action. Please try again."
      );
    }
  };

  //Join group
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

  //Admin remove member from the group
  const handleRemoveMember = async (memberIdToRemove) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this member from the group?"
      )
    ) {
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/remove-member`,
        {
          userId,
          memberIdToRemove,
        }
      );

      //Update the group state to remove the member
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter(
          (member) => member._id !== memberIdToRemove
        ),
      }));

      alert("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      alert(
        error.response?.data?.message ||
          "Failed to remove member. Please try again."
      );
    }
  };

  //Post actions: delete, edit, like and comment
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

  return (
    <div className="groups-page">
      {/*Right Sidebar- Suggested Groups*/}
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
          {!group ? (
            <p>Loading group activity...</p>
          ) : groupPosts.length === 0 ? (
            <p>No recent activity in this group.</p>
          ) : (
            groupPosts.slice(0, 3).map((post) => (
              <div key={post._id} className="activity-item">
                <div className="group-avatar activity">
                  {post.user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="activity-info">
                  <div className="activity-text">
                    {post.user?.username || "Unknown user"} posted "
                    {post.title?.substring(0, 30)}
                    {post.title?.length > 30 ? "..." : ""}"
                  </div>
                  <div className="activity-group">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/*Main Content*/}
      <div className="groups-main-content">
        {/*Group data*/}
        {group ? (
          <div className="group-data">
            <div className="title">
              <div className="group-avatar">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <h2>{group.name}</h2>
            </div>
            <p>{group.description}</p>

            {/*Group Actions*/}
            <div className="group-actions">
              {isGroupAdmin ? (
                <button
                  className="delete-group-btn"
                  onClick={handleLeaveGroup}
                  title="Delete Group"
                >
                  <Trash2 size={16} />
                  Delete Group
                </button>
              ) : (
                <button
                  className="leave-group-btn"
                  onClick={handleLeaveGroup}
                  title="Leave Group"
                >
                  <LogOut size={16} />
                  Leave Group
                </button>
              )}
            </div>
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
            userProfileImage={currentUser?.profile_image}
            onPostCreated={() => fetchGroupPosts(groupId)}
          />
        </div>

        {/*Group Posts Feed*/}
        <div className="groups-feed">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : groupPosts.length === 0 ? (
            <div className="no-posts">
              <p>
                No posts in groups yet. Join a group or create your first post!
              </p>
            </div>
          ) : (
            groupPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                isGroupAdmin={isGroupAdmin}
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
      {/*Members List*/}
      <div className="widget">
        <div className="sidebar-title">
          <Users size={20} />
          Group Members ({group?.members?.length || 0})
        </div>
        {!group ? (
          <p>Loading members...</p>
        ) : group.members.length === 0 ? (
          <p>No members in this group.</p>
        ) : (
          group.members.map((member) => (
            <div key={member._id} className="member-item">
              <div className="member-avatar">
                {member.profile_image ? (
                  <img src={member.profile_image} alt={member.username} />
                ) : (
                  member.username?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="member-info">
                <div className="member-name">
                  {member.firstName} {member.lastName}
                  {member._id === group.admin._id && (
                    <span className="admin-badge">Admin</span>
                  )}
                </div>
                <div className="member-username">@{member.username}</div>
              </div>
              {isGroupAdmin && member._id !== group.admin._id && (
                <button
                  className="remove-member-btn"
                  onClick={() => handleRemoveMember(member._id)}
                  title="Remove member"
                >
                  <UserMinus size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
