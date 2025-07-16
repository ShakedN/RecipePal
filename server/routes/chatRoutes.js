import express from "express";
import {
  getOrCreateChat,
  getUserChats,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

//Get or create chat between two users
router.post("/get-or-create", getOrCreateChat);

//Get all chats for a user
router.get("/user/:userId", getUserChats);

//Send a message
router.post("/send", sendMessage);

export default router;
