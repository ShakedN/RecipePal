import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import axios from 'axios';
import './GroupsPage.css';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUserGroups();
    fetchSuggestedGroups();
    fetchGroupPosts();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/user/${userId}`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const fetchSuggestedGroups = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/suggested/${userId}`);
      setSuggestedGroups(response.data);
    } catch (error) {
      console.error('Error fetching suggested groups:', error);
    }
  };

  const fetchGroupPosts = async (groupId = null) => {
    try {
      const url = groupId 
        ? `http://localhost:5000/api/groups/${groupId}/posts`
        : `http://localhost:5000/api/groups/feed/${userId}`;
      const response = await axios.get(url);
      setGroupPosts(response.data);
    } catch (error) {
      console.error('Error fetching group posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/join`, { userId });
      fetchUserGroups();
      fetchSuggestedGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

 
  const filteredPosts = groupPosts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'myGroups') return groups.some(g => g._id === post.group?._id);
    return true;
  });
const handleGroupSelect = (group) => {
  // If the same group is already selected, deselect it
  if (selectedGroup && selectedGroup._id === group._id) {
    setSelectedGroup(null);
    fetchGroupPosts(); // Fetch all posts again (without specific group filter)
  } else {
    // Select the new group
    setSelectedGroup(group);
    fetchGroupPosts(group._id);
  }
};
  return (
    <div className="groups-page">
      {/* Sidebar - My Groups */}
      <div className="groups-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">
            <Users size={20} />
            My Groups
          </div>
          {groups.map(group => (
            <div 
              key={group._id} 
              className={`group-item ${selectedGroup?._id === group._id ? 'active' : ''}`}
              onClick={() => handleGroupSelect(group)}
            >
              <div className="group-avatar">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-members">{group.members?.length || 0} members</div>
              </div>
              {group.hasNewPosts && <div className="group-notification"></div>}
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">
            🔥 Trending Groups
          </div>
          {suggestedGroups.slice(0, 3).map(group => (
            <div key={group._id} className="group-item">
              <div className="group-avatar trending">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-members">{group.members?.length || 0} members</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">
            ⚡ Quick Actions
          </div>
          <div className="group-item" onClick={() => setShowCreateGroup(true)}>
            <div className="group-avatar create">
              <Plus size={16} />
            </div>
            <div className="group-info">
              <div className="group-name">Create Group</div>
              <div className="group-members">Start cooking together</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="groups-main-content">
        {/* Feed Filters */}
      <div className="feed-filters">
          {selectedGroup && (
        <div className="selected-group-info">
          <div className="selected-group-name">
            {selectedGroup.name}
          </div>
          <div className="selected-group-description">
            {selectedGroup.description}
          </div>
        </div>
      )}
      </div>

        {/* Group Posts Feed */}
        <div className="groups-feed">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="no-posts">
              <p>No posts in groups yet. Join a group or create your first post!</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post._id} className="group-post">
                <div className="post-header">
                  <img
                    src={post.user?.profile_image || "/images/default-profile.png"}
                    alt="User"
                    className="post-avatar"
                  />
                  <div className="post-user-info">
                    <div className="post-username">{post.user?.username || "Unknown User"}</div>
                    <div className="post-time">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {post.group && (
                    <div className="group-tag">
                      {post.group.name}
                    </div>
                  )}
                </div>

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-description">{post.content}</p>
                </div>

                {post.image && (
                  <div className="post-media">
                    <img src={post.image} alt="Post" className="post-image" />
                  </div>
                )}

                {post.video && (
                  <div className="post-media">
                    <video src={post.video} className="post-video" controls />
                  </div>
                )}

                <div className="post-actions">
                  <button className="post-action">
                    <Heart size={18} />
                    <span>{post.likes?.length || 0} likes</span>
                  </button>
                  <button className="post-action">
                    <MessageCircle size={18} />
                    <span>{post.comments?.length || 0} comments</span>
                  </button>
                  <button className="post-action">
                    <Bookmark size={18} />
                    Save
                  </button>
                  <button className="post-action">
                    <Share size={18} />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar - Suggested Groups */}
      <div className="groups-right-sidebar">
        <div className="widget">
          <div className="widget-title">Suggested Groups</div>
          {suggestedGroups.map(group => (
            <div key={group._id} className="suggested-group">
              <div className="group-avatar suggested">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-members">{group.members?.length || 0} members</div>
              </div>
              <button 
                className="join-btn"
                onClick={() => handleJoinGroup(group._id)}
              >
                Join
              </button>
            </div>
          ))}
        </div>

        <div className="widget">
          <div className="widget-title">Group Activity</div>
          {groups.slice(0, 3).map(group => (
            <div key={group._id} className="activity-item">
              <div className="group-avatar activity">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="activity-info">
                <div className="activity-text">New recipe posted</div>
                <div className="activity-group">in {group.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal 
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={fetchUserGroups}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onGroupCreated }) {
  const [groupData, setGroupData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupData.name.trim()) {
      alert('Group name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:5000/api/groups', {
        name: groupData.name.trim(),
        description: groupData.description.trim(),
        admin: userId
      });
      
      console.log('Group created successfully:', response.data);
      
      // Call the parent function to refresh groups
      onGroupCreated();
      
      // Close the modal
      onClose();
      
      // Optional: Show success message
      alert('Group created successfully!');
      
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.message || 'Failed to create group. Please try again.');
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
              onChange={(e) => setGroupData({...groupData, name: e.target.value})}
              placeholder="Enter group name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={groupData.description}
              onChange={(e) => setGroupData({...groupData, description: e.target.value})}
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
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}