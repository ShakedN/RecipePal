import Group from "../models/Group.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
//Req- Contains group name, description, and admin user ID
//Res- Returns the created group object
//Create a new group
export const createGroup = async (req, res) => {
  const { name, description, admin } = req.body;

  try {
    //Validate required fields
    if (!name || !admin) {
      return res.status(400).json({
        message: "Group name and admin are required",
      });
    }

    //Check if admin user exists
    const adminUser = await User.findById(admin);
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    //Check if group name already exists
    const existingGroup = await Group.findOne({ name: name.trim() });
    if (existingGroup) {
      return res.status(400).json({
        message: "A group with this name already exists",
      });
    }

    //Create the group
    const group = new Group({
      name: name.trim(),
      description: description?.trim() || "",
      admin,
      members: [admin], //Admin is automatically a member
    });

    await group.save();

    //Add the group to the admin's groups array
    await User.findByIdAndUpdate(admin, {
      $push: { groups: group._id },
    });

    //Insert the group with admin and members info before returning
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username firstName lastName profile_image")
      .populate("members", "username firstName lastName profile_image");

    res.status(201).json({
      message: "Group created successfully",
      group: populatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating group",
      error: error.message,
    });
  }
};
//Req- Contains groupId
//Res- Returns the group object with admin and members populated
//Update the requestJoinGroup function to use pendingRequests
export const requestJoinGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
//Validate user and group exist
  try {
    const user = await User.findById(userId);
    const group = await Group.findById(groupId)
      .populate('admin', 'username firstName lastName profile_image');

    if (!user || !group) {
      return res.status(404).json({ message: "User or group not found" });
    }

    //Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    //Check if request already exists
    if (group.pendingRequests.includes(userId)) {
      return res.status(400).json({ message: "Join request already sent" });
    }

    //Add user to pending requests list
    group.pendingRequests.push(userId);
    await group.save();

    res.status(200).json({ message: "Join request sent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error sending join request",
      error: error.message
    });
  }
};
//Req-ID of the user
//Res- Returns all groups where user is admin or member
//Get user's groups (groups where user is admin or member)
export const getUserGroups = async (req, res) => {
  const { userId } = req.params;

  try {
    const groups = await Group.find({
      $or: [{ members: userId }, { admin: userId }],
    })
      .populate("admin", "username firstName lastName profile_image")
      .populate("members", "username firstName lastName profile_image")
      .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user groups",
      error: error.message,
    });
  }
};

