import express from 'express';
import {createOrganization, getAllCoursesByOrganization, getAllTrainers, getCoursesByOrganization, getStudentsByOrganization} from '../controllers/organization.controller.js';


const router = express.Router();


router.post('/create' ,createOrganization)
router.get('/allcourses', getAllCoursesByOrganization)
router.get('/gettrainers',getAllTrainers)
router.get('/courseview',getCoursesByOrganization)
router.get('/students',getStudentsByOrganization)
export default router;
