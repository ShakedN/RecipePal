import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

//Set up multer with Cloudinary storage
const upload = multer({ storage });

//Create Express router
const router = express.Router();

//Upload image to cloudinary
router.post("/upload", upload.single("image"), (req, res) => {
  //If no image was uploaded return 400
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // If image uploaded successfully return the URL of the image
  res.json({ imageUrl: req.file.path });
});

export default router;
