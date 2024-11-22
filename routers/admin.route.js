import express from 'express';
import { createAdmin,updateAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/admin', createAdmin); // Create Admin
router.put('/admin/:id', updateAdmin); // Update Admin

export default router;
