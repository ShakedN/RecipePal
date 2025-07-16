import Post from "../models/Post.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
//Req- Contains query string
//Res- Returns search results for users and posts
// Enhanced search to include posts and users
export const searchAll = async (req, res) => {
  const { query } = req.query;

  try {
    //Validate search query length
    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    //Enhanced post query to search in both title and content
    const postQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },//Search in title
        { content: { $regex: query, $options: "i" } },//Search in content
      ],
    };
    //User query to search in username, firstName, lastName
    const userQuery = {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
      isVerified: true,//Only show verified users
    };
    //Execute both searches in parallel for better performance
    const [users, posts] = await Promise.all([
      User.find(userQuery)
        .select("username firstName lastName profile_image cookingRole")
        .limit(5)
        .lean(),
      Post.find(postQuery)
        .populate("user", "username profile_image")
        .select(
          "title content user createdAt kindOfPost typeRecipe dietaryPreferences"
        ) 
        .limit(5)
        .lean(),
    ]);
    //Format results with type identifiers
    const formattedUsers = users.map((u) => ({ ...u, type: "user" }));
    const formattedPosts = posts.map((p) => ({ ...p, type: "post" }));
    //Combine results
    const results = [...formattedUsers, ...formattedPosts];

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error searching", error: error.message });
  }
};
//Res- Returns all posts
// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profile_image")//Get post author info
      .populate("likes", "username") //Get usernames of likers
      .populate("comments.user", "username profile_image") //Get comment authors info
      .sort({ createdAt: -1 });//Sort by newest first
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};
//Req- Contains userId
//Res- Returns filtered posts for friends and groups
//Get filtered posts for friends and groups
export const getFilteredPosts = async (req, res) => {
  const { userId } = req.params;
  
  try {
    //Get user with their friends and groups
    const user = await User.findById(userId)
      .populate('friends', '_id')
      .populate('groups', '_id');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Get friend IDs
    const friendIds = user.friends.map(friend => friend._id);
    //Get group IDs
    const groupIds = user.groups.map(group => group._id);

    //Build the query to get posts from:
    //1. User's own posts (non-group posts)
    //2. Friends' posts (non-group posts)
    //3. Posts from groups the user is a member of
    const queryConditions = [
      //User's own non-group posts
      { user: userId, isGroupPost: { $ne: true } }
    ];

    //Add friends' posts if user has friends
    if (friendIds.length > 0) {
      queryConditions.push({ user: { $in: friendIds }, isGroupPost: { $ne: true } });
    }

    //Add group posts if user is in any groups
    if (groupIds.length > 0) {
      queryConditions.push({ group: { $in: groupIds }, isGroupPost: true });
    }
    //Execute query with all conditions
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
//Req-Post data including content, media, and metadata
//Res-reated post with populated user data
//Create a new post
export const createPost = async (req, res) => {
  const {
    userId,
    userName,
     kindOfPost,        //"recipe", "tip", "review", etc.
    typeRecipe,        //"main", "dessert", "appetizer", etc.
    dietaryPreferences, //["vegetarian", "gluten-free", etc.]
    title,
    content,
    image,
    video,
    mediaType, //"image", "video", "canvas"
    canvasData,//For drawing/canvas posts
    isGroupPost,//Boolean: is this a group post?
    group,      //Group ID if it's a group post
  } = req.body;

  try {
    //Build basic post data structure
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
    //Add group information if it's a group post
    if (isGroupPost && group) {
      postData.group = group;
    }
    //Create the post
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
//Req- Contains postId
//Res- Returns a single post by ID with populated user data
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
//Req- Contains postId
//Res- Returns the updated post with like count Like/Unlike a post
//Add a comment to a post (Enhanced version)
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;

  try {
    //Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    //Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //Create new comment object
    const newComment = {
      user: userId,
      content,
      createdAt: new Date(),
    };
    //Add comment to post and save
    post.comments.push(newComment);
    await post.save();

    //Return updated post with populated user information
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
//Req- Contains postId
//Res- Returns the comments for the post
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
//Req- Contains postId, commentId, and userId
//Res- Returns the updated post with the deleted comment
//Delete a comment
export const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    //Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    //Find the specific comment
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    //check if the user is the owner of the post or the owner of the comment
    const isCommentOwner = comment.user.toString() === userId;
    const isPostOwner = post.user.toString() === userId;

    //Check if user is group admin for group posts
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

    //Remove comment and save
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
//Req- Contains postId, commentId, and userId
//Res- Returns the updated post with the edited comment
//Edit a comment
export const editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, content } = req.body;

  try {
    //Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    //Find the specific comment
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
//Req- Contains postId and userId
//Res- Returns a success message if the post was deleted successfully
//Delete a post
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    //Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const isOwner = post.user.toString() === userId; //check if the user is the owner of the post
    let isGroupAdmin = false;
    //Check if user is group admin for group posts
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
//Req- Contains userId
//Res- Returns all posts by the user with populated user info
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
//Req- Contains postId, userId, and post data
//Res- Returns the updated post with populated user info
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
//Req- conains postId,userId
//Res- Returns the updated post with like count
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


