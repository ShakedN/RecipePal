import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import searchRoutes from "./routes/search.js";
import Chat from "./models/Chat.js";
import graphsRoutes from "./routes/graphsRoutes.js";
import groupRoutes from './routes/groupRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app URL
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api/graphs", graphsRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/groups', groupRoutes);

// Socket.IO for real-time messaging
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to their personal room
  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join specific chat room
  socket.on("join-chat", (chatId) => {
    socket.join(`chat-${chatId}`);
    console.log(`User joined chat ${chatId}`);
  });

  // Handle sending messages
  socket.on("send-message", async (data) => {
    try {
      const { chatId, senderId, content } = data;

      // Find and update the chat
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      // Add message to chat
      chat.messages.push({
        sender: senderId,
        content: content,
        timestamp: new Date(),
      });

      chat.lastActivity = new Date();
      await chat.save();

      // Get the populated chat
      const updatedChat = await Chat.findById(chatId)
        .populate("participants", "username firstName lastName profile_image")
        .populate(
          "messages.sender",
          "username firstName lastName profile_image"
        );

      // Emit to all users in the chat room
      io.to(`chat-${chatId}`).emit("new-message", {
        chatId,
        message: updatedChat.messages[updatedChat.messages.length - 1],
        chat: updatedChat,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
