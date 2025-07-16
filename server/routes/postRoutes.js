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
//router.get("/search", searchAll);

// GET /api/posts - Get all posts
router.get("/", getAllPosts);

// GET /api/posts/filtered/:userId - Get filtered posts for user (friends + groups)
router.get("/filtered/:userId", getFilteredPosts);

// POST /api/posts - Create a new post
router.post("/", createPost);

// GET /api/posts/:id - Get a single post by ID
router.get("/:id", getPostById);

// PUT /api/posts/:postId/like - Like/Unlike a post
router.put("/:postId/like", likePost);

// POST /api/posts/:postId/comment - Add a comment to a post
router.post("/:postId/comment", addComment);

// GET /api/posts/:postId/comments - Get comments for a post
router.get("/:postId/comments", getPostComments);

// PUT /api/posts/:postId/comment/:commentId - Edit a comment
router.put("/:postId/comment/:commentId", editComment);

// DELETE /api/posts/:postId/comment/:commentId - Delete a comment
router.delete("/:postId/comment/:commentId", deleteComment);

// PUT /api/posts/:postId - Edit a post
router.put("/:postId", editPost);

// DELETE /api/posts/:postId - Delete a post- delete only my post
router.delete("/:postId", deletePost);

// GET /api/posts/user/:userId - Get posts by user ID
router.get("/user/:userId", getUserPosts);


export default router;
