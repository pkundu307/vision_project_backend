import express from 'express';
import { addTestToCourse, getTestByIdAndCourseId, getTestsByCourseId } from '../controllers/test.controller.js';

const router = express.Router();

router.post('/courses/:courseId/tests', addTestToCourse);

router.get('/courses/:courseId/tests', getTestsByCourseId);

// Get a specific test by testId and courseId
router.get('/courses/:courseId/tests/:testId', getTestByIdAndCourseId);

export default router;
