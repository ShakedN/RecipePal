import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
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
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    kindOfPost: "",
    typeRecipe: "",
    dietaryPreferences: [],
    imageFile: null,
  });

  // Fetch posts from backend instead of using mock data
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

  // Like handler
  // Like handler - call the backend API
  const handleLike = async (postId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to like posts.");
      return;
    }
  
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {
        userId
      });
      
      // Update the post in the state with the response from backend
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? res.data : post
        )
      );
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
    const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
      userId,
      content
    });
    
    // Update the post in the state with the response from backend
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? res.data : post
      )
    );
  } catch (err) {
    console.error("Failed to add comment:", err);
    alert("Failed to add comment: " + (err.response?.data?.message || err.message));
  }
};

// Delete comment handler
const handleDeleteComment = async (postId, commentId) => {
  const userId = localStorage.getItem("userId");
  try {
    const res = await axios.delete(`http://localhost:5000/api/posts/${postId}/comment/${commentId}`, {
      data: { userId }
    });
    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? res.data : post
      )
    );
  } catch (err) {
    alert("Failed to delete comment: " + (err.response?.data?.message || err.message));
  }
};

// Update your handleComment function
const handleComment = (postId) => {
  const content = prompt("Enter your comment:");
  if (content && content.trim()) {
    handleAddComment(postId, content.trim());
  }
};

  // Handle new post input changes
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
  formData.append("upload_preset", "ml_default"); // Use your unsigned preset

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/djfulsk1f/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
};

// Edit comment handler
const handleEditComment = async (postId, commentId, newContent) => {
  const userId = localStorage.getItem("userId");
  try {
    const res = await axios.put(`http://localhost:5000/api/posts/${postId}/comment/${commentId}`, {
      userId,
      content: newContent
    });
    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? res.data : post
      )
    );
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
    if (newPost.imageFile) {
      imageUrl = await handleImageUpload(newPost.imageFile);
    }

    // Create the post payload, using createPost function from postController
    const postPayload = {
      userId,
      userName,
      kindOfPost: newPost.kindOfPost,
      title: newPost.title,
      content: newPost.content,
      image: imageUrl,
    };

    // Only add recipe-specific fields if it's a recipe post
    if (newPost.kindOfPost === "recipe") {
      postPayload.typeRecipe = newPost.typeRecipe;
      postPayload.dietaryPreferences = newPost.dietaryPreferences;
    }

    await axios.post("http://localhost:5000/api/posts", postPayload);
    await fetchPosts(); // Refresh posts after creating
    setNewPost({
      title: "",
      content: "",
      kindOfPost: "",
      typeRecipe: "",
      dietaryPreferences: [],
      imageFile: null,
    });
  } catch (err) {
    alert("Failed to add post: " + (err.response?.data?.error || err.message));
  }
};

//delete post 

const handleDeletePost = async (postId) => {
  const userId = localStorage.getItem("userId");
  try {
    const res = await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
      data: { userId }
    });
  // Remove the deleted post from the posts array
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== postId)
    );
  } catch (err) {
    alert("Failed to delete post: " + (err.response?.data?.message || err.message));
  }
};

//edit post - content only
const handleEditPost = async (postId, newContent) => {
  const userId = localStorage.getItem("userId");
  try {
    const res = await axios.put(`http://localhost:5000/api/posts/${postId}`, {
      userId,
      content: newContent,
      // Add the title from the existing post to avoid backend validation issues
      title: posts.find(post => post._id === postId)?.title || "Updated Post"
    });
    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? res.data : post
      )
    );
  } catch (err) {
    alert("Failed to edit post: " + (err.response?.data?.message || err.message));
  }
};



    return (
    <div className="feed-content">
      {/* New Post Form */}
      <div className="new-post-container">
        <div className="new-post-header">
          <img
            src="/images/default-profile.png"
            alt="Your Profile"
            className="new-post-avatar"
          />
          <div className="new-post-greeting">
            <span>What's cooking, {localStorage.getItem("username")}?</span>
          </div>
        </div>
      
        <form onSubmit={handleNewPostSubmit} className="new-post-form">
          {/* Post Type Selection */}
          <div className="form-section">
            <label className="form-label">What are you sharing?</label>
            <select
              name="kindOfPost"
              value={newPost.kindOfPost}
              onChange={handleNewPostChange}
              required
              className="styled-select"
            >
              <option value="">Choose post type...</option>
              <option value="recipe">🍳 Recipe</option>
              <option value="shared thoughts">💭 Shared Thoughts</option>
            </select>
          </div>
      
          {/* Recipe-specific fields */}
          {newPost.kindOfPost === "recipe" && (
            <div className="recipe-details">
              <div className="form-section">
                <label className="form-label">Recipe Category</label>
                <select
                  name="typeRecipe"
                  value={newPost.typeRecipe}
                  onChange={handleNewPostChange}
                  required
                  className="styled-select"
                >
                  <option value="">Select category...</option>
                  <option value="desert">🍰 Dessert</option>
                  <option value="main dish">🍽️ Main Dish</option>
                  <option value="appetize">🥗 Appetizer</option>
                  <option value="side dish">🥖 Side Dish</option>
                </select>
              </div>
      
              <div className="form-section">
                <label className="form-label">Dietary Preferences</label>
                <div className="dietary-preferences">
                  {[
                    { value: "dairy-free", label: "🥛 Dairy-Free" },
                    { value: "gluten-free", label: "🌾 Gluten-Free" },
                    { value: "vegan", label: "🌱 Vegan" },
                    { value: "vegeterian", label: "🥕 Vegetarian" }
                  ].map((pref) => (
                    <label key={pref.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="dietaryPreferences"
                        value={pref.value}
                        checked={newPost.dietaryPreferences.includes(pref.value)}
                        onChange={handleNewPostChange}
                        className="styled-checkbox"
                      />
                      <span className="checkbox-text">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
      
          {/* Title Input */}
          <div className="form-section">
            <input
              type="text"
              name="title"
              placeholder="Give your post a catchy title..."
              value={newPost.title}
              onChange={handleNewPostChange}
              className="styled-input title-input"
              required
            />
          </div>
      
          {/* Image Upload */}
          <div className="form-section">
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPost({ ...newPost, imageFile: e.target.files[0] })}
                className="image-input"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="image-upload-label">
                📸 Add a photo
              </label>
              {newPost.imageFile && (
                <span className="file-selected">✓ {newPost.imageFile.name}</span>
              )}
            </div>
          </div>
      
          {/* Content Textarea */}
          <div className="form-section">
            <textarea
              name="content"
              placeholder="Share your story, recipe instructions, or thoughts..."
              value={newPost.content}
              onChange={handleNewPostChange}
              className="styled-textarea"
              required
            />
          </div>
      
          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="post-submit-btn">
              <span>🚀 Share Post</span>
            </button>
          </div>
        </form>
      </div>
  
      {/* Posts */}
      {posts.length === 0 ? (
        <p>No posts yet.</p>
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