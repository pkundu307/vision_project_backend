import express from 'express';
import { checkAssignmentAttendance, getAssignmentResponsesByCourse } from "../controllers/assignment.controller.js";
import authenticateUser from '../middleware/authenticate.js';

const router = express.Router();

router.get("/:assignmentId/attendance", authenticateUser, checkAssignmentAttendance)
router.get("/:assignmentId/:courseId", authenticateUser, getAssignmentResponsesByCourse)

export default router;