import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UserCheck, X } from "lucide-react";
import "./FriendRequestsPage.css";

export default function FriendRequestsPage() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId"); //Get current user ID from localStorage

  //Fetch friend requests when the page opens
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  //Fetch pending friend requests from the server
  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/auth/friend-requests/${userId}`
      );
      setFriendRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch friend requests:", err);
      setLoading(false);
    }
  };

  //Accept a friend request from a user
  const acceptRequest = async (requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/accept-friend", {
        userId,
        requesterId,
      });
      //Remove accepted request
      setFriendRequests((prev) =>
        prev.filter((req) => req.from._id !== requesterId)
      );
    } catch (err) {
      alert("Failed to accept friend request");
    }
  };

  //Reject a friend request from a user
  const rejectRequest = async (requesterId) => {
    try {
      await axios.post("http://localhost:5000/api/auth/reject-friend", {
        userId,
        requesterId,
      });
      //Remove rejected request
      setFriendRequests((prev) =>
        prev.filter((req) => req.from._id !== requesterId)
      );
    } catch (err) {
      alert("Failed to reject friend request");
    }
  };

  //Show loading state while requests are being fetched
  if (loading) {
    return <div className="friend-requests-page">Loading...</div>;
  }

  return (
    <div className="friend-requests-page">
      <h2>Friend Requests</h2>
      {/*If there are no requests show a message*/}
      {friendRequests.length === 0 ? (
        <p>No friend requests</p>
      ) : (
        <div className="requests-list">
          {friendRequests.map((request) => (
            <div key={request.from._id} className="request-item">
              <img
                src={
                  request.from.profile_image || "/images/default-profile.png"
                }
                alt={request.from.username}
                className="request-avatar"
              />

              {/*User name and username*/}
              <div className="request-info">
                <h4>
                  {request.from.firstName} {request.from.lastName}
                </h4>
                <p>@{request.from.username}</p>
              </div>

              {/*Accept/Reject buttons*/}
              <div className="request-actions">
                <button
                  className="accept-btn"
                  onClick={() => acceptRequest(request.from._id)}
                >
                  <UserCheck size={16} />
                  Accept
                </button>
                <button
                  className="reject-btn"
                  onClick={() => rejectRequest(request.from._id)}
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
