import express from "express";
import {
  getAllPosts,
  createPost,
  getPostById,
  likePost,
  addComment,
  getPostComments,
  deleteComment,
  editComment,
  deletePost,
  editPost,
  getUserPosts,
  getFilteredPosts,
} from "../controllers/postController.js";

const router = express.Router();

//Get all posts
router.get("/", getAllPosts);

//Get filtered posts for user (posts of user's friends and user's groups)
router.get("/filtered/:userId", getFilteredPosts);

//Create a new post
router.post("/", createPost);

//Get a post by ID
router.get("/:id", getPostById);

//Like/Unlike a post
router.put("/:postId/like", likePost);

//Add a comment to a post
router.post("/:postId/comment", addComment);

//Get comments for a post
router.get("/:postId/comments", getPostComments);

//Edit a comment
router.put("/:postId/comment/:commentId", editComment);

//Delete a comment (only for user's own posts and group admin)
router.delete("/:postId/comment/:commentId", deleteComment);

//Edit a post
router.put("/:postId", editPost);

//Delete a post (only for user's own posts and group admin)
router.delete("/:postId", deletePost);

//Get posts by user ID
router.get("/user/:userId", getUserPosts);

export default router;
