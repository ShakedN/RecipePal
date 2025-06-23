import Post from "../models/Post.js";
import User from "../models/User.js";

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profile_image")
      .populate("likes", "username") // Populate likes with usernames
      .populate("comments.user", "username profile_image") // Populate comment users
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  const {
    userId,
    userName,
    kindOfPost,
    typeRecipe,
    dietaryPreferences,
    title,
    content,
    image,
  } = req.body;
  try {
    const postData = {
      user: userId,
      userName,
      kindOfPost,
      title,
      content,
      image,
      likes: [],
      comments: [],
    };

    // Only add recipe-specific fields if it's a recipe post and they have values
    if (kindOfPost === "recipe") {
      if (typeRecipe && typeRecipe.trim() !== "") {
        postData.typeRecipe = typeRecipe;
      }
      if (dietaryPreferences && dietaryPreferences.length > 0) {
        postData.dietaryPreferences = dietaryPreferences;
      }
    }

    const post = await Post.create(postData);

    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image");
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};


// Add a comment to a post (Enhanced version)
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const newComment = {
      user: userId,
      content,
      createdAt: new Date(),
    };
    
    post.comments.push(newComment);
    await post.save();
    
    // Populate the comment with user info before returning
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username");
    
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

// Get comments for a specific post
export const getPostComments = async (req, res) => {
  const { postId } = req.params;
  
  try {
    const post = await Post.findById(postId)
      .populate("comments.user", "username profile_image")
      .select("comments");
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user is the owner of the comment or the post
    if (comment.user.toString() !== userId && post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    
    post.comments.pull(commentId);
    await post.save();
    
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username");
    
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

// Edit a comment
export const editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, content } = req.body;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user is the owner of the comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }
    
    comment.content = content;
    comment.updatedAt = new Date();
    await post.save();
    
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username");
    
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error editing comment", error: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user is the owner of the post
    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    
    await Post.findByIdAndDelete(postId);
    
    // Remove the post from the user's posts array
    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
    
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};

// Get posts by user ID
export const getUserPosts = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const posts = await Post.find({ user: userId })
      .populate("user", "username profile_image")
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user posts", error: error.message });
  }
};
// Edit a post
export const editPost = async (req, res) => {
  const { postId } = req.params;
  const { userId, title, content, image, kindOfPost, typeRecipe, dietaryPreferences } = req.body;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user is the owner of the post
    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }
    
    // Update the post fields
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        content,
        image,
        kindOfPost,
        typeRecipe,
        dietaryPreferences,
      },
      { new: true } // Return the updated document
    ).populate("user", "username profile_image");
    
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};
// Like/Unlike a post
export const likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get the user to access their username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already liked the post (by userId)
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Unlike the post - remove userId from likes array
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like the post - add userId to likes array
      post.likes.push(userId);
    }
    
    await post.save();
    
    // Return the updated post with populated user info
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username"); // Populate likes with usernames
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error liking post", error: error.message });
  }
};