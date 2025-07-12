import express from 'express';
import Group from '../models/Group.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Get user's groups
router.get('/user/:userId', async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { members: req.params.userId },
        { admin: req.params.userId }
      ]
    }).populate('members admin', 'username profile_image');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

// Get suggested groups
router.get('/suggested/:userId', async (req, res) => {
  try {
    const groups = await Group.find({
      members: { $ne: req.params.userId },
      admin: { $ne: req.params.userId }
    }).populate('members admin', 'username profile_image').limit(10);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggested groups' });
  }
});

// Create group
router.post('/', async (req, res) => {
  try {
    const group = new Group({
      ...req.body,
      members: [req.body.admin]
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group' });
  }
});

// Join group
router.post('/:groupId/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group.members.includes(req.body.userId)) {
      group.members.push(req.body.userId);
      await group.save();
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error joining group' });
  }
});

// Get group posts
router.get('/:groupId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.groupId })
      .populate('user', 'username profile_image')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group posts' });
  }
});

// Get feed for user's groups
router.get('/feed/:userId', async (req, res) => {
  try {
    const userGroups = await Group.find({
      $or: [
        { members: req.params.userId },
        { admin: req.params.userId }
      ]
    });
    
    const groupIds = userGroups.map(g => g._id);
    
    const posts = await Post.find({ group: { $in: groupIds } })
      .populate('user', 'username profile_image')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group feed' });
  }
});

export default router;