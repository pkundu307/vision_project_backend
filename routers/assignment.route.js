import express from 'express';
import { checkAssignmentAttendance, getAssignmentResponsesByCourse, getCourseAssignmentsWithSubmissions } from "../controllers/assignment.controller.js";
import authenticateUser from '../middleware/authenticate.js';

const router = express.Router();

router.get("/:assignmentId/attendance", authenticateUser, checkAssignmentAttendance)
router.get("/:assignmentId/:courseId", authenticateUser, getAssignmentResponsesByCourse)
router.get('/all/assignments/:courseId', getCourseAssignmentsWithSubmissions);

export default router;