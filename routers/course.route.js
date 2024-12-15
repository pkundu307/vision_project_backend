import {
  addAnnouncement,
  // addNote,
  addStudentToCourse,
  addTrainerToCourse,
  addVolunteerToCourse,
  createAssignment,
  createCourse,
  getAnnouncements,
  getAssignmentById,
  getAssignmentsByCourseId,
  getChatRoomByCourseId,
  getCourseDetailsById,
  getEnrolledCoursesByid,
  // getNotesByCourseId,
  getStudentDetailsByCourseId,
  removeStudentFromCourse,
  submitAssignment,
  updateCourseStatus,
  updateSessionLink,
  getAnnouncementsByCourseId
} from "../controllers/course.controller.js";
import express from "express";
import authenticateUser from "../middleware/authenticate.js";
import { authenticateOrganization } from "../middleware/adminAuthenticate.js";

const router = express.Router();

router.post("/create", createCourse);
router.post("/courses/:courseId/trainers", addTrainerToCourse);
router.post("/courses/:courseId/students", addStudentToCourse);
router.post("/volunteer/:courseId", addVolunteerToCourse);
router.patch("/:courseId/",updateCourseStatus)
router.get("/courses/:id", getEnrolledCoursesByid);
router.get("/:courseId", getChatRoomByCourseId);
// router.post("/add-note", authenticateUser, addNote);
// router.get("/get-notes/:courseId", getNotesByCourseId);
router.post("/assignments", authenticateUser, createAssignment);
router.get(
  "/assignments/:courseId",
  authenticateUser,
  getAssignmentsByCourseId
);
router.get("/assignment/:assignmentId", getAssignmentById);
router.post("/assignment/submit", authenticateUser, submitAssignment);
router.get("/student-list/:courseId", getStudentDetailsByCourseId);
router.post("/sessionadd/:courseId",updateSessionLink)
router.get("/alldetails/:courseId",getCourseDetailsById)
router.patch('/:courseId/students/:studentId',authenticateOrganization,removeStudentFromCourse)

router.post("/announcement/:courseId",authenticateOrganization,addAnnouncement)
router.get("/announcement/:courseId",authenticateOrganization,getAnnouncements)
export default router;
