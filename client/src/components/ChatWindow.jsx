import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Send, X } from "lucide-react";
import "./ChatWindow.css";

const socket = io("http://localhost:5000");

export default function ChatWindow({ otherUser, onClose, currentUserId }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUserId && otherUser._id) {
      initializeChat();
    }
  }, [currentUserId, otherUser._id]);

  useEffect(() => {
    // Join user's personal room
    socket.emit('join-user', currentUserId);

    // Listen for new messages
    socket.on('new-message', (data) => {
      if (data.chatId === chat?._id) {
        setMessages(prev => [...prev, data.message]);
        setChat(data.chat);
      }
    });

    return () => {
      socket.off('new-message');
    };
  }, [chat?._id, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/chat/get-or-create", {
        userId1: currentUserId,
        userId2: otherUser._id
      });
      
      setChat(res.data);
      setMessages(res.data.messages || []);
      
      // Join the specific chat room
      socket.emit('join-chat', res.data._id);
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    try {
      // Emit message via socket for real-time delivery
      socket.emit('send-message', {
        chatId: chat._id,
        senderId: currentUserId,
        content: newMessage.trim()
      });

      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <span>Loading chat...</span>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={otherUser.profile_image || "/images/default-profile.png"}
          alt={otherUser.username}
          className="chat-avatar"
        />
        <div className="chat-user-info">
          <h4>{otherUser.firstName} {otherUser.lastName}</h4>
          <span>@{otherUser.username}</span>
        </div>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`message ${message.sender._id === currentUserId ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
        />
        <button onClick={sendMessage} disabled={!newMessage.trim()}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}