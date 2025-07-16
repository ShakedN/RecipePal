import React, { useState } from "react";
import { Heart, MessageCircle, Edit, Trash2 } from "lucide-react";
import "./PostCard.css";

/**
 * PostCard Component
 * Displays a single post with all interactive features including:
 * - Like/Unlike functionality
 * - Comment system with add/edit/delete
 * - Post editing for owners
 * - Post deletion for owners/group admins
 * - Media display (images/videos)
 * - Recipe-specific information display
 */
export default function PostCard({
  post,                 // Post object containing all post data
  onEditPost,          // Callback function to handle post editing
  isGroupAdmin,        // Boolean indicating if current user is group admin
  onDeletePost,        // Callback function to handle post deletion
  onLike,              // Callback function to handle like/unlike
  onComment,           // Callback function to handle adding comments
  onDeleteComment,     // Callback function to handle comment deletion
  onEditComment,       // Callback function to handle comment editing
}) {
  // State management for component interactions
  const [showCommentInput, setShowCommentInput] = useState(false);    // Controls comment input visibility
  const [commentText, setCommentText] = useState("");                 // Current comment text being typed
  const userId = localStorage.getItem("userId");                      // Current logged-in user ID
  const isLiked = post.likes?.some((like) => like && like._id === userId); // Check if current user liked the post
  const [editingCommentId, setEditingCommentId] = useState(null);     // ID of comment currently being edited
  const [editContent, setEditContent] = useState("");                 // Content of comment being edited
  const [isEditingPost, setIsEditingPost] = useState(false);          // Toggle for post edit mode
  const [editPostContent, setEditPostContent] = useState("");         // Content of post being edited

  /**
   * Toggles the comment input section visibility
   * Clears any existing comment text when toggling
   */
  const toggleCommentInput = () => {
    setShowCommentInput((prev) => !prev);
    setCommentText("");
  };

  /**
   * Handles comment submission
   * Validates comment text and calls parent callback
   * Resets form after successful submission
   */
  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText.trim());
      setCommentText("");
      setShowCommentInput(false);
    }
  };

  /**
   * Handles comment edit submission
   * Validates edited content and calls parent callback
   * Resets edit state after successful submission
   */
  const handleEditSubmit = (commentId) => {
    if (editContent.trim()) {
      onEditComment(post._id, commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent("");
    }
  };

  /**
   * Cancels comment editing
   * Resets edit state without saving changes
   */
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  /**
   * Handles post deletion
   * Calls parent callback to delete the entire post
   */
  const handleDeleteClick = () => {
    onDeletePost(post._id);
  };

  /**
   * Initiates post editing mode
   * Sets edit state and pre-fills with current content
   */
  const handleEditPostClick = () => {
    setIsEditingPost(true);
    setEditPostContent(post.content);
  };

  /**
   * Handles post edit submission
   * Validates edited content and calls parent callback
   * Exits edit mode after successful submission
   */
  const handleEditPostSubmit = () => {
    if (editPostContent.trim()) {
      onEditPost(post._id, editPostContent.trim());
      setIsEditingPost(false);
    }
  };

  /**
   * Cancels post editing
   * Resets content to original and exits edit mode
   */
  const handleEditPostCancel = () => {
    setIsEditingPost(false);
    setEditPostContent(post.content);
  };

  /**
   * Initiates comment editing mode
   * Sets the specific comment being edited and pre-fills content
   */
  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  return (
    <div className="post-card">
      {/* Post Header Section - User info, timestamps, and action buttons */}
      <div className="post-header">
        {/* User avatar */}
        <img
          src={post.user?.profile_image || "/images/default-profile.png"}
          alt="User"
          className="avatar"
        />
        
        {/* Post metadata and user information */}
        <div className="header-text">
          <span className="username">
            {post.user?.username || "Unknown User"}
          </span>
          <span className="timestamp">
            {new Date(post.createdAt).toLocaleString()}
          </span>
          <span className="kind-of-post">{post.kindOfPost}</span>
          
          {/* Recipe-specific information display */}
          {post.kindOfPost === "recipe" && (
            <>
              <span className="type-recipe">{post.typeRecipe}</span>
              <span className="dietary-preferences">
                {post.dietaryPreferences?.join(", ")}
              </span>
            </>
          )}
        </div>

        {/* Post action buttons - Edit and Delete */}
        {/* Edit button - only visible to post owner */}
        {post.user?._id === userId && (
          <button
            className="edit-post-btn"
            onClick={handleEditPostClick}
            title="Edit Post"
          >
            <Edit size={18} />
          </button>
        )}

        {/* Delete button - visible to post owner or group admin */}
        {(post.user?._id === userId || isGroupAdmin) && (
          <button
            className="delete-post-btn"
            onClick={handleDeleteClick}
            title="Delete Post"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Post title */}
      <h3 className="post-title">{post.title}</h3>

      {/* Post content section - toggles between edit and display modes */}
      {isEditingPost ? (
        // Edit mode - shows textarea and save/cancel buttons
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
        // Display mode - shows formatted content
        <p className="post-content">{post.content}</p>
      )}

      {/* Media display section */}
      {/* Image display */}
      {post.image && <img src={post.image} alt="Post" className="post-image" />}

      {/* Video display with controls */}
      {post.video && <video src={post.video} className="post-video" controls />}

      {/* Post interaction buttons - Like and Comment */}
      <div className="post-actions">
        {/* Like button - changes appearance based on like status */}
        <button
          className={`action-btn ${isLiked ? "liked" : ""}`}
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

        {/* Comment button - toggles comment input */}
        <button
          className="action-btn"
          onClick={toggleCommentInput}
          aria-label="Comment"
        >
          <MessageCircle size={18} className="icon" fill="currentColor" />
          <span className="count">{post.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comment input section - shown when user clicks comment button */}
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

      {/* Comments display section */}
      {post.comments?.length > 0 && (
        <div className="comments-section">
          <h4>Comments:</h4>
          {post.comments.map((comment) => (
            <div key={comment._id} className="comment">
              {/* Comment header with user info and action buttons */}
              <div className="comment-header">
                <img
                  src={
                    comment.user?.profile_image || "/images/default-profile.png"
                  }
                  alt="User"
                  className="comment-avatar"
                />
                <span className="comment-username">
                  {comment.user?.username || "Unknown User"}
                </span>
                <span className="comment-time">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                
                {/* Comment action buttons - only visible to comment owner */}
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

              {/* Comment content - toggles between edit and display modes */}
              {editingCommentId === comment._id ? (
                // Edit mode - shows textarea and save/cancel buttons
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
                // Display mode - shows formatted comment content
                <p className="comment-content">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Likes information section - shows who liked the post */}
      {post.likes?.length > 0 && (
        <div className="likes-info">
          Liked by:{" "}
          {post.likes
            .filter((like) => like && like.username)
            .map((like) => like.username)
            .join(", ")}
        </div>
      )}
    </div>
  );
}