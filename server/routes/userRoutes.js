import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriendshipStatus,
  unfriend,
  getFriendAndGroupRequests,
} from "../controllers/userController.js";

const router = express.Router();

//Register a new user
router.post("/register", registerUser);

//Login a user
router.post("/login", loginUser);

//Verify email using token
router.get("/verify-email/:token", verifyEmail);

//Get a user's profile by userId
router.get("/profile/:userId", getUserProfile);

//Update user profile by userId
router.put("/profile/:userId", updateUserProfile);

//Search users
router.get("/search", searchUsers);

//Get friend and group join requests for user
router.get("/requests/:userId", getFriendAndGroupRequests);

//Friend request routes
router.post("/friend-request", sendFriendRequest);

//Send friend request to another user
router.post("/accept-friend", acceptFriendRequest);

//Accept friend request
router.post("/reject-friend", rejectFriendRequest);

//Reject friend request
router.get("/friend-requests/:userId", getFriendRequests);

//Get all pending friend requests
router.get("/friendship-status/:userId/:targetUserId", getFriendshipStatus);

//Unfriend a user (remove from friends list)
router.post("/unfriend", unfriend);

export default router;
