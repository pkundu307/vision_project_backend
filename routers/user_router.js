import { login, register } from "../controllers/user.controller.js";
import authenticateUser from "../middleware/authenticate.js";

import express from "express";
import { UserModel } from "../models/user.schema.js";

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/user/details', authenticateUser, async (req, res) => {
  try {
    // The authenticated user ID is available in req.user.userId
    const userId = req.user.userId;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
        userType: user.userType,
        collegeName: user.collegeName,
        currentRole: user.currentRole
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
