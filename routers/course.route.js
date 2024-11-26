import { addStudentToCourse, addTrainerToCourse, createCourse, getEnrolledCoursesByid } from "../controllers/course.controller.js";
import express from "express";

const router = express.Router();

router.post('/create',createCourse);
router.post("/courses/:courseId/trainers", addTrainerToCourse);
router.post("/courses/:courseId/students", addStudentToCourse);
router.get("/courses/:id",getEnrolledCoursesByid)

export default router;