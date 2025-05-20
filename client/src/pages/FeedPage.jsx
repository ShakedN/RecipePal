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
});

  useEffect(() => {
    setPosts([
      {
        _id: "1",
        user: { username: "ShakedN", profile_image: "/images/default-profile.png" },
        title: "🍫✨ Ultimate Moist Chocolate Cake Recipe! ✨🍫",
        content: recipeExContent,
        image: "",
        likes: [],
        comments: [],
        createdAt: new Date(),
      },
    ]);
  }, []);

  // Like handler
  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, likes: [...post.likes, "mockUserId"] }
          : post
      )
    );
  };

  // Comment handler (for now, just alert)
  const handleComment = (postId) => {
    alert("Open comment modal for post: " + postId);
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


  
  const handleNewPostSubmit = async (e) => {
  e.preventDefault();
  const userName = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("You must be logged in to post.");
    return;
  }
  try {
    const res = await axios.post("http://localhost:5000/api/auth/posts", {
      userId,
      userName,
      kindOfPost: newPost.kindOfPost,
      typeRecipe: newPost.typeRecipe,
      dietaryPreferences: newPost.dietaryPreferences,
      title: newPost.title,
      content: newPost.content,
      image: newPost.image,
    });
    setPosts([res.data, ...posts]);
    setNewPost({
      title: "",
      content: "",
      image: "",
      kindOfPost: "",
      typeRecipe: "",
      dietaryPreferences: [],
    });
  } catch (err) {
    alert("Failed to add post: " + (err.response?.data?.error || err.message));
  }
};
  return (
    <div className="feed-content">
      <h1>Your Feed</h1>
      {/* Add Post Form */}
      <div className="post-card" style={{ marginBottom: 32 }}>
    <form onSubmit={handleNewPostSubmit}>
  {/* Kind of Post */}
  <select
    name="kindOfPost"
    value={newPost.kindOfPost}
    onChange={handleNewPostChange}
    required
    style={{ width: "100%", marginBottom: 8 }}
  >
    <option value="">Kind of Post</option>
    <option value="recipe">Recipe</option>
    <option value="shared thoughts">Shared Thoughts</option>
  </select>

  {/* Show only if kindOfPost is recipe */}
  {newPost.kindOfPost === "recipe" && (
    <>
      <select
        name="typeRecipe"
        value={newPost.typeRecipe}
        onChange={handleNewPostChange}
        required
        style={{ width: "100%", marginBottom: 8 }}
      >
        <option value="">Type of Recipe</option>
        <option value="desert">Desert</option>
        <option value="main dish">Main Dish</option>
        <option value="appetize">Appetize</option>
        <option value="side dish">Side Dish</option>
      </select>
      <div style={{ marginBottom: 8 }}>
        Dietary Preferences:
        <label>
          <input
            type="checkbox"
            name="dietaryPreferences"
            value="dairy-free"
            checked={newPost.dietaryPreferences.includes("dairy-free")}
            onChange={handleNewPostChange}
          />
          Dairy-Free
        </label>
        <label>
          <input
            type="checkbox"
            name="dietaryPreferences"
            value="gluten-free"
            checked={newPost.dietaryPreferences.includes("gluten-free")}
            onChange={handleNewPostChange}
          />
          Gluten-Free
        </label>
        <label>
          <input
            type="checkbox"
            name="dietaryPreferences"
            value="vegan"
            checked={newPost.dietaryPreferences.includes("vegan")}
            onChange={handleNewPostChange}
          />
          Vegan
        </label>
        <label>
          <input
            type="checkbox"
            name="dietaryPreferences"
            value="vegeterian"
            checked={newPost.dietaryPreferences.includes("vegeterian")}
            onChange={handleNewPostChange}
          />
          Vegeterian
        </label>
      </div>
    </>
  )}

  {/* Title and Content fields */}
  <input
    type="text"
    name="title"
    placeholder="What's the title?"
    value={newPost.title}
    onChange={handleNewPostChange}
    className="post-title"
    style={{ width: "100%", marginBottom: 8 }}
    required
  />
  <textarea
    name="content"
    placeholder="Share something delicious..."
    value={newPost.content}
    onChange={handleNewPostChange}
    className="post-content"
    style={{ width: "100%", minHeight: 60, marginBottom: 8 }}
    required
  />
  {/* Optional: Add image upload */}
  {/* <input type="file" name="image" /> */}
  <button type="submit" style={{ float: "right", marginTop: 4 }}>
    Post
  </button>
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
          />
        ))
      )}
    </div>
  );
}