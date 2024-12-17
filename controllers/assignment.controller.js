import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.schema.js";
import { AssignmentResponseModel } from "../models/user.schema.js";
import { AssignmentModel } from "../models/assignment.schema.js";
import mongoose from "mongoose";

// Controller to check if a student has attended an assignment
export const checkAssignmentAttendance = async (req, res) => {
  try {
   const {userId} = req.user;

    
    // Fetch the assignmentId from params
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required." });
    }

    // Check if the assignment response exists
    const assignmentResponse = await AssignmentResponseModel.findOne({
      userId,
      assignmentId,
    });

    if (assignmentResponse) {
      return res.status(200).json({
        attended: true,
        message: "Student has attended the assignment.",
        assignmentResponse,
      });
    } else {
      return res.status(200).json({
        attended: false,
        message: "Student has not attended the assignment.",
      });
    }
  } catch (error) {
    console.error("Error checking assignment attendance:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAssignmentResponsesByCourse = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;

    // Validate params
    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: 'Invalid course ID or assignment ID' });
    }

    // Fetch assignment to ensure it belongs to the course
    const assignment = await AssignmentModel.findOne({ _id: assignmentId, courseId });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found for this course' });
    }

    // Fetch responses for the assignment
    const assignmentResponses = await AssignmentResponseModel.find({ assignmentId })
      .populate({
        path: 'userId',
        select: 'name email', // Fetch user's name and email
      })
      .select('userId totalMarksObtained submissionDate status');

    // Format the result
    const result = assignmentResponses.map((response) => {
      return {
        userId: response.userId._id,
        name: response.userId.name,
        email: response.userId.email,
        totalMarksObtained: response.totalMarksObtained,
        submissionDate: response.submissionDate,
        status: response.status,
      };
    });

    // Send the response
    return res.status(200).json({
      assignmentId,
      courseId,
      responses: result,
    });
  } catch (error) {
    console.error('Error fetching assignment responses:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