//Req- Contains groupId of group to join,userId  of the user that want to join to the group
//Res- Returns the updated group object with admin and members 
//Join a group
export const joinGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    //Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    //Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({
        message: "User is already a member of this group",
      });
    }

    //Add user to group members
    group.members.push(userId);
    await group.save();

    // Add group to user's groups array
    await User.findByIdAndUpdate(userId, {
      $push: { groups: groupId },
    });

    //Return updated group with populated fields
    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "username firstName lastName profile_image")
      .populate("members", "username firstName lastName profile_image");

    res.status(200).json({
      message: "Successfully joined the group",
      group: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error joining group",
      error: error.message,
    });
  }
};
//Req- gets the userId and GroupId- 
// >The name of the group that the user want to leave 
// >The userId of the user that want to leave the group
//Res- Returns success message
//Leave a group
export const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    //Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    //Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({
        message: "User is not a member of this group",
      });
    }

    //Prevent admin from leaving if they're the only admin
    if (group.admin.toString() === userId && group.members.length > 1) {
      return res.status(400).json({
        message:
          "Admin cannot leave group with other members. Transfer admin rights first.",
      });
    }

    //Remove user from group members
    group.members = group.members.filter((id) => id.toString() !== userId);

    //If admin leaves and no members left, delete the group
    if (group.admin.toString() === userId && group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await User.findByIdAndUpdate(userId, {
        $pull: { groups: groupId },
      });
      return res.status(200).json({ message: "Group deleted successfully" });
    }

    await group.save();

    //Remove group from user's groups array
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: groupId },
    });

    res.status(200).json({ message: "Successfully left the group" });
  } catch (error) {
    res.status(500).json({
      message: "Error leaving group",
      error: error.message,
    });
  }
};
//Req- gets the groupId
//Res- Returns the group object with admin and members populated
//Get group by ID
export const getGroupById = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId)
      .populate("admin", "username firstName lastName profile_image")
      .populate("members", "username firstName lastName profile_image")
      .populate("posts");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching group",
      error: error.message,
    });
  }
};
//Req- Contains groupId
//Res- Returns all posts in the group
//Get posts for a specific group
export const getGroupPosts = async (req, res) => {
  const { groupId } = req.params;

  try {
    const posts = await Post.find({ group: groupId })
      .populate("user", "username firstName lastName profile_image")
      .populate("group", "name")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching group posts",
      error: error.message,
    });
  }
};
//Req- Contains userId
//Res- Returns all posts from groups user is a member of
//Get feed for user's groups (all posts from groups user is a member of)
export const getGroupsFeed = async (req, res) => {
  const { userId } = req.params;

  try {
    //Find all groups where user is a member or admin
    const userGroups = await Group.find({
      $or: [{ members: userId }, { admin: userId }],
    });

    const groupIds = userGroups.map((group) => group._id);

    //Find all posts from these groups
    const posts = await Post.find({ group: { $in: groupIds } })
      .populate("user", "username firstName lastName profile_image")
      .populate("group", "name")
      .populate("comments.user", "username profile_image")
      .populate("likes", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching group feed",
      error: error.message,
    });
  }
};
//Req- Contains groupId,name,description,userId
//Res- Returns the updated group object with admin and members populated
//Update group (admin only)
export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, description, userId } = req.body;

  try {
    //Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    //Check if user is the admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only group admin can update group details",
      });
    }

    //Update fields if provided
    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "username firstName lastName profile_image")
      .populate("members", "username firstName lastName profile_image");

    res.status(200).json({
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating group",
      error: error.message,
    });
  }
};
//Req- Contains groupId and userId
//Res- Returns success message
//Delete group (admin only)
export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    //Check if user is the admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only group admin can delete the group",
      });
    }

    //Remove group from all members' groups arrays
    await User.updateMany(
      { _id: { $in: group.members } },
      { $pull: { groups: groupId } }
    );

    //Delete all posts associated with this group (optional)
    await Post.deleteMany({ group: groupId });

    //Delete the group
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting group",
      error: error.message,
    });
  }
};
//Req- Contains userId
//Res- Returns all groups where user is admin or member 
//Get 3 suggested group for user based on his friend's groups
export const getSuggestedGroups = async (req, res) => {
  const userId = req.params.userId;
  try {
    //Get user with their friends list
    const user = await User.findById(userId).populate("friends");

    const friendsIds = user.friends.map((friend) => friend._id);

    const groupsWithFriends = await Group.find({
      $and: [
        { members: { $in: friendsIds } }, //at least one friend is in the group
        { members: { $ne: userId } }, //user is not in the group members
        { admin: { $ne: userId } }, //user is not the group admin
      ]
    })
    .populate("admin", "username firstName lastName profile_image")
    .populate("members", "username firstName lastName profile_image")
    .limit(3);
//Handle case where no suggestions are found
    if (groupsWithFriends.length === 0) {
      return res
        .status(200)
        .json({ message: "No suggested groups at the moment", groups: [] });
    }



    res.status(200).json({ groups: groupsWithFriends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//Req- Contains groupId and userId
//Res- Returns success message
export const acceptGroupRequest = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    //Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    //Add user to members and remove from pending requests
    group.members.push(userId);
    group.pendingRequests = group.pendingRequests.filter((id) => id.toString() !== userId);
    await group.save();

    // Add group to user's groups array
    await User.findByIdAndUpdate(userId, {
      $push: { groups: groupId },
    });

    res.status(200).json({ message: "User added to group" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting group request", error: error.message });
  }
};
//Req- Contains groupId,userId and userId
//Res- Returns success message
//Reject group join request
export const rejectGroupRequest = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    //Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    //Remove user from pending requests
    group.pendingRequests = group.pendingRequests.filter((id) => id.toString() !== userId);
    await group.save();

    res.status(200).json({ message: "Group join request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting group request", error: error.message });
  }
};
//Req- Contains groupId and userId
//Res- Returns success message
// Remove member from group (admin only)
export const removeMemberFromGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId, memberIdToRemove } = req.body;

  try {
    //Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is the admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    // Check if member exists in the group
    if (!group.members.includes(memberIdToRemove)) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }

    // Don't allow admin to remove themselves
    if (group.admin.toString() === memberIdToRemove) {
      return res.status(400).json({ message: "Admin cannot remove themselves" });
    }

    // Remove member from group
    group.members = group.members.filter(id => id.toString() !== memberIdToRemove);
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(memberIdToRemove, {
      $pull: { groups: groupId }
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing member", error: error.message });
  }
};
