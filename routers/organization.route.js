import express from 'express';
import { createOrganization } from '../controllers/organization.controller';
import authenticateUser from '../middleware/authenticate';



const router = express.Router();


router.post('/create', authenticateUser ,createOrganization)
