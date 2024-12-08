import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.schema.js";
import { AssignmentResponseModel } from "../models/user.schema.js";

// Controller to check if a student has attended an assignment
export const checkAssignmentAttendance = async (req, res) => {
  try {
   const {userId} = req.user;
    console.log(userId);
    
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
