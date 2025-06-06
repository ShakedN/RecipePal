import express from "express";
import { registerUser, loginUser, verifyEmail, getUserProfile, updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.get("/profile/:userId", getUserProfile);
router.put("/profile/:userId", updateUserProfile); // Add this line

export default router;