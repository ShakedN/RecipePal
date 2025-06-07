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
  getFriendshipStatus
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.get("/profile/:userId", getUserProfile);
router.put("/profile/:userId", updateUserProfile);
router.get("/search", searchUsers);

// Friend request routes
router.post("/friend-request", sendFriendRequest);
router.post("/accept-friend", acceptFriendRequest);
router.post("/reject-friend", rejectFriendRequest);
router.get("/friend-requests/:userId", getFriendRequests);
router.get("/friendship-status/:userId/:targetUserId", getFriendshipStatus);

export default router;