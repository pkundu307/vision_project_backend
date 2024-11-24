import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel, UserTypeEnum, CurrentRoleEnum } from '../models/user.schema.js';
import nodemailer from 'nodemailer';
import { OrganizationModel } from '../models/organization.schema.js';
import { CourseModel } from '../models/course.schema.js';

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
  console.log(email, password);
  

  try {
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check for regular user (student or teacher)
    const user = await UserModel.findOne({ email });
    if (user) {
      console.log(user);
      
      // Compare the password with the stored hashed password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Retrieve the courses the user is enrolled in (if student) or instructing (if teacher)
      let courses = [];
      if (user.userType === "student") {
        courses = await CourseModel.find({ enrolledStudents: user._id }).populate("organization", "name");
      } else if (user.userType === "teacher") {
        courses = await CourseModel.find({ instructors: user._id }).populate("organization", "name");
      }

      // Generate JWT token for user
      const token = generateToken(user._id, user.userType);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id:user._id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          currentRole: user.currentRole,
          collegeName: user.collegeName,
        },
        courses: courses.map((course) => ({
          courseName: course.courseName,
          description: course.description,
          startDate: course.startDate,
          endDate: course.endDate,
          organization: course.organization.name,
        })),
      });
    }

    // If not a regular user, check for admin in the Organization schema
    const organization = await OrganizationModel.findOne({ contactEmail: email });

    if (organization) {
      // Compare the password with the stored hashed password
      const isMatch = await organization.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate JWT token for admin
      const token = generateToken(organization._id, "admin");

      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: {
          email: organization.contactEmail,
          name: organization.adminName,
          organizationName: organization.name,
          userType: "admin",
          organizationId: organization._id,
        },
      });
    }

    // If neither user nor admin is found
    return res.status(400).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getCoursesByUserId = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Find the user to check their type
    const user = await UserModel.findById(userId);
    
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let courses;
    if (user.userType === 'student') {
      // Find courses where the user is enrolled
      courses = await CourseModel.find({ enrolledStudents: userId }).populate('instructors organization chatRoom');
    } else if (user.userType === 'teacher') {
      // Find courses where the user is an instructor
      courses = await CourseModel.find({ instructors: userId }).populate('enrolledStudents organization chatRoom');
    } else {
      return res.status(400).json({ message: 'Invalid user type for this action' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};