import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UserPlus, UserCheck, Clock, X, UserMinus } from "lucide-react";
import "./FriendButton.css";
//Provides a button to manage friendship status between users
export default function FriendButton({ targetUserId, onStatusChange }) {
  const [friendshipStatus, setFriendshipStatus] = useState("none");
  const [loading, setLoading] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const currentUserId = localStorage.getItem("userId");

  const checkFriendshipStatus = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/friendship-status/${currentUserId}/${targetUserId}`);
      setFriendshipStatus(res.data.status);
    } catch (err) {
      console.error("Failed to check friendship status:", err);
    }
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    checkFriendshipStatus();
  }, [targetUserId, checkFriendshipStatus]);
  //Send a friend request to the target user
  const sendFriendRequest = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/friend-request", {
        fromUserId: currentUserId,
        toUserId: targetUserId
      });
      setFriendshipStatus("request_sent");
      if (onStatusChange) onStatusChange("request_sent");
    } catch (err) {
      alert("Failed to send friend request: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/accept-friend", {
        userId: currentUserId,
        requesterId: targetUserId
      });
      setFriendshipStatus("friends");
      if (onStatusChange) onStatusChange("friends");
    } catch (err) {
      alert("Failed to accept friend request: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reject-friend", {
        userId: currentUserId,
        requesterId: targetUserId
      });
      setFriendshipStatus("none");
      if (onStatusChange) onStatusChange("none");
    } catch (err) {
      alert("Failed to reject friend request: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const unfriend = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/unfriend", {
        userId: currentUserId,
        friendId: targetUserId
      });
      setFriendshipStatus("none");
      setShowUnfriendConfirm(false);
      if (onStatusChange) onStatusChange("none");
    } catch (err) {
      alert("Failed to unfriend: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriendClick = () => {
    setShowUnfriendConfirm(true);
  };

  const cancelUnfriend = () => {
    setShowUnfriendConfirm(false);
  };

  const renderButton = () => {
    switch (friendshipStatus) {
      case "friends":
        return (
          <div className="friend-button-group">
            {!showUnfriendConfirm ? (
              <button className="friend-btn friends" onClick={handleUnfriendClick}>
                <UserCheck size={16} />
                Friends
              </button>
            ) : (
              <div className="unfriend-confirm">
                <p>Remove from friends?</p>
                <div className="unfriend-actions">
                  <button 
                    className="friend-btn unfriend-confirm-btn" 
                    onClick={unfriend}
                    disabled={loading}
                  >
                    <UserMinus size={16} />
                    Unfriend
                  </button>
                  <button 
                    className="friend-btn cancel-unfriend-btn" 
                    onClick={cancelUnfriend}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      case "request_sent":
        return (
          <button className="friend-btn request-sent" disabled>
            <Clock size={16} />
            Request Sent
          </button>
        );
      
      case "request_received":
        return (
          <div className="friend-request-actions">
            <button 
              className="friend-btn accept" 
              onClick={acceptFriendRequest}
              disabled={loading}
            >
              <UserCheck size={16} />
              Accept
            </button>
            <button 
              className="friend-btn reject" 
              onClick={rejectFriendRequest}
              disabled={loading}
            >
              <X size={16} />
              Reject
            </button>
          </div>
        );
      
      default:
        return (
          <button 
            className="friend-btn add-friend" 
            onClick={sendFriendRequest}
            disabled={loading}
          >
            <UserPlus size={16} />
            Add Friend
          </button>
        );
    }
  };

  return <div className="friend-button-container">{renderButton()}</div>;
}