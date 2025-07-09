import React, { useEffect, useState, useRef } from "react";
import PostCard from "../components/PostCard";
import PhotoEditor from "../components/PhotoEditor";
import VideoEditor from "../components/VideoEditor";
import { Video, Image, Edit3 } from "lucide-react";
import "./FeedPage.css";
import axios from "axios";

const recipeExContent = `Hey #BakersOfRecipePal, ready to level up your dessert game? This rich, dreamy chocolate cake is:

Super moist thanks to hot coffee
Incredibly easy with pantry staples
Perfect for birthdays, gatherings, or a cozy night in

📋 What You Need
• 1¾ cups flour
• ¾ cup cocoa powder
• 2 cups sugar
• 1½ tsp baking powder & soda
• 1 tsp salt
• 2 eggs
• 1 cup milk
• ½ cup oil
• 2 tsp vanilla
• 1 cup hot coffee (or hot water)

🍰 Frosting
• ¾ cup butter
• 1⅓ cups cocoa
• 5 cups powdered sugar
• ⅓ cup milk (plus more if needed)
• 2 tsp vanilla
• Pinch of salt

👩‍🍳 Steps in a Snap
1️⃣ Preheat to 350°F (175°C), prep two 8″ pans
2️⃣ Whisk dry ingredients
3️⃣ Beat in eggs, milk, oil & vanilla
4️⃣ Pour in hot coffee—batter will thin!
5️⃣ Bake 30–35 min, cool completely
6️⃣ Whip butter, cocoa, sugar & milk into fluffy frosting
7️⃣ Layer, frost & decorate

💡 Pro Tips
• Swap half water for espresso for extra depth
• Use cake flour for a lighter crumb
• Gluten-free? Your favorite 1:1 blend works great!

📸 Don’t forget to snap that ooey-gooey cross-section and tag me so I can drool over your masterpiece! 😍👩‍🍳

#chocolatecake #baking #dessertlover #homemade #cakerecipe #foodie #instabake`;

