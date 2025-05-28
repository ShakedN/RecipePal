import React, { useState } from "react"; // Add useState here
import { Heart, MessageCircle, Edit } from "lucide-react"; // Add Edit here
import "./PostCard.css";

export default function PostCard({
  post,
  onLike,
  onComment,
  onDeleteComment,
  onEditComment
}) {
  const userId = localStorage.getItem("userId");
  const isLiked = post.likes?.some(like => like._id === userId);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
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
  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src="/images/default-profile.png"
          alt="User"
          className="avatar"
        />
        <div className="header-text">
          <span className="username">{post.userName}</span>
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
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

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
          onClick={() => onComment(post._id)}
          aria-label="Comment"
        >
          <MessageCircle size={18} className="icon" fill="currentColor" />
          <span className="count">{post.comments?.length || 0}</span>
        </button>
      </div>

      {post.comments?.length > 0 && (
        <div className="comments-section">
          <h4>Comments:</h4>
          {post.comments.map(comment => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <img
                  src="/images/default-profile.png"
                  alt="User"
                  className="comment-avatar"
                />
                <span className="comment-username">
                  {comment.user.username}
                </span>
                <span className="comment-time">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                {comment.user._id === userId && (
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

      {/* Optional: Show who liked the post */}
      {post.likes?.length > 0 && (
        <div className="likes-info">
          Liked by: {post.likes.map(like => like.username).join(", ")}
        </div>
      )}
    </div>
  );
}
