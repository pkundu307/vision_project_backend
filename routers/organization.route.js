import express from 'express';
import {createOrganization, getAllCoursesByOrganization, getAllTrainers} from '../controllers/organization.controller.js';


const router = express.Router();


router.post('/create' ,createOrganization)
router.get('/allcourses', getAllCoursesByOrganization)
router.get('/gettrainers',getAllTrainers)

export default router;
