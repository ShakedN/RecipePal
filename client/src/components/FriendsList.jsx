import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatWindow from "./ChatWindow";

//Provides a button to open chat window with another user
const MessageButton = ({ targetUser, currentUserId }) => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        className="message-btn"
        onClick={() => setShowChat(true)}
        title="Send Message"
      >
        <MessageCircle size={16} />
        Message
      </button>
      
      {showChat && (
        <ChatWindow
          otherUser={targetUser}
          currentUserId={currentUserId}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default MessageButton;