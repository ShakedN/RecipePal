import React from "react";
import "./JoinGroupPopup.css";

export default function JoinGroupPopup({ group, onJoin, onCancel }) {
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Join Group</h2>
        <div className="group-preview">
          <div className="group-avatar large">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div className="group-details">
            <h4>{group.name}</h4>
            <p>{group.description || "No description available."}</p>
            <div className="group-stats">
              <span>{group.members?.length || 0} members</span>
              <span>Admin: {group.admin?.username || "Unknown"}</span>
            </div>
          </div>
        </div>
        <p className="join-message">
          Would you like to request to join this group? Your request will be sent to the group admin for approval.
        </p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="join-btn" onClick={onJoin}>
            Send Join Request
          </button>
        </div>
      </div>
    </div>
  );
}