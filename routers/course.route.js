import {
  addNote,
  addStudentToCourse,
  addTrainerToCourse,
  createAssignment,
  createCourse,
  getAssignmentById,
  getAssignmentsByCourseId,
  getChatRoomByCourseId,
  getEnrolledCoursesByid,
  getNotesByCourseId,
  submitAssignment,
} from "../controllers/course.controller.js";
import express from "express";
import authenticateUser from "../middleware/authenticate.js";

const router = express.Router();

router.post("/create", createCourse);
router.post("/courses/:courseId/trainers", addTrainerToCourse);
router.post("/courses/:courseId/students", addStudentToCourse);
router.get("/courses/:id", getEnrolledCoursesByid);
router.get("/:courseId", getChatRoomByCourseId);
router.post("/add-note", authenticateUser, addNote);
router.get("/get-notes/:courseId", getNotesByCourseId);
router.post("/assignments", authenticateUser, createAssignment);
router.get(
  "/assignments/:courseId",
  authenticateUser,
  getAssignmentsByCourseId
);
router.get("/assignment/:assignmentId",getAssignmentById)
router.post("/assignment/submit",authenticateUser,submitAssignment)
export default router;
