import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
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
      enum: ["desert", "main dish", "appetize", "side dish"],
      required: function () {
        return this.kindOfPost === "recipe";
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
      type: String, // URL or file path to the post image
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who liked the post
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model
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
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;