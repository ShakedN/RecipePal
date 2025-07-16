import express from "express";
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
  deleteGroup,
  requestJoinGroup,
  acceptGroupRequest,
  rejectGroupRequest,
  removeMemberFromGroup,
} from "../controllers/groupController.js";

const router = express.Router();

//Create a new group
router.post("/", createGroup);

//Get user's groups (the groups that the user is a group member in)
router.get("/user/:userId", getUserGroups);

//Get suggested groups
router.get("/suggested/:userId", getSuggestedGroups);

//Join a group
router.post("/:groupId/join", joinGroup);

//Request to join a group
router.post("/:groupId/request-join", requestJoinGroup);

//Leave a group
router.post("/:groupId/leave", leaveGroup);

//Get group by ID
router.get("/:groupId", getGroupById);

//Get posts for a specific group (by group ID)
router.get("/:groupId/posts", getGroupPosts);

//Get posts from user's groups
router.get("/feed/:userId", getGroupsFeed);

//Update group
router.put("/:groupId", updateGroup);

//Delete group
router.delete("/:groupId", deleteGroup);

//Remove member from group (admin only)
router.post("/:groupId/remove-member", removeMemberFromGroup);

//Accept a group join request by user for the specific group
router.post("/:groupId/accept-request", acceptGroupRequest);

//Reject a group join request by user for the specific group
router.post("/:groupId/reject-request", rejectGroupRequest);

export default router;