export default function FeedPage() {
  const fileInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    video: "",
    kindOfPost: "",
    typeRecipe: "",
    dietaryPreferences: [],
    imageFile: null,
    videoFile: null,
    mediaType: "image",
    canvasData: null,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
    }
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to like posts.");
      return;
    }
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, { userId });
      setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error("Failed to like post:", err);
      alert("Failed to like post: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddComment = async (postId, content) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to comment.");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, { userId, content });
      setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.delete(`http://localhost:5000/api/posts/${postId}/comment/${commentId}`, { data: { userId } });
      setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      alert("Failed to delete comment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleComment = (postId, content) => {
    if (content) {
      handleAddComment(postId, content);
    }
  };

  const handleNewPostChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNewPost((prev) => ({
        ...prev,
        dietaryPreferences: checked
          ? [...prev.dietaryPreferences, value]
          : prev.dietaryPreferences.filter((pref) => pref !== value),
      }));
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    const res = await fetch("https://api.cloudinary.com/v1_1/djfulsk1f/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const handleVideoUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    const res = await fetch("https://api.cloudinary.com/v1_1/djfulsk1f/video/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}/comment/${commentId}`, {
        userId,
        content: newContent,
      });
      setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      alert("Failed to edit comment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    const userName = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      let imageUrl = "";
      let videoUrl = "";

      if (newPost.mediaType === "image" && newPost.imageFile) {
        if (isEdited && newPost.canvasData?.editedUrl) {
          imageUrl = newPost.canvasData.editedUrl;
        } else {
          imageUrl = await handleImageUpload(newPost.imageFile);
        }
      } else if (newPost.mediaType === "video" && newPost.videoFile) {
        if (isEdited && newPost.canvasData?.editedUrl) {
          videoUrl = newPost.canvasData.editedUrl;
        } else {
            videoUrl = await handleVideoUpload(newPost.videoFile);
        }
      }

      const postPayload = {
        userId,
        userName,
        kindOfPost: newPost.kindOfPost,
        title: newPost.title,
        content: newPost.content,
        mediaType: newPost.mediaType,
        image: imageUrl,
        video: videoUrl,
        canvasData: newPost.canvasData,
      };

      if (newPost.kindOfPost === "recipe") {
        postPayload.typeRecipe = newPost.typeRecipe;
        postPayload.dietaryPreferences = newPost.dietaryPreferences;
      }

      await axios.post("http://localhost:5000/api/posts", postPayload);
      await fetchPosts();

      setNewPost({
        title: "", content: "", image: "", video: "", kindOfPost: "", typeRecipe: "",
        dietaryPreferences: [], imageFile: null, videoFile: null, mediaType: "image", canvasData: null,
      });
      setIsEdited(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      alert("Failed to add post: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeletePost = async (postId) => {
    const userId = localStorage.getItem("userId");
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, { data: { userId } });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditPost = async (postId, newContent) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}`, {
        userId,
        content: newContent,
        title: posts.find((post) => post._id === postId)?.title || "Updated Post",
      });
      setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      alert("Failed to edit post: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditMedia = (file, type) => {
    const url = URL.createObjectURL(file);
    setEditingMedia({ url, type, file });
    if (type === "image") setShowPhotoEditor(true);
    else if (type === "video") setShowVideoEditor(true);
  };

  const handleSaveEdit = async (editData) => {
    try {
      let finalUrl = "";
      if (editData.blob) {
        const formData = new FormData();
        formData.append("file", editData.blob);
        formData.append("upload_preset", "ml_default");
        const uploadUrl =
          editingMedia.type === "video"
            ? "https://api.cloudinary.com/v1_1/djfulsk1f/video/upload"
            : "https://api.cloudinary.com/v1_1/djfulsk1f/image/upload";
        const res = await fetch(uploadUrl, { method: "POST", body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
        finalUrl = data.secure_url;
      }
      setNewPost((prev) => ({
        ...prev,
        canvasData: {
          originalUrl: editingMedia.url,
          editedUrl: finalUrl,
          filters: editData.filters || {},
        },
      }));
      setIsEdited(true);
      setShowPhotoEditor(false);
      setShowVideoEditor(false);
      setEditingMedia(null);
      console.log("Media edited and saved successfully!", finalUrl);
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
    <div className="feed-content">
      {showPhotoEditor && editingMedia && (
        <PhotoEditor imageUrl={editingMedia.url} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
      )}
      {showVideoEditor && editingMedia && (
        <VideoEditor videoUrl={editingMedia.url} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
      )}

      {/* MODERN NEW POST FORM */}
      <div className="new-post-container-modern">
        <div className="new-post-header">
          <img src="/images/default-profile.png" alt="Your Profile" className="new-post-avatar" />
          <div className="new-post-greeting">
            <span>What's cooking, {localStorage.getItem("username")}?</span>
          </div>
        </div>

        <form onSubmit={handleNewPostSubmit} className="new-post-form-modern">
          <div className="new-post-layout-grid">
            {/* Column 1: Media Upload and Preview */}
            <div className="media-column">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const fileType = file.type.startsWith("video") ? "video" : "image";
                    setNewPost({
                      ...newPost,
                      mediaType: fileType,
                      imageFile: fileType === "image" ? file : null,
                      videoFile: fileType === "video" ? file : null,
                    });
                    setIsEdited(false);
                    setEditingMedia(null);
                  }
                }}
                className="media-input"
                ref={fileInputRef}
              />
              {!newPost.imageFile && !newPost.videoFile ? (
                <div className="media-upload-zone" onClick={() => fileInputRef.current.click()}>
                  <Image size={48} strokeWidth={1.5} />
                  <Video size={48} strokeWidth={1.5} />
                  <p><strong>Click to upload</strong> or drag and drop a photo or video.</p>
                  <span className="upload-hint">High-quality visuals get more likes!</span>
                </div>
              ) : (
                <div className="media-preview-container">
                  {newPost.imageFile && (
                    <img src={URL.createObjectURL(newPost.imageFile)} alt="Preview" className="media-preview" />
                  )}
                  {newPost.videoFile && (
                    <video src={URL.createObjectURL(newPost.videoFile)} className="media-preview" controls />
                  )}
                  <div className="media-actions-overlay">
                    <button
                      type="button"
                      onClick={() => handleEditMedia(newPost.imageFile || newPost.videoFile, newPost.mediaType)}
                      className="media-action-btn"
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPost({ ...newPost, imageFile: null, videoFile: null });
                        fileInputRef.current.value = "";
                      }}
                      className="media-action-btn remove"
                    >
                      Change
                    </button>
                  </div>
                  {isEdited && <div className="edited-badge">✨ Edited</div>}
                </div>
              )}
            </div>

            {/* Column 2: Form Details */}
            <div className="form-column">
              <div className="form-section">
                <input
                  type="text"
                  name="title"
                  placeholder="Give your recipe a catchy title..."
                  value={newPost.title}
                  onChange={handleNewPostChange}
                  className="styled-input title-input"
                  required
                />
              </div>

              <div className="form-section">
                <label className="form-label">What are you sharing?</label>
                <select name="kindOfPost" value={newPost.kindOfPost} onChange={handleNewPostChange} required className="styled-select">
                  <option value="">Choose post type...</option>
                  <option value="recipe">🍳 Recipe</option>
                  <option value="shared thoughts">💭 Shared Thoughts</option>
                </select>
              </div>

              {newPost.kindOfPost === "recipe" && (
                <div className="recipe-details">
                  <div className="form-section-inline">
                    <div className="form-section">
                      <label className="form-label">Category</label>
                      <select name="typeRecipe" value={newPost.typeRecipe} onChange={handleNewPostChange} required className="styled-select">
                        <option value="">Select...</option>
                        <option value="desert">🍰 Dessert</option>
                        <option value="main dish">🍽️ Main Dish</option>
                        <option value="appetize">🥗 Appetizer</option>
                        <option value="side dish">🥖 Side Dish</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-section">
                    <label className="form-label">Dietary Tags</label>
                    <div className="dietary-preferences">
                      {[
                        { value: "dairy-free", label: "🥛 Dairy-Free" },
                        { value: "gluten-free", label: "🌾 Gluten-Free" },
                        { value: "vegan", label: "🌱 Vegan" },
                        { value: "vegeterian", label: "🥕 Vegetarian" },
                      ].map((pref) => (
                        <label key={pref.value} className="checkbox-label">
                          <input type="checkbox" name="dietaryPreferences" value={pref.value}
                            checked={newPost.dietaryPreferences.includes(pref.value)}
                            onChange={handleNewPostChange} className="styled-checkbox"
                          />
                          <span className="checkbox-text">{pref.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <div className="textarea-header">
                  <label className="form-label">Recipe & Instructions</label>
                  <button type="button" className="template-button" onClick={() => setNewPost({ ...newPost, content: recipeExContent })}>
                    Use Template
                  </button>
                </div>
                <textarea
                  name="content"
                  placeholder="Share your story, ingredients, and step-by-step instructions...

💡 Tip: Use hashtags like #chocolatecake to help others find your recipe!"
                  value={newPost.content}
                  onChange={handleNewPostChange}
                  className="styled-textarea"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="submit" className="post-submit-btn">
              <span>🚀 Share Post</span>
            </button>
          </div>
        </form>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="no-posts-message">
          <p>No posts yet. Be the first to share something delicious! 🍳</p>
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
  );
}