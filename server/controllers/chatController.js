import Chat from "../models/Chat.js";
import User from "../models/User.js";

// Get or create a chat between two users
//Req- Contains userId1 and userId2
//Res- Returns the chat object
//If chat exists, returns it; if not, creates a new chat
export const getOrCreateChat = async (req, res) => {
  const { userId1, userId2 } = req.body;
  
  try {
    //Check if both users exist
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);
    
    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }
    
    //Find existing chat between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId1, userId2] }
    })
    .populate("participants", "username firstName lastName profile_image")
    .populate("messages.sender", "username firstName lastName profile_image");

    //If no chat exists, create a new one that is empty
    if (!chat) {
      chat = await Chat.create({
        participants: [userId1, userId2],
        messages: []
      });
      
      //Insert the newly created chat
      chat = await Chat.findById(chat._id)
        .populate("participants", "username firstName lastName profile_image")
        .populate("messages.sender", "username firstName lastName profile_image");
    }
    
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error getting chat", error: error.message });
  }
};
//Req- Contains userId
//Res- Returns all chats for the user
// Get all chats for a user
export const getUserChats = async (req, res) => {
  const { userId } = req.params;
  
  try {
    //Find all chats where the user is a participant
    const chats = await Chat.find({
      participants: userId //MongoDB automatically handles ObjectId matching
    })
    .populate("participants", "username firstName lastName profile_image")
    .populate("messages.sender", "username firstName lastName profile_image")
    .sort({ lastActivity: -1 });//Sort by most recent activity first (newest chats at top)
    //Return the sorted chat list
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};
//req-Contains chatId, senderId, and message content
//res-Updated chat object with the new message
// Send a message
export const sendMessage = async (req, res) => {
  const { chatId, senderId, content } = req.body;
  
  try {
    //Find the chat by ID
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    //Only participants of the chat can send messages
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: "Not authorized to send message" });
    }
    
    //Add the new message to the chat's messages array
    chat.messages.push({
      sender: senderId, //Who sent the message
      content: content,  //The message text
      timestamp: new Date()  //When the message was sent
    });
    //This is used for sorting chats by most recent activity
    chat.lastActivity = new Date();
    await chat.save();
    
    //This ensures the frontend gets complete user information
    const updatedChat = await Chat.findById(chatId)
      .populate("participants", "username firstName lastName profile_image")
      .populate("messages.sender", "username firstName lastName profile_image");
    
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};