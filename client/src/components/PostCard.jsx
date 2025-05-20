import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import "./PostCard.css";

export default function PostCard({ post, onLike, onComment }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={"/images/default-profile.png"}
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
          className="action-btn"
          onClick={() => onLike(post._id)}
          aria-label="Like"
        >
          <Heart size={18} className="icon" fill="currentColor" />
          <span className="count">{post.likes.length}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => onComment(post._id)}
          aria-label="Comment"
        >
          <MessageCircle size={18} className="icon" fill="currentColor" />
          <span className="count">{post.comments.length}</span>
        </button>
      </div>
    </div>
  );
}