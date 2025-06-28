import React, { useState } from "react";
import { Heart, MessageCircle, Edit, Trash2 } from "lucide-react";
import "./PostCard.css";

export default function PostCard({
  post,
  onEditPost,
  onDeletePost,
  onLike,
  onComment,
  onDeleteComment,
  onEditComment
}) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const userId = localStorage.getItem("userId");
  const isLiked = post.likes?.some(like => like && like._id === userId);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
 
  const toggleCommentInput = () => {                    
    setShowCommentInput(prev => !prev);
    setCommentText("");
  };

  const handleCommentSubmit = () => {                  
    if (commentText.trim()) {
      onComment(post._id, commentText.trim());
      setCommentText("");
      setShowCommentInput(false);
    }
  };

  const handleEditSubmit = (commentId) => {
    if (editContent.trim()) {
      onEditComment(post._id, commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent("");
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleDeleteClick = () => {
    onDeletePost(post._id);
  };

  const handleEditPostClick = () => {
    setIsEditingPost(true);
    setEditPostContent(post.content);
  };

  const handleEditPostSubmit = () => {
    if (editPostContent.trim()) {
      onEditPost(post._id, editPostContent.trim());
      setIsEditingPost(false);
    }
  };

  const handleEditPostCancel = () => {
    setIsEditingPost(false);
    setEditPostContent(post.content);
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={post.user?.profile_image || "/images/default-profile.png"}
          alt="User"
          className="avatar"
        />
        <div className="header-text">
          <span className="username">{post.user?.username || "Unknown User"}</span>
          <span className="timestamp">
            {new Date(post.createdAt).toLocaleString()}
          </span>
          <span className="kind-of-post">{post.kindOfPost}</span>
          {post.kindOfPost === "recipe" && (
            <>
              <span className="type-recipe">{post.typeRecipe}</span>
              <span className="dietary-preferences">
                {post.dietaryPreferences?.join(", ")}
              </span>
            </>
          )}
        </div>
        
        {/* Edit and Delete buttons - only show for post owner */}
        {post.user?._id === userId && (
          <div className="post-menu">
            <button
              className="edit-post-btn"
              onClick={handleEditPostClick}
              title="Edit Post"
            >
              <Edit size={18} />
            </button>
            <button
              className="delete-post-btn"
              onClick={handleDeleteClick}
              title="Delete Post"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Remove duplicate title - keep only one */}
      <h3 className="post-title">{post.title}</h3>

      {/* Conditional rendering for post content - either edit mode or display mode */}
      {isEditingPost ? (
        <div className="edit-post-form">
          <textarea
            value={editPostContent}
            onChange={(e) => setEditPostContent(e.target.value)}
            className="edit-post-content"
            placeholder="Edit your post content..."
          />
          <div className="edit-post-actions">
            <button onClick={handleEditPostSubmit} className="save-post-btn">
              Save
            </button>
            <button onClick={handleEditPostCancel} className="cancel-post-btn">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="post-content">{post.content}</p>
      )}
      {/* Remove this duplicate line: <p className="post-content">{post.content}</p> */}

      {post.image && (
        <img src={post.image} alt="Post" className="post-image" />
      )}

      <div className="post-actions">
        
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post._id)}
          aria-label="Like"
        >
          <Heart 
            size={18}
            className="icon"
            fill={isLiked ? "#ff4757" : "currentColor"}
            color={isLiked ? "#ff4757" : "currentColor"}
          />
          <span className="count">{post.likes?.length || 0}</span>
        </button>

        <button
          className="action-btn"
          onClick={toggleCommentInput}
          aria-label="Comment"
        >
          <MessageCircle size={18} className="icon" fill="currentColor" />
          <span className="count">{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {/*  Inline composer */}
        {showCommentInput && (
          <div className="add-comment-section">
            <textarea
              className="comment-textarea"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              className="comment-submit-btn"
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
        )}
      {post.comments?.length > 0 && (
        <div className="comments-section">
          <h4>Comments:</h4>
          {post.comments.map(comment => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <img
                  src={comment.user?.profile_image || "/images/default-profile.png"}
                  alt="User"
                  className="comment-avatar"
                />
                <span className="comment-username">
                  {comment.user?.username || "Unknown User"}
                </span>
                <span className="comment-time">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                {comment.user?._id === userId && (
                  <div className="comment-actions">
                    <button
                      onClick={() => handleEditClick(comment)}
                      className="edit-comment-btn"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteComment(post._id, comment._id)}
                      className="delete-comment-btn"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === comment._id ? (
                <div className="edit-comment-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-comment-input"
                  />
                  <div className="edit-comment-buttons">
                    <button
                      onClick={() => handleEditSubmit(comment._id)}
                      className="save-comment-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="cancel-comment-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Likes Section */}
      {post.likes?.length > 0 && (
        <div className="likes-info">
          Liked by: {post.likes
            .filter(like => like && like.username)
            .map(like => like.username)
            .join(", ")
          }
        </div>
      )}
    </div>
  );
}