import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel, UserTypeEnum, CurrentRoleEnum } from '../models/user_schema.js';

// Helper function to generate JWT token
const generateToken = (userId, userType) => {
  const payload = { userId, userType };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Register Controller
export const register = async (req, res) => {
  const { email, password, collegeName, passoutYear, cv, userType, currentRole } = req.body;

  try {
    // Validate user type and current role
    if (!Object.values(UserTypeEnum).includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!Object.values(CurrentRoleEnum).includes(currentRole)) {
      return res.status(400).json({ message: 'Invalid current role' });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create a new user instance
    const newUser = new UserModel({
      email,
      password,
      collegeName,
      passoutYear,
      cv,
      userType,
      currentRole,
    });

    // Save the new user
    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully!',
      user: { email, collegeName, userType, currentRole }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.userType);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        collegeName: user.collegeName,
        userType: user.userType,
        currentRole: user.currentRole,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
