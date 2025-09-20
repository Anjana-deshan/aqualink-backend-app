import express from 'express';
import { uploadImage } from '../controllers/imageController.js';
import { upload } from '../utils/upload.js'; // Import your existing upload middleware

const imageRouter = express.Router();

// Upload image endpoint
imageRouter.post('/upload', upload.single('image'), uploadImage);

export default imageRouter;