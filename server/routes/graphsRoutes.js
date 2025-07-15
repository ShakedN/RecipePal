import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";

const router = express.Router();

//Posts per day route- Returns the number of posts created per day for the past 10 days by the user
router.get("/posts-per-day/:userId", async (req, res) => {
  const userId = req.params.userId;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 10); //10 days back

  const result = await Post.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      //Group by day, month, and year
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 }, //Count posts per day
      },
    },
  ]);

  res.json(result);
});

//Top liked posts route- Returns the top 5 posts (by number of likes) of the user
router.get("/top-liked-posts/:userId", async (req, res) => {
  const userId = req.params.userId;

  //Find all posts by the user
  const posts = await Post.find({ user: userId }).lean();

  //Map posts to title and like Count then sort by likeCount in descending order and take top 5
  const sorted = posts
    .map((post) => ({
      title: post.title,
      likeCount: post.likes.length,
    }))
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 5);

  res.json(sorted);
});

export default router;
