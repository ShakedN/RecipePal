import React, { useRef, useState, useEffect } from "react";
import { Image, Video, Edit3, X } from "lucide-react";
import axios from "axios";
import "./NewPostForm.css";
import recipeExContent from "../pages/recipeExampleContent"; // Importing the example content for recipe posts


//Handles post creation for both individual and group posts with media support and recipe templates
export default function NewPostForm({
  userId,
  username,
  isGroupPost,
  groupId,
  onPostCreated,
  userProfileImage,
}) {

  const fileInputRef = useRef(null);

  //Debug effect to track userProfileImage changes for troubleshooting
  useEffect(() => {
    console.log("NewPostForm - userProfileImage prop changed:", userProfileImage);
  }, [userProfileImage]);

  const [newPost, setNewPost] = useState({
    title: "",                    //Post title
    content: "",                  //Post content/description
    imageFile: null,              //Selected image file
    videoFile: null,              //Selected video file
    kindOfPost: "",               //Type of post (recipe/shared thoughts)
    typeRecipe: "",               //Recipe category (dessert/main dish/etc)
    dietaryPreferences: [],       //Array of dietary tags
    mediaType: "image",           //Current media type being uploaded
    canvasData: null,             //Edited media data from editors
    isGroupPost: null,            //Whether this is a group post
    group: null,                  //Group ID if applicable
  });

  const [isEdited, setIsEdited] = useState(false);                    //Track if media has been edited
  const [editingMedia, setEditingMedia] = useState(null);             //Currently editing media object
  const [showMediaActions, setShowMediaActions] = useState(false);    //Media action buttons visibility
  const [showTemplateRecipe, setShowTemplateRecipe] = useState(false); //Recipe template toggle state

  
  const handleNewPostChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    //Handle checkbox inputs for dietary preferences array
    if (type === "checkbox") {
      setNewPost((prev) => ({
        ...prev,
        dietaryPreferences: checked
          ? [...prev.dietaryPreferences, value]      //Add preference if checked
          : prev.dietaryPreferences.filter((pref) => pref !== value), //Remove if unchecked
      }));
    } else {
      setNewPost((prev) => ({ ...prev, [name]: value }));
      
      //Hide template when user starts typing custom content
      if (
        name === "content" &&
        value !== recipeExContent &&
        showTemplateRecipe
      ) {
        setShowTemplateRecipe(false);
      }
    }
  };

  //Uploads media files to Cloudinary cloud storage
  //Returns - Secure URL of uploaded media
  const handleMediaUpload = async (file, type) => {
    //Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    
    //Select appropriate Cloudinary endpoint based on media type
    const url =
      type === "image"
        ? "https://api.cloudinary.com/v1_1/djfulsk1f/image/upload"
        : "https://api.cloudinary.com/v1_1/djfulsk1f/video/upload";
    
    //Upload to Cloudinary
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    
    //Validate upload success
    if (!data.secure_url)
      throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  //Prepares media file for editing by creating object URL and opening appropriate editor
  const handleEditMedia = (file, type) => {
    const url = URL.createObjectURL(file);
    setEditingMedia({ url, type, file });
    
    //Open appropriate editor based on media type
    // TODO: Implement photo and video editors
    console.log(`Opening ${type} editor for file:`, file);
  };

  //Saves edited media data and uploads processed media to Cloudinary
  //Updates post state with edited media URL and canvas data
  const handleSaveEdit = async (editData) => {
    try {
      let finalUrl = "";

      //Handle video editing (trimming)
      if (editingMedia.type === "video") {
        const blob = editData.blob;
        finalUrl = await handleMediaUpload(blob, "video");
      } else {
        //Handle image editing (filters, cropping, etc.)
        finalUrl = await handleMediaUpload(editData.blob, "image");
      }

      //Update post state with edited media information
      setNewPost((prev) => ({
        ...prev,
        canvasData: {
          originalUrl: editingMedia.url,
          editedUrl: finalUrl,
          //Add video-specific trim data or image filter data
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

      //Reset editing state
      setIsEdited(true);
      setEditingMedia(null);
      setShowMediaActions(false);
    } catch (err) {
      alert("Failed to save edit: " + err.message);
    }
  };

  //Handles form submission and creates new post in database
  //Uploads media, constructs post payload, and sends to backend API
  const handleNewPostSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "",
        videoUrl = "";

      //Upload image if present (use edited version if available)
      if (newPost.mediaType === "image" && newPost.imageFile) {
        imageUrl =
          isEdited && newPost.canvasData?.editedUrl
            ? newPost.canvasData.editedUrl
            : await handleMediaUpload(newPost.imageFile, "image");
      }

      //Upload video if present (use edited version if available)
      if (newPost.mediaType === "video" && newPost.videoFile) {
        videoUrl =
          isEdited && newPost.canvasData?.editedUrl
            ? newPost.canvasData.editedUrl
            : await handleMediaUpload(newPost.videoFile, "video");
      }

      //Construct post payload for backend API
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

      //Send post to backend API
      await axios.post("http://localhost:5000/api/posts", postPayload);
      
      // Notify parent component of successful post creation
      if (onPostCreated) onPostCreated();

      //Reset form to initial state
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

  //Shows media action buttons overlay
  const handleShowMediaActions = () => {
    setShowMediaActions(true);
  };

  //Hides media action buttons overlay
  const handleHideMediaActions = () => {
    setShowMediaActions(false);
  };

  const handleTemplateRecipe = () => {
    if (showTemplateRecipe) {
      //Remove template content
      setNewPost({ ...newPost, content: "" });
      setShowTemplateRecipe(false);
    } else {
      //Load template content
      setNewPost({ ...newPost, content: recipeExContent });
      setShowTemplateRecipe(true);
    }
  };

  return (
    <div>
      {/* MODERN NEW POST FORM - Complete post creation interface */}
      <div className="new-post-container">
        {/* Header section with user profile and greeting */}
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

        {/* Main form with grid layout for media and form sections */}
        <form onSubmit={handleNewPostSubmit} className="new-post-form-modern">
          <div className="new-post-layout-grid">
            {/* Column 1: Media Upload and Preview Section */}
            <div className="media-column">
              {/* Hidden file input for media selection */}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Determine media type and update state
                    const fileType = file.type.startsWith("video")
                      ? "video"
                      : "image";
                    setNewPost({
                      ...newPost,
                      mediaType: fileType,
                      imageFile: fileType === "image" ? file : null,
                      videoFile: fileType === "video" ? file : null,
                    });
                    // Reset editing state for new file
                    setIsEdited(false);
                    setEditingMedia(null);
                    setShowMediaActions(false);
                  }
                }}
                className="media-input"
                ref={fileInputRef}
              />
              
              {/* Media upload zone - shown when no media selected */}
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
                // Media preview section - shown when media is selected
                <div className="media-preview-container">
                  {/* Image preview */}
                  {newPost.imageFile && (
                    <img
                      src={URL.createObjectURL(newPost.imageFile)}
                      alt="Preview"
                      className="media-preview"
                    />
                  )}
                  
                  {/* Video preview with controls */}
                  {newPost.videoFile && (
                    <video
                      src={URL.createObjectURL(newPost.videoFile)}
                      className="media-preview"
                      controls
                    />
                  )}

                  {/* Edit media trigger button */}
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

                  {/* Media action buttons overlay */}
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
                          // Remove current media and reset file input
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

                  {/* Edited badge indicator */}
                  {isEdited && <div className="edited-badge">Edited</div>}
                </div>
              )}
            </div>

            {/* Column 2: Form Details and Content */}
            <div className="form-column">
              {/* Post type selection */}
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
              
              {/* Post title input */}
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
              
              {/* Recipe-specific fields - only shown when recipe type is selected */}
              {newPost.kindOfPost === "recipe" && (
                <div className="recipe-details">
                  {/* Recipe category selection */}
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
                  
                  {/* Dietary preferences checkboxes */}
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

              {/* Content textarea with template button */}
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

          {/* Form submission button */}
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