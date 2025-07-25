import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Reference to the User model
      required: true,
    },
    userName: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    kindOfPost: {
      type: String,
      enum: ["recipe", "shared thoughts"],
      required: true,
    },
    typeRecipe: {
      type: String,
      enum: ["desert", "main dish", "appetize", "side dish", ""],
      default: "",
      required: function () {
        if (this.kindOfPost != "recipe") {
          return false; //typeRecipe is not required for non-recipe posts
        }
        return true; //typeRecipe is required for recipe posts
      },
    },
    dietaryPreferences: [
      {
        type: String,
        enum: ["dairy-free", "gluten-free", "vegan", "vegeterian"],
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    video: {
      type: String, //URL or path to the video file
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "canvas"],
      default: "image",
    },
    canvasData: {
      originalUrl: String, //Original image/video URL
      editedUrl: String, //Final edited result

      filters: {
        brightness: { type: Number, default: 100 },
        contrast: { type: Number, default: 100 },
        saturation: { type: Number, default: 100 },
        blur: { type: Number, default: 0 },
        sepia: { type: Number, default: 0 },
        grayscale: { type: Number, default: 0 },
      },
    },
    isGroupPost: {
      type: Boolean,
      default: false,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", //Reference to the Group model
      required: function () {
        return this.isGroupPost;
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //Users who liked the post
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", //Reference to the User model
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
