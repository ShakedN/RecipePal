import express from "express";
import { registerUser, loginUser, verifyEmail } from "../controllers/userController.js";
import { createPost } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/posts", createPost);

export default router;