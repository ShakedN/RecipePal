import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { username, email, password, phone_number, profile_image } = req.body;

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
      email,
      password: hashedPassword,
      phone_number,
      profile_image: null,
      verificationToken,
      isVerified: false, // Add a field to track email verification
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