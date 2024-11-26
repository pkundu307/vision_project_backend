import { addStudentToCourse, addTrainerToCourse, createCourse, getChatRoomByCourseId, getEnrolledCoursesByid } from "../controllers/course.controller.js";
import express from "express";

const router = express.Router();

router.post('/create',createCourse);
router.post("/courses/:courseId/trainers", addTrainerToCourse);
router.post("/courses/:courseId/students", addStudentToCourse);
router.get("/courses/:id",getEnrolledCoursesByid)
router.get("/:courseId",getChatRoomByCourseId)

export default router;