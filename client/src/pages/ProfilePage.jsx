import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, BarChart2, Camera, Save, X, Cake, ChefHat } from "lucide-react";
import "./ProfilePage.css";
import axios from "axios";
import FriendButton from "../components/FriendButton";

export default function ProfilePage() {
  const { userId: urlUserId } = useParams(); //Get userId from URL
  const navigate = useNavigate(); //Hook to programmatically navigate
  const currentUserId = localStorage.getItem("userId"); //Get userId from local storage
  const isOwnProfile = !urlUserId || urlUserId === currentUserId; //Check if its the logged in user's profile
  const profileUserId = urlUserId || currentUserId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  //State that holds the edited data
  const [editData, setEditData] = useState({
    username: "",
    about: "",
    cookingRole: "",
    profileImageFile: null,
    backgroundImageFile: null,
    profileImagePreview: "",
    backgroundImagePreview: "",
  });

  //Fetch user data when the page opens or when the profile ID changes
  useEffect(() => {
    fetchUserProfile();
  }, [profileUserId]);

  //Fetch profile data from backend
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token"); //Get user token from local storage

    if (!profileUserId || !token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/auth/profile/${profileUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data);

      //Set data into editing state
      setEditData({
        username: res.data.username || "",
        about: res.data.about || "",
        cookingRole: res.data.cookingRole || "",
        profileImageFile: null,
        backgroundImageFile: null,
        profileImagePreview:
          res.data.profile_image || "/images/default-profile.png",
        backgroundImagePreview:
          res.data.background_image || "/images/default-background.jpg",
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile data");
      setLoading(false);
    }
  };

  //Upload image to Cloudinary
  const handleImageUpload = async (imageFile) => {
    const formData = new FormData(); //Create a FormData object to hold the file and upload preset
    formData.append("file", imageFile);
    formData.append("upload_preset", "ml_default");

    try {
      //Send a POST request to Cloudinary's image upload endpoint
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/djfulsk1f/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      //Parse the JSON response
      const data = await response.json();

      //If the upload fails and no secure_url is returned throw an error
      if (!data.secure_url) {
        throw new Error(data.error?.message || "Upload failed");
      }

      //Return the uploaded image's URL
      return data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload image");
    }
  };

  //Edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  //Cancel editing and reset state
  const handleCancelEdit = () => {
    setEditData({
      username: user.username || "",
      about: user.about || "",
      cookingRole: user.cookingRole || "",
      profileImageFile: null,
      backgroundImageFile: null,
      profileImagePreview: user.profile_image || "/images/default-profile.png",
      backgroundImagePreview:
        user.background_image || "/images/default-background.jpg",
    });
    setIsEditing(false);
  };

  //Save changes to backend
  const handleSaveChanges = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      const updateData = {
        username: editData.username,
        about: editData.about,
        cookingRole: editData.cookingRole,
      };

      //Upload profile image if changed
      if (editData.profileImageFile) {
        updateData.profile_image = await handleImageUpload(
          editData.profileImageFile
        );
      }

      //Upload background image if changed
      if (editData.backgroundImageFile) {
        updateData.background_image = await handleImageUpload(
          editData.backgroundImageFile
        );
      }

      const res = await axios.put(
        `http://localhost:5000/api/auth/profile/${userId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    }
  };

  //Handle profile or background file input
  const handleFileChange = (type, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditData((prev) => ({
        ...prev,
        [`${type}ImageFile`]: file,
        [`${type}ImagePreview`]: previewUrl,
      }));
    }
  };

  //Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/*Background Photo*/}
      <div className="background-photo">
        <img
          src={
            isEditing
              ? editData.backgroundImagePreview
              : user.background_image || "/images/default-background.jpg"
          }
          alt="Background"
        />
        {isEditing && (
          <div className="image-overlay">
            <label htmlFor="background-upload" className="image-upload-btn">
              <Camera size={20} />
              Change Background
            </label>
            <input
              id="background-upload"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange("background", e.target.files[0])
              }
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {/*Action buttons if profile owner*/}
      {isOwnProfile && !isEditing && (
        <div className="profile-buttons">
          <button className="edit-profile-btn" onClick={handleEditClick}>
            <Edit3 size={18} style={{ marginRight: "6px" }} />
            Edit Profile
          </button>

          <button className="graphs-button" onClick={() => navigate("/graphs")}>
            <BarChart2 size={18} style={{ marginRight: "6px" }} />
            My Statistics
          </button>
        </div>
      )}

      {/*Profile Photo and Info*/}
      <div className="profile-info">
        <div className="profile-photo">
          <img
            src={
              isEditing
                ? editData.profileImagePreview
                : user.profile_image || "/images/default-profile.png"
            }
            alt="Profile"
          />
          {isEditing && (
            <div className="profile-image-overlay">
              <label htmlFor="profile-upload" className="profile-upload-btn">
                <Camera size={16} />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile", e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>

        {/*Username and friend button*/}
        <h1 className="profile-name">
          {user.firstName} {user.lastName}
        </h1>
        {isEditing ? (
          <input
            type="text"
            className="edit-username-input"
            value={editData.username}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, username: e.target.value }))
            }
            placeholder="Username"
          />
        ) : (
          <p className="profile-username">@{user.username}</p>
        )}
        {!isOwnProfile && (
          <FriendButton
            targetUserId={profileUserId}
            onStatusChange={(status) => {
              //Refresh user data when friendship status changes
              if (status === "friends") {
                fetchUserProfile();
              }
            }}
          />
        )}

        {/*Cooking Role*/}
        <div className="profile-cooking-role-section">
          {isEditing ? (
            <div className="edit-cooking-role-container">
              <label htmlFor="cookingRole" className="edit-label">
                Cooking Role:
              </label>
              <select
                id="cookingRole"
                value={editData.cookingRole}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    cookingRole: e.target.value,
                  }))
                }
                required
                className="edit-select"
              >
                <option value="Professional Chef">Professional Chef</option>
                <option value="Home Cook">Home Cook</option>
                <option value="Beginner">Beginner</option>
                <option value="Food lover">Food Lover</option>
              </select>
            </div>
          ) : (
            <p className="profile-cooking-role">
              <ChefHat size={20} style={{ marginRight: 8 }}></ChefHat>
              {user.cookingRole}
            </p>
          )}
        </div>

        {/*Birthday*/}
        <p className="profile-birthday">
          <Cake size={22} style={{ marginRight: 8, color: "#f17e0b" }} />
          Birthday: {formatDate(user.birthDate)}
        </p>

        {/*About*/}
        <div className="profile-about-section">
          {isEditing ? (
            <div className="edit-about-container">
              <textarea
                value={editData.about}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, about: e.target.value }))
                }
                className="edit-about-textarea"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
            </div>
          ) : (
            <div className="about-display">
              {user.about ? (
                <p className="profile-about">{user.about}</p>
              ) : (
                <p className="no-about">No about information yet.</p>
              )}
            </div>
          )}
        </div>

        {/*Edit Action Buttons*/}
        {isEditing && (
          <div className="edit-action-buttons">
            <button onClick={handleSaveChanges} className="save-profile-btn">
              <Save size={16} />
              Save Changes
            </button>
            <button onClick={handleCancelEdit} className="cancel-profile-btn">
              <X size={16} />
              Cancel
            </button>
          </div>
        )}

        {/*Profile statistics*/}
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">
              {user.posts?.filter((post) => !post.isGroupPost).length || 0}
            </span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat">
            <span className="stat-number">{user.friends?.length || 0}</span>
            <span className="stat-label">Friends</span>
          </div>
          <div className="stat">
            <span className="stat-number">{user.groups?.length || 0}</span>
            <span className="stat-label">Groups</span>
          </div>
        </div>
      </div>

      {/*Friends & Posts Preview*/}
      <div className="profile-sections">
        {/*Friends*/}
        <div className="friends-section">
          <h2>Friends ({user.friends?.length || 0})</h2>
          {user.friends && user.friends.length > 0 ? (
            <div className="friends-grid">
              {user.friends.slice(0, 6).map((friend) => (
                <div key={friend._id} className="friend-card">
                  <img
                    src={friend.profile_image || "/images/default-profile.png"}
                    alt={friend.username}
                    className="friend-avatar"
                  />
                  <span className="friend-name">
                    {friend.firstName} {friend.lastName}
                  </span>
                </div>
              ))}
              {user.friends.length > 6 && (
                <div className="show-more">+{user.friends.length - 6} more</div>
              )}
            </div>
          ) : (
            <p>No friends yet</p>
          )}
        </div>

        {/*Posts*/}
        <div className="posts-section">
          <h2>
            Recent Posts (
            {user.posts?.filter((post) => !post.isGroupPost).length || 0})
          </h2>
          {user.posts &&
          user.posts.filter((post) => !post.isGroupPost).length > 0 ? (
            <div className="posts-preview">
              {user.posts
                .filter((post) => !post.isGroupPost) //Filter out group posts
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map((post) => (
                  <div key={post._id} className="post-preview">
                    <h4>{post.title}</h4>
                    <p>
                      {post.content
                        ? post.content.substring(0, 100) + "..."
                        : "No content available"}
                    </p>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p>No feed posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}