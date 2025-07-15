import React, { useRef, useState, useEffect } from "react";
import { Image, Video, Edit3, X } from "lucide-react";
import PhotoEditor from "./PhotoEditor";
import VideoEditor from "./VideoEditor";
import axios from "axios";
import "./NewPostForm.css";

const recipeExContent = `Hey #BakersOfRecipePal, ready to level up your **{dessert / dish}** game? ...`; //Template content for recipe


export default function NewPostForm({
  userId,
  username,
  isGroupPost,
  groupId,
  onPostCreated,
  userProfileImage,
}) {

  const fileInputRef = useRef(null);

  // Debug effect to track userProfileImage changes
  useEffect(() => {
    console.log("NewPostForm - userProfileImage prop changed:", userProfileImage);
  }, [userProfileImage]);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    imageFile: null,
    videoFile: null,
    kindOfPost: "",
    typeRecipe: "",
    dietaryPreferences: [],
    mediaType: "image",
    canvasData: null,
    isGroupPost: null,
    group: null,
  });

  const [isEdited, setIsEdited] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showMediaActions, setShowMediaActions] = useState(false);
  const [showTemplateRecipe, setShowTemplateRecipe] = useState(false);

  const handleNewPostChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNewPost((prev) => ({
        ...prev,
        dietaryPreferences: checked
          ? [...prev.dietaryPreferences, value]
          : prev.dietaryPreferences.filter((pref) => pref !== value),
      }));
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
      if (
        name === "content" &&
        value !== recipeExContent &&
        showTemplateRecipe
      ) {
        setShowTemplateRecipe(false);
      }
    }
  };

  const handleMediaUpload = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    const url =
      type === "image"
        ? "https://api.cloudinary.com/v1_1/djfulsk1f/image/upload"
        : "https://api.cloudinary.com/v1_1/djfulsk1f/video/upload";
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url)
      throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const handleEditMedia = (file, type) => {
    const url = URL.createObjectURL(file);
    setEditingMedia({ url, type, file });
    if (type === "image") setShowPhotoEditor(true);
    else setShowVideoEditor(true);
  };

  const handleSaveEdit = async (editData) => {
    try {
      let finalUrl = "";

      if (editingMedia.type === "video") {
        const blob = editData.blob;
        finalUrl = await handleMediaUpload(blob, "video");
      } else {
        finalUrl = await handleMediaUpload(editData.blob, "image");
      }

      setNewPost((prev) => ({
        ...prev,
        canvasData: {
          originalUrl: editingMedia.url,
          editedUrl: finalUrl,
          ...(editingMedia.type === "video"
            ? {
                trimData: {
                  trimStart: editData.trimStart,
                  trimEnd: editData.trimEnd,
                },
                editType: "video-trim",
              }
            : { filters: editData.filters || {}, editType: "image" }),
        },
      }));

      setIsEdited(true);
      setShowPhotoEditor(false);
      setShowVideoEditor(false);
      setEditingMedia(null);
      setShowMediaActions(false);
    } catch (err) {
      alert("Failed to save edit: " + err.message);
    }
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "",
        videoUrl = "";

      if (newPost.mediaType === "image" && newPost.imageFile) {
        imageUrl =
          isEdited && newPost.canvasData?.editedUrl
            ? newPost.canvasData.editedUrl
            : await handleMediaUpload(newPost.imageFile, "image");
      }

      if (newPost.mediaType === "video" && newPost.videoFile) {
        videoUrl =
          isEdited && newPost.canvasData?.editedUrl
            ? newPost.canvasData.editedUrl
            : await handleMediaUpload(newPost.videoFile, "video");
      }

      const postPayload = {
        userId,
        userName: username,
        kindOfPost: newPost.kindOfPost,
        title: newPost.title,
        content: newPost.content,
        mediaType: newPost.mediaType,
        image: imageUrl,
        video: videoUrl,
        canvasData: newPost.canvasData,
        dietaryPreferences: newPost.dietaryPreferences,
        typeRecipe: newPost.typeRecipe,
        isGroupPost: isGroupPost === true, //If its true save as true, if didnt sent or false sent save as false
        group: groupId,
      };

      await axios.post("http://localhost:5000/api/posts", postPayload);
      if (onPostCreated) onPostCreated();

      // Reset form
      setNewPost({
        title: "",
        content: "",
        imageFile: null,
        videoFile: null,
        kindOfPost: "",
        typeRecipe: "",
        dietaryPreferences: [],
        mediaType: "image",
        canvasData: null,
        isGroupPost: null,
        group: null,
      });
      setIsEdited(false);
      setShowTemplateRecipe(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Failed to post: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelEdit = () => {
    setShowPhotoEditor(false);
    setShowVideoEditor(false);
    setEditingMedia(null);
  };

  const handleShowMediaActions = () => {
    setShowMediaActions(true);
  };

  const handleHideMediaActions = () => {
    setShowMediaActions(false);
  };

  const handleTemplateRecipe = () => {
    if (showTemplateRecipe) {
      setNewPost({ ...newPost, content: "" });
      setShowTemplateRecipe(false);
    } else {
      setNewPost({ ...newPost, content: recipeExContent });
      setShowTemplateRecipe(true);
    }
  };

  return (
    <div>
      {/* MODERN NEW POST FORM */}
      <div className="new-post-container">
        <div className="new-post-header">
          <img
            src={userProfileImage || "/images/default-profile.png"}
            alt="Your Profile"
            className="new-post-avatar"
            onError={(e) => {
              e.target.src = "/images/default-profile.png";
            }}
          />
          <div className="new-post-greeting">
            <span>What's cooking, {username}?</span>
          </div>
        </div>

        <form onSubmit={handleNewPostSubmit} className="new-post-form-modern">
          <div className="new-post-layout-grid">
            {/*Column 1: Media Upload and Preview */}
            <div className="media-column">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const fileType = file.type.startsWith("video")
                      ? "video"
                      : "image";
                    setNewPost({
                      ...newPost,
                      mediaType: fileType,
                      imageFile: fileType === "image" ? file : null,
                      videoFile: fileType === "video" ? file : null,
                    });
                    setIsEdited(false);
                    setEditingMedia(null);
                    setShowMediaActions(false);
                  }
                }}
                className="media-input"
                ref={fileInputRef}
              />
              {!newPost.imageFile && !newPost.videoFile ? (
                <div
                  className="media-upload-zone"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Image size={48} strokeWidth={1.5} />
                  <Video size={48} strokeWidth={1.5} />
                  <p>
                    <strong>Click to upload</strong> or drag and drop a photo or
                    video.
                  </p>
                  <span className="upload-hint">
                    High-quality visuals get more likes!
                  </span>
                </div>
              ) : (
                <div className="media-preview-container">
                  {newPost.imageFile && (
                    <img
                      src={URL.createObjectURL(newPost.imageFile)}
                      alt="Preview"
                      className="media-preview"
                    />
                  )}
                  {newPost.videoFile && (
                    <video
                      src={URL.createObjectURL(newPost.videoFile)}
                      className="media-preview"
                      controls
                    />
                  )}

                  {!showMediaActions && (
                    <div
                      className="media-actions-trigger"
                      onClick={handleShowMediaActions}
                    >
                      <div className="actions-trigger-btn">
                        <Edit3 size={16} />
                        <span>Edit Media</span>
                      </div>
                    </div>
                  )}

                  {showMediaActions && (
                    <div className="media-actions-overlay active">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditMedia(
                            newPost.imageFile || newPost.videoFile,
                            newPost.mediaType
                          )
                        }
                        className="media-action-btn"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewPost({
                            ...newPost,
                            imageFile: null,
                            videoFile: null,
                          });
                          fileInputRef.current.value = "";
                          setShowMediaActions(false);
                        }}
                        className="media-action-btn remove"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleHideMediaActions}
                        className="media-action-btn exit"
                      >
                        <X size={16} /> Done
                      </button>
                    </div>
                  )}

                  {isEdited && <div className="edited-badge">Edited</div>}
                </div>
              )}
            </div>

            {/* Column 2: Form Details */}
            <div className="form-column">
              <div className="form-section">
                <label className="form-label">What are you sharing?</label>
                <select
                  name="kindOfPost"
                  value={newPost.kindOfPost}
                  onChange={handleNewPostChange}
                  required
                  className="styled-select"
                >
                  <option value="">Choose post type...</option>
                  <option value="recipe">🍳 Recipe</option>
                  <option value="shared thoughts">💭 Shared Thoughts</option>
                </select>
              </div>
              <div className="form-section">
                <input
                  type="text"
                  name="title"
                  placeholder="Give your recipe a catchy title..."
                  value={newPost.title}
                  onChange={handleNewPostChange}
                  className="styled-input title-input"
                  required
                />
              </div>
              {newPost.kindOfPost === "recipe" && (
                <div className="recipe-details">
                  <div className="form-section-inline">
                    <div className="form-section">
                      <label className="form-label">Category</label>
                      <select
                        name="typeRecipe"
                        value={newPost.typeRecipe}
                        onChange={handleNewPostChange}
                        required
                        className="styled-select"
                      >
                        <option value="">Select...</option>
                        <option value="desert">Dessert</option>
                        <option value="main dish">Main Dish</option>
                        <option value="appetize">Appetizer</option>
                        <option value="side dish">Side Dish</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-section">
                    <label className="form-label">Dietary Tags</label>
                    <div className="dietary-preferences">
                      {[
                        { value: "dairy-free", label: "Dairy-Free" },
                        { value: "gluten-free", label: "Gluten-Free" },
                        { value: "vegan", label: "Vegan" },
                        { value: "vegeterian", label: "Vegetarian" },
                      ].map((pref) => (
                        <label key={pref.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            name="dietaryPreferences"
                            value={pref.value}
                            checked={newPost.dietaryPreferences.includes(
                              pref.value
                            )}
                            onChange={handleNewPostChange}
                            className="styled-checkbox"
                          />
                          <span className="checkbox-text">{pref.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <div className="textarea-header">
                  <label className="form-label">Recipe & Instructions</label>
                  <button
                    type="button"
                    className={`template-button ${
                      showTemplateRecipe ? "active" : ""
                    }`}
                    onClick={handleTemplateRecipe}
                  >
                    {showTemplateRecipe
                      ? "✕ Remove Template"
                      : "📝 Use Template"}
                  </button>
                </div>
                <textarea
                  name="content"
                  placeholder="Share your story, ingredients, and step-by-step instructions..."
                  value={newPost.content}
                  onChange={handleNewPostChange}
                  className="styled-textarea"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="submit" className="post-submit-btn">
              <span>Share Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}