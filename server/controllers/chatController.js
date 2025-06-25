import Chat from "../models/Chat.js";
import User from "../models/User.js";

// Get or create a chat between two users
export const getOrCreateChat = async (req, res) => {
  const { userId1, userId2 } = req.body;
  
  try {
    // Check if both users exist
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);
    
    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find existing chat between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId1, userId2] }
    })
    .populate("participants", "username firstName lastName profile_image")
    .populate("messages.sender", "username firstName lastName profile_image");
    
    // If no chat exists, create a new one
    if (!chat) {
      chat = await Chat.create({
        participants: [userId1, userId2],
        messages: []
      });
      
      // Populate the newly created chat
      chat = await Chat.findById(chat._id)
        .populate("participants", "username firstName lastName profile_image")
        .populate("messages.sender", "username firstName lastName profile_image");
    }
    
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error getting chat", error: error.message });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const chats = await Chat.find({
      participants: userId
    })
    .populate("participants", "username firstName lastName profile_image")
    .populate("messages.sender", "username firstName lastName profile_image")
    .sort({ lastActivity: -1 });
    
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { chatId, senderId, content } = req.body;
  
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if sender is a participant
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: "Not authorized to send message" });
    }
    
    // Add message to chat
    chat.messages.push({
      sender: senderId,
      content: content,
      timestamp: new Date()
    });
    
    chat.lastActivity = new Date();
    await chat.save();
    
    // Populate the updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate("participants", "username firstName lastName profile_image")
      .populate("messages.sender", "username firstName lastName profile_image");
    
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};