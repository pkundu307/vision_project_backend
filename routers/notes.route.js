import express from 'express';
import fileUpload from 'express-fileupload';
import { uploadNote, getNotesByCourseId } from '../controllers/notes.controller.js';

const router = express.Router();

// Middleware for file uploads (specific to routes that need it)
const fileUploadMiddleware = fileUpload();

// Route to upload a note
router.post('/courses/:courseId/notes', fileUploadMiddleware, uploadNote);

// Route to get notes by course ID
router.get('/courses/:courseId/notes', getNotesByCourseId);

export default router;
