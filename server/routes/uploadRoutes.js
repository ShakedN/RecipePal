import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage });
const router = express.Router();

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

export default router;
