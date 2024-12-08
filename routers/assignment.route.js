import express from 'express';
import { checkAssignmentAttendance } from "../controllers/assignment.controller.js";
import authenticateUser from '../middleware/authenticate.js';

const router = express.Router();

router.get("/:assignmentId/attendance", authenticateUser, checkAssignmentAttendance)


export default router;