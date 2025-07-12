import express from 'express';
import {
  createGroup,
  getUserGroups,
  getSuggestedGroups,
  joinGroup,
  leaveGroup,
  getGroupById,
  getGroupPosts,
  getGroupsFeed,
  updateGroup,
  deleteGroup
} from '../controllers/groupController.js';

const router = express.Router();

// POST /api/groups - Create a new group
router.post('/', createGroup);

// GET /api/groups/user/:userId - Get user's groups
router.get('/user/:userId', getUserGroups);

// GET /api/groups/suggested/:userId - Get suggested groups
router.get('/suggested/:userId', getSuggestedGroups);

// POST /api/groups/:groupId/join - Join a group
router.post('/:groupId/join', joinGroup);

// POST /api/groups/:groupId/leave - Leave a group
router.post('/:groupId/leave', leaveGroup);

// GET /api/groups/:groupId - Get group by ID
router.get('/:groupId', getGroupById);

// GET /api/groups/:groupId/posts - Get posts for a specific group
router.get('/:groupId/posts', getGroupPosts);

// GET /api/groups/feed/:userId - Get feed for user's groups
router.get('/feed/:userId', getGroupsFeed);

// PUT /api/groups/:groupId - Update group (admin only)
router.put('/:groupId', updateGroup);

// DELETE /api/groups/:groupId - Delete group (admin only)
router.delete('/:groupId', deleteGroup);

export default router;