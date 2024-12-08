import express from 'express';
import {addTodo, createOrganization, getAllCoursesByOrganization, getAllTrainers, getAnnouncements, getCoursesByOrganization, getStatsByOrganization, getStudentsByOrganizationId, makeAnnouncement} from '../controllers/organization.controller.js';
import { authenticateOrganization } from '../middleware/adminAuthenticate.js';


const router = express.Router();


router.post('/create' ,createOrganization)
router.get('/allcourses', getAllCoursesByOrganization)
router.get('/gettrainers',getAllTrainers)
router.get('/courseview',getCoursesByOrganization)
router.get('/stats',getStatsByOrganization)
//todos
router.post('/addtodo',authenticateOrganization,addTodo)
//announcements
router.post('/announcements',authenticateOrganization,makeAnnouncement)
router.get('/announcements',authenticateOrganization,getAnnouncements)
router.get("/students",authenticateOrganization, getStudentsByOrganizationId);

export default router;
