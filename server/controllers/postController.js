import Post from "../models/Post.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

export const searchAll = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    //Enhanced post query to search in both title and content
    const postQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    };

    const userQuery = {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
      isVerified: true,
    };

    const [users, posts] = await Promise.all([
      User.find(userQuery)
        .select("username firstName lastName profile_image cookingRole")
        .limit(5)
        .lean(),
      Post.find(postQuery)
        .populate("user", "username profile_image")
        .select(
          "title content user createdAt kindOfPost typeRecipe dietaryPreferences"
        ) // Added more fields
        .limit(5)
        .lean(),
    ]);

    const formattedUsers = users.map((u) => ({ ...u, type: "user" }));
    const formattedPosts = posts.map((p) => ({ ...p, type: "post" }));

    const results = [...formattedUsers, ...formattedPosts];

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error searching", error: error.message });
  }
};
// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profile_image")
      .populate("likes", "username") //Populate likes with usernames
      .populate("comments.user", "username profile_image") //Populate comment users
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

// Get filtered posts for friends and groups
export const getFilteredPosts = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user with their friends and groups
    const user = await User.findById(userId)
      .populate('friends', '_id')
      .populate('groups', '_id');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get friend IDs
    const friendIds = user.friends.map(friend => friend._id);
    // Get group IDs
    const groupIds = user.groups.map(group => group._id);

    // Build the query to get posts from:
    // 1. User's own posts (non-group posts)
    // 2. Friends' posts (non-group posts)
    // 3. Posts from groups the user is a member of
    const queryConditions = [
      // User's own non-group posts
      { user: userId, isGroupPost: { $ne: true } }
    ];

    // Add friends' posts if user has friends
    if (friendIds.length > 0) {
      queryConditions.push({ user: { $in: friendIds }, isGroupPost: { $ne: true } });
    }

    // Add group posts if user is in any groups
    if (groupIds.length > 0) {
      queryConditions.push({ group: { $in: groupIds }, isGroupPost: true });
    }

    const query = { $or: queryConditions };

    const posts = await Post.find(query)
      .populate("user", "username profile_image")
      .populate("group", "name")
      .populate("likes", "username")
      .populate("comments.user", "username profile_image")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching filtered posts", error: error.message });
  }
};

//Create a new post
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
    video,
    mediaType,
    canvasData,
    isGroupPost,
    group,
  } = req.body;

  try {
    const postData = {
      user: userId,
      userName,
      kindOfPost,
      title,
      content,
      mediaType: mediaType || "image",
      likes: [],
      comments: [],
      isGroupPost: isGroupPost === true, //If its true save as true, if didnt sent or false sent save as false
    };

    //Add media based on type
    if (mediaType === "image" && image) {
      postData.image = image;
    } else if (mediaType === "video" && video) {
      postData.video = video;
    }

    //Add canvas data if provided
    if (canvasData) {
      postData.canvasData = canvasData;
    }

    //Only add recipe-specific fields if it's a recipe post
    if (kindOfPost === "recipe") {
      if (typeRecipe && typeRecipe.trim() !== "") {
        postData.typeRecipe = typeRecipe;
      }
      if (dietaryPreferences && dietaryPreferences.length > 0) {
        postData.dietaryPreferences = dietaryPreferences;
      }
    }

    if (isGroupPost && group) {
      postData.group = group;
    }

    const post = await Post.create(postData);
    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

    //If its a group post save it in the group record too
    if (isGroupPost && group) {
      await Group.findByIdAndUpdate(group, { $push: { posts: post._id } });
    }

    //Return populated post
    const populatedPost = await Post.findById(post._id)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error in createPost:", error);
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

//Get a single post by ID
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
    res
      .status(500)
      .json({ message: "Error fetching post", error: error.message });
  }
};

//Add a comment to a post (Enhanced version)
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

    //Populate the comment with user info before returning
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username");

    res.status(201).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

//Get comments for a specific post
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
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};

//Delete a comment
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

    //check if the user is the owner of the post or the owner of the comment
    const isCommentOwner = comment.user.toString() === userId;
    const isPostOwner = post.user.toString() === userId;

    //Remove the post from the group's posts array
    let isGroupAdmin = false;
    if (post.isGroupPost && post.group) {
      const group = await Group.findById(post.group);
      if (group && group.admin.toString() === userId) {
        isGroupAdmin = true;
      }
    }

    if (!isCommentOwner && !isPostOwner && !isGroupAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    //save and delete
    post.comments.pull(commentId);
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username");

    res.status(200).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

//Edit a comment
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

    //Check if the user is the owner of the comment
    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this comment" });
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
    res
      .status(500)
      .json({ message: "Error editing comment", error: error.message });
  }
};

//Delete a post
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = post.user.toString() === userId; //check if the user is the owner of the post

    let isGroupAdmin = false;

    if (post.isGroupPost && post.group) {
      const group = await Group.findById(post.group);
      isGroupAdmin = group && group.admin.toString() === userId; //check if the user is the admin pf the group
    }

    if (!isOwner && !isGroupAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    //Remove the post from the user's posts array
    await User.findByIdAndUpdate(post.user, { $pull: { posts: postId } });

    //Remove the post from the group's posts array
    if (post.isGroupPost && post.group) {
      await Group.findByIdAndUpdate(post.group, { $pull: { posts: postId } });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

//Get posts by user ID
export const getUserPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ user: userId })
      .populate("user", "username profile_image")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user posts", error: error.message });
  }
};

//Edit a post
export const editPost = async (req, res) => {
  const { postId } = req.params;
  const {
    userId,
    title,
    content,
    image,
    kindOfPost,
    typeRecipe,
    dietaryPreferences,
  } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //Check if the user is the owner of the post
    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    //Update the post fields
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
      { new: true } //Return the updated document
    ).populate("user", "username profile_image");

    res.status(200).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
};
//Like/Unlike a post
export const likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //Get the user to access their username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Check if user already liked the post (by userId)
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      //Unlike the post - remove userId from likes array
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      //Like the post - add userId to likes array
      post.likes.push(userId);
    }

    await post.save();

    //Return the updated post with populated user info
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profile_image")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username"); //Populate likes with usernames
    res.status(200).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error liking post", error: error.message });
  }
};

//Get tho posts of the user's friends and the posts from the groups he is a group member
export const getFeedPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendIds = user.friends; //Friends IDs
    const groupIds = user.groups; //Groups IDs

    const posts = await Post.find({
      $or: [
        { user: { $in: friendIds }, isGroupPost: false },
        { group: { $in: groupIds }, isGroupPost: true },
      ],
    })
      .populate("user", "username profile_image")
      .populate("likes", "username")
      .populate("comments.user", "username profile_image")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feed posts", error });
  }
};
