import { login, register } from "../controllers/userController.js";

import express from "express";

const router = express.Router();

router.post('/resgister', register);

router.post('/login', login);


export default router;