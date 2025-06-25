import express from "express";
import {
  getOrCreateChat,
  getUserChats,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat/get-or-create - Get or create chat between two users
router.post("/get-or-create", getOrCreateChat);

// GET /api/chat/user/:userId - Get all chats for a user
router.get("/user/:userId", getUserChats);

// POST /api/chat/send - Send a message
router.post("/send", sendMessage);

export default router;