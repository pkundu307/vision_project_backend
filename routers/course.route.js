import { addStudentToCourse, addTrainerToCourse, createCourse } from "../controllers/course.controller.js";
import express from "express";

const router = express.Router();

router.post('/create',createCourse);
router.post("/courses/:courseId/trainers", addTrainerToCourse);
router.post("/courses/:courseId/students", addStudentToCourse);

export default router;