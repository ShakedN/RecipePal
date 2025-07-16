import React, { useState } from "react";
import "./CreateGroupModal.css";
import axios from "axios";
//Provides a modal interface for creating new groups
export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
//Handles form submission to create a new group
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupData.name.trim()) {
      alert("Group name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId");
      await axios.post("http://localhost:5000/api/groups", {
        name: groupData.name.trim(),
        description: groupData.description.trim(),
        admin: userId,
      });

      onGroupCreated();
      onClose();
      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      alert(error.response?.data?.message || "Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={groupData.name}
              onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
              placeholder="Enter group name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={groupData.description}
              onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
              placeholder="Enter group description (optional)"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="create-btn"
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}