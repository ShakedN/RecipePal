import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";

export const registerUser = async (req, res) => {
const {
    username,
    firstName,
    lastName,
    email,
    about,
    cookingRole,
    password,
    phone_number,
    birthDate,
    profile_image,
  } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create a new user
    const user = await User.create({
      username,
      firstName,
      lastName,
      email,
      about,
      cookingRole,
      password: hashedPassword,
      phone_number,
      birthDate,
      profile_image,
      verificationToken,
      isVerified: false,
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your email password
      },
    });

    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    const mailOptions = {
      from: "RecipePal <your-email@gmail.com>",
      to: email,
      subject: "Verify Your Email - RecipePal",
      html: `<p>Hi ${username},</p>
             <p>Thank you for registering on RecipePal. Please verify your email by clicking the link below:</p>
             <a href="${verificationUrl}">Verify Email</a>
             <p>If you did not register, please ignore this email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Registration successful. Please verify your email." });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Remove the token after verification
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1h" });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId)
      .populate("posts")
      .populate("friends", "username profile_image firstName lastName")
      .select("-password -verificationToken"); // Exclude sensitive data
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { about, profile_image, background_image,cookingRole } = req.body;
  
  try {
    const updateData = {};
    
    // Only update fields that are provided
    if (about !== undefined) updateData.about = about;
    if (profile_image) updateData.profile_image = profile_image;
    if (background_image) updateData.background_image = background_image;
    if (cookingRole) updateData.cookingRole = cookingRole;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // Return the updated document
    ).select("-password -verificationToken"); // Exclude sensitive data
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user profile", error: error.message });
  }
};
// Add this function to userController.js
export const searchUsers = async (req, res) => {
  const { query } = req.query;
  
  try {
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { 
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: query,
              options: "i"
            }
          }
        }
      ],
      isVerified: true // Only show verified users
    })
    .select("username firstName lastName profile_image cookingRole")
    .limit(10); // Limit results

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};
// Add friend request
export const sendFriendRequest = async (req, res) => {
  const { fromUserId, toUserId } = req.body;
  
  try {
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are already friends
    if (fromUser.friends.includes(toUserId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already sent
    const existingRequest = toUser.friendRequests.find(
      req => req.from.toString() === fromUserId
    );
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add to recipient's friend requests
    toUser.friendRequests.push({ from: fromUserId });
    
    // Add to sender's sent requests
    fromUser.sentFriendRequests.push({ to: toUserId });

    await toUser.save();
    await fromUser.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending friend request", error: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  const { userId, requesterId } = req.body;
  
  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from friend requests
    user.friendRequests = user.friendRequests.filter(
      req => req.from.toString() !== requesterId
    );

    // Remove from sent requests
    requester.sentFriendRequests = requester.sentFriendRequests.filter(
      req => req.to.toString() !== userId
    );

    // Add to friends list
    user.friends.push(requesterId);
    requester.friends.push(userId);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting friend request", error: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  const { userId, requesterId } = req.body;
  
  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from friend requests
    user.friendRequests = user.friendRequests.filter(
      req => req.from.toString() !== requesterId
    );

    // Remove from sent requests
    requester.sentFriendRequests = requester.sentFriendRequests.filter(
      req => req.to.toString() !== userId
    );

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting friend request", error: error.message });
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId)
      .populate('friendRequests.from', 'username firstName lastName profile_image')
      .select('friendRequests');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friend requests", error: error.message });
  }
};

// Check friendship status
export const getFriendshipStatus = async (req, res) => {
  const { userId, targetUserId } = req.params;
  
  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (user.friends.includes(targetUserId)) {
      return res.status(200).json({ status: "friends" });
    }

    // Check if request sent
    const sentRequest = user.sentFriendRequests.find(
      req => req.to.toString() === targetUserId
    );
    if (sentRequest) {
      return res.status(200).json({ status: "request_sent" });
    }

    // Check if request received
    const receivedRequest = user.friendRequests.find(
      req => req.from.toString() === targetUserId
    );
    if (receivedRequest) {
      return res.status(200).json({ status: "request_received" });
    }

    res.status(200).json({ status: "none" });
  } catch (error) {
    res.status(500).json({ message: "Error checking friendship status", error: error.message });
  }
};
export const unfriend = async (req, res) => {
  const { userId, friendId } = req.body;
  
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are actually friends
    if (!user.friends.includes(friendId) || !friend.friends.includes(userId)) {
      return res.status(400).json({ message: "Users are not friends" });
    }

    // Remove from both users' friends lists
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friendship removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing friendship", error: error.message });
  }
};