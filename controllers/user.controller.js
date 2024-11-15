import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel, UserTypeEnum, CurrentRoleEnum } from '../models/user.schema.js';
import nodemailer from 'nodemailer';

// Helper function to generate JWT token
const generateToken = (userId, userType) => {
  const payload = { userId, userType };
  return jwt.sign(payload, "pkpkpkpkpkpkpkpkpkpkpk", { expiresIn: '90h' }); 
};

// Register Controller

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create a new user instance
    const newUser = new UserModel({
      email,
      password,
      name,
      otp_verified: false, // Default to not verified
    });

    // Save the new user
    await newUser.save();

    // Send a welcome email with nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password',  // Replace with your email password or an app-specific password
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to Our Service!',
      text: `Hello ${name},\n\nWelcome! Thank you for registering with us.\n\nBest regards,\nYour Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(201).json({
      message: 'User registered successfully! Please verify your email.',
      user: { email, name, otp_verified: false }
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
        name: user.name
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
