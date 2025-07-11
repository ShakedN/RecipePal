import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import './PostDetail.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);
// Fetches a single post by ID from the backend , Handles loading states and error cases
  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
      setPost(response.data);
    } catch (err) {
      setError('Post not found');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to like posts');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, { userId });
      setPost(response.data);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };
// Adds a new comment to the post
  const handleComment = async (postId, content) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to comment');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, {
        userId,
        content
      });
      setPost(response.data);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };
// Deletes a comment from the post
  const handleDeleteComment = async (postId, commentId) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
        data: { userId }
      });
      setPost(response.data);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };
// Edits an existing comment
  const handleEditComment = async (postId, commentId, newContent) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await axios.put(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
        userId,
        content: newContent
      });
      setPost(response.data);
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };
// Deletes the entire post
  const handleDeletePost = async (postId) => {
    const userId = localStorage.getItem('userId');
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        data: { userId }
      });
      navigate('/feed');
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };
// Edits the post content
  const handleEditPost = async (postId, newContent) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await axios.put(`http://localhost:5000/api/posts/${postId}`, {
        userId,
        content: newContent,
        title: post.title
      });
      setPost(response.data);
    } catch (err) {
      console.error('Error editing post:', err);
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div className="error">Post not found</div>;

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>Post Details</h1>
      </div>
      
      <div className="post-detail-content">
        <PostCard
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
        />
      </div>
    </div>
  );
}