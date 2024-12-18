import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.schema.js";
import { AssignmentResponseModel } from "../models/user.schema.js";
import { AssignmentModel } from "../models/assignment.schema.js";
import mongoose from "mongoose";
import { CourseModel } from "../models/course.schema.js";

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

export const getCourseAssignmentsWithSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params; // Assuming courseId is passed as a URL parameter

    // Fetch course details (name and student count)
    const course = await CourseModel.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const { courseName: courseName, enrolledStudents } = course;
    const totalStudents = enrolledStudents?.length || 0;

    // Fetch assignments for the given course
    const assignments = await AssignmentModel.find({ courseId })
      .populate('questions', '_id') // Fetch question IDs only
      .lean();

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({
        message: 'No assignments found for this course.',
        courseName,
        totalStudents,
      });
    }

    // Fetch assignment submission counts
    const submissionCounts = await AssignmentResponseModel.aggregate([
      { $match: { assignmentId: { $in: assignments.map((a) => a._id) } } },
      { $group: { _id: '$assignmentId', submissionCount: { $sum: 1 } } },
    ]);

    // Map submission counts to assignment IDs
    const submissionMap = submissionCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.submissionCount;
      return acc;
    }, {});

    // Prepare the response
    const assignmentResponses = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      title: assignment.title,
      description: assignment.description,
      numberOfQuestions: assignment.questions.length,
      deadline:assignment.deadline,
      submissions: submissionMap[assignment._id.toString()] || 0, // Default to 0 if no submissions
    }));

    return res.status(200).json({
      courseName,
      totalStudents,
      assignments: assignmentResponses,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
