import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
const router = express.Router();

router.post('/advanced', async (req, res) => {
  try {
    const { type, query, filters } = req.body;
    
    if (type === 'posts') {
      const results = await searchPosts(query, filters);
      res.json({ success: true, results, type: 'posts' });
    } else if (type === 'users') {
      const results = await searchUsers(query, filters);
      res.json({ success: true, results, type: 'users' });
    } else if (type === 'groups') {
      const results = await searchGroups(query, filters);
      res.json({ success: true, results, type: 'groups' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid search type' });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }

});
// Search groups function
async function searchGroups(query, filters) {
  const searchConditions = {};
  
  // Text search in name and description
  if (query) {
    searchConditions.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }
  
  // Apply filters
  if (filters.name) {
    searchConditions.name = { $regex: filters.name, $options: 'i' };
  }
  
  if (filters.description) {
    searchConditions.description = { $regex: filters.description, $options: 'i' };
  }
  
  const groups = await Group.find(searchConditions)
    .populate('admin', 'username firstName lastName profile_image')
    .populate('members', 'username firstName lastName profile_image')
    .select('name description admin members createdAt')
    .sort({ createdAt: -1 })
    .limit(50);
  
  return groups.map(group => ({
    ...group.toObject(),
    type: 'group'
  }));
}
// Search posts function
async function searchPosts(query, filters) {
  const searchConditions = {};
  
  // Text search in title and content
  if (query) {
    searchConditions.$or = [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } }
    ];
  }
  
  // Apply filters
  if (filters.title) {
    searchConditions.title = { $regex: filters.title, $options: 'i' };
  }
  
  if (filters.kindOfPost) {
    searchConditions.kindOfPost = filters.kindOfPost;
  }
  
  if (filters.typeRecipe) {
    searchConditions.typeRecipe = filters.typeRecipe;
  }
  
  if (filters.dietaryPreferences && filters.dietaryPreferences.length > 0) {
    searchConditions.dietaryPreferences = { 
      $in: filters.dietaryPreferences 
    };
  }
  
  const posts = await Post.find(searchConditions)
    .populate('user', 'username firstName lastName profile_image')
    .populate('likes', 'username')
    .sort({ createdAt: -1 })
    .limit(50);
  
  return posts.map(post => ({
    ...post.toObject(),
    type: 'post'
  }));
}

// Search users function
async function searchUsers(query, filters) {
  const searchConditions = {};
  
  // Text search in username, firstName, lastName
  if (query) {
    searchConditions.$or = [
      { username: { $regex: query, $options: 'i' } },
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } }
    ];
  }
  
  // Apply filters
  if (filters.username) {
    searchConditions.username = { $regex: filters.username, $options: 'i' };
  }
  
  if (filters.cookingRole) {
    searchConditions.cookingRole = { $regex: filters.cookingRole, $options: 'i' };
  }
  
  if (filters.group) {
    searchConditions.group = { $regex: filters.group, $options: 'i' };
  }
  
  if (filters.name) {
    searchConditions.$or = [
      { firstName: { $regex: filters.name, $options: 'i' } },
      { lastName: { $regex: filters.name, $options: 'i' } },
      { 
        $expr: {
          $regexMatch: {
            input: { $concat: ['$firstName', ' ', '$lastName'] },
            regex: filters.name,
            options: 'i'
          }
        }
      }
    ];
  }
  
  // Only return verified users
  searchConditions.isVerified = true;
  
  const users = await User.find(searchConditions)
    .populate('friends', 'username firstName lastName profile_image')
    .populate('groups', 'name description')
    .select('-password -verificationToken')
    .sort({ createdAt: -1 })
    .limit(50);
  
  return users.map(user => ({
    ...user.toObject(),
    type: 'user'
  }));
}

// Quick search endpoint (for navbar search)
router.get('/quick', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }

    // Search both posts and users simultaneously
    const [posts, users] = await Promise.all([
      Post.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('user', 'username firstName lastName profile_image')
      .select('title user createdAt kindOfPost typeRecipe dietaryPreferences')
      .sort({ createdAt: -1 })
      .limit(5),
      
      User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ],
        isVerified: true
      })
      .select('username firstName lastName profile_image cookingRole')
      .sort({ createdAt: -1 })
      .limit(5)
    ]);

    const formattedPosts = posts.map(post => ({ ...post.toObject(), type: 'post' }));
    const formattedUsers = users.map(user => ({ ...user.toObject(), type: 'user' }));
    
    const results = [...formattedUsers, ...formattedPosts];
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

export default router;