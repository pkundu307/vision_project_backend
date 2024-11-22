import jwt from "jsonwebtoken";
import { CourseModel } from "../models/course.schema.js";
import { OrganizationModel } from "../models/organization.schema.js";
import { UserModel } from "../models/user.schema.js";
import { ChatRoomModel } from "../models/chatRoom.schema.js";
// import {io} from "socket.io"

export const createCourse = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Authorization token is required" });
      }
  
      const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
      const organizationId = decoded.userId;
  
      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
  
      const {
        courseName,
        description,
        duration,
        schedule,
        enrollmentLimit,
        startDate,
        endDate,
        fee,
        materials,
        prerequisites,
        category,
      } = req.body;
  
      if (
        !courseName ||
        !description ||
        !duration ||
        !enrollmentLimit ||
        !startDate ||
        !endDate ||
        !fee ||
        !category
      ) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
  
      // Create the chat room first
      const chatRoom = new ChatRoomModel({ participants: [] });
      let savedChatRoom = await chatRoom.save();
  
      // Create the course with the chatRoom ID
      const newCourse = new CourseModel({
        courseName,
        description,
        duration,
        schedule,
        enrollmentLimit,
        startDate,
        endDate,
        fee,
        materials,
        prerequisites,
        category,
        organization: organizationId,
        chatRoom: savedChatRoom._id, // Assign the chatRoom ID
      });
  
      const savedCourse = await newCourse.save();
      savedChatRoom.course = newCourse.id;
      await savedChatRoom.save();
  
      // Add the course ID to the organization's coursesOffered
      organization.coursesOffered.push(savedCourse._id);
      await organization.save();
  
      return res.status(201).json({
        message: "Course created successfully",
        course: savedCourse,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      return res.status(500).json({
        message: "An error occurred while creating the course",
        error: error.message,
      });
    }
  };
  


export const addTrainerToCourse = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    const { email, name } = req.body;
    const { courseId } = req.params;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    const course = await CourseModel.findOne({ _id: courseId, organization: organizationId }).populate('chatRoom');
    if (!course) {
      return res.status(404).json({ message: "Course not found or does not belong to the organization" });
    }

    let trainer = await UserModel.findOne({ email });
    if (!trainer) {
      const defaultPassword = "trainer123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      trainer = new UserModel({
        email,
        password: hashedPassword,
        name,
        userType: "teacher",
      });
      await trainer.save();
    }

    if (!course.instructors.includes(trainer._id)) {
      course.instructors.push(trainer._id);
      await course.save();

      // Add trainer to chat room
      if (!course.chatRoom.participants.includes(trainer._id)) {
        course.chatRoom.participants.push(trainer._id);
        await course.chatRoom.save();
      }

      // Notify other participants via Socket.IO
      io.to(course.chatRoom._id.toString()).emit("participantAdded", {
        userId: trainer._id,
        name: trainer.name,
        role: "trainer",
      });
    }

    return res.status(200).json({
      message: "Trainer added to the course and chat room successfully",
      course,
    });
  } catch (error) {
    console.error("Error adding trainer:", error);
    return res.status(500).json({
      message: "An error occurred while adding the trainer",
      error: error.message,
    });
  }
};


export const addStudentToCourse = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Authorization token is required" });
      }
  
      const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
      const organizationId = decoded.userId;
  
      const { email, name } = req.body;
      const { courseId } = req.params;
  
      if (!email || !name) {
        return res.status(400).json({ message: "Email and name are required" });
      }
  
      const course = await CourseModel.findOne({ _id: courseId, organization: organizationId }).populate('chatRoom');
      if (!course) {
        return res.status(404).json({ message: "Course not found or does not belong to the organization" });
      }
  
      let student = await UserModel.findOne({ email });
      if (!student) {
        const defaultPassword = "student123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        student = new UserModel({
          email,
          password: hashedPassword,
          name,
          userType: "student",
        });
        await student.save();
      }
  
      if (!course.enrolledStudents.includes(student._id)) {
        course.enrolledStudents.push(student._id);
        await course.save();
  
        // Add student to chat room
        if (!course.chatRoom.participants.includes(student._id)) {
          course.chatRoom.participants.push(student._id);
          await course.chatRoom.save();
        }
  
        // Notify other participants via Socket.IO
        io.to(course.chatRoom._id.toString()).emit("participantAdded", {
          userId: student._id,
          name: student.name,
          role: "student",
        });
      }
  
      return res.status(200).json({
        message: "Student added to the course and chat room successfully",
        course,
      });
    } catch (error) {
      console.error("Error adding student:", error);
      return res.status(500).json({
        message: "An error occurred while adding the student",
        error: error.message,
      });
    }
  };
  