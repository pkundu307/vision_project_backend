import express from 'express';
import { addTestToCourse, deleteTestByIdAndCourseId, getResponsesByCourseId, getResponsesByUserId, getTestByIdAndCourseId, getTestsByCourseId, submitTest } from '../controllers/test.controller.js';

const router = express.Router();

router.post('/courses/:courseId/tests', addTestToCourse);

router.get('/courses/:courseId/tests', getTestsByCourseId);

// Get a specific test by testId and courseId
router.get('/courses/:courseId/tests/:testId', getTestByIdAndCourseId);

// Route to submit a test
router.post("/submit", submitTest);

// Route to get all responses by course ID
router.get("/responses/course/:courseId", getResponsesByCourseId);

// Route to get all responses by user ID
router.get("/responses/user/:userId", getResponsesByUserId);
router.delete("/:courseId/tests/:testId",deleteTestByIdAndCourseId)

export default router;
