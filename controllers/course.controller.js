import jwt from "jsonwebtoken";
import { CourseModel } from "../models/course.schema.js";
import { OrganizationModel } from "../models/organization.schema.js";
import { AssignmentResponseModel, UserModel } from "../models/user.schema.js";
import { ChatRoomModel } from "../models/chatRoom.schema.js";
import { io } from "../index.js";

// 'server' is your HTTP server instance

import bcrypt from "bcrypt";
import { AssignmentModel, QuestionModel } from "../models/assignment.schema.js";

export const createCourse = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
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
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
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
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    const { email, name } = req.body;
    const { courseId } = req.params;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    const course = await CourseModel.findOne({
      _id: courseId,
      organization: organizationId,
    }).populate("chatRoom");
    if (!course) {
      return res.status(404).json({
        message: "Course not found or does not belong to the organization",
      });
    }

    let trainer = await UserModel.findOne({ email });
    if (!trainer) {
      const defaultPassword = "trainer123";

      trainer = new UserModel({
        email,
        password: defaultPassword,
        name,
        userType: "teacher",
      });
      await trainer.save();
    }
    trainer.enrolledCourses.push(courseId);
    await trainer.save();
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

export const addVolunteerToCourse = async (req, res) => {
  try {
    // Validate token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    // Extract body and params
    const { email, name } = req.body;

    
    const { courseId } = req.params;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    // Validate ObjectIDs
    // if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(organizationId)) {
    //   return res.status(400).json({ message: "Invalid course or organization ID" });
    // }

    // Find course and validate organization
    const course = await CourseModel.findOne({
      _id: courseId,
      organization: organizationId,
    }).populate("chatRoom");

    if (!course) {
      return res.status(404).json({
        message: "Course not found or does not belong to the organization",
      });
    }

    // Find or create volunteer
    let volunteer = await UserModel.findOne({ email });
    if (!volunteer) {
      const hashedPassword = await bcrypt.hash("volunteer123", 10);

      volunteer = new UserModel({
        email,
        password: hashedPassword,
        name,
        userType: "volunteer",
      });
      await volunteer.save();
    }

    // Add course to volunteer's enrolled courses
    if (!volunteer.enrolledCourses.includes(courseId)) {
      volunteer.enrolledCourses.push(courseId);
      await volunteer.save();
    }

    // Add volunteer to course
    if (!course.volunteers.includes(volunteer._id)) {
      course.volunteers.push(volunteer._id);
      await course.save();

      // Add volunteer to chat room
      if (!course.chatRoom.participants.includes(volunteer._id)) {
        course.chatRoom.participants.push(volunteer._id);
        await course.chatRoom.save();
      }

      // Notify participants via Socket.IO
      io.to(course.chatRoom._id.toString()).emit("participantAdded", {
        userId: volunteer._id,
        name: volunteer.name,
        role: "volunteer",
      });
    }

    return res.status(200).json({
      message: "Volunteer added to the course and chat room successfully",
      volunteerId: volunteer._id,
      course,
    });
  } catch (error) {
    console.error("Error adding volunteer:", error);
    return res.status(500).json({
      message: "An error occurred while adding the volunteer",
      error: error.message,
    });
  }
};

export const addStudentToCourse = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    const { email, name } = req.body;
    const { courseId } = req.params;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    const course = await CourseModel.findOne({
      _id: courseId,
      organization: organizationId,
    }).populate("chatRoom");
    if (!course) {
      return res.status(404).json({
        message: "Course not found or does not belong to the organization",
      });
    }

    let student = await UserModel.findOne({ email });
    if (!student) {
      const defaultPassword = "student123";
      student = new UserModel({
        email,
        password: defaultPassword,
        name,
        userType: "student",
      });

      student.enrolledCourses.push(courseId);
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

export const getEnrolledCoursesByid = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the student from the database
    const student = await UserModel.findById(id).populate({
      path: "enrolledCourses", // Populate enrolled courses
      model: "Course", // Refers to the CourseModel
      select: "courseName description duration startDate endDate fee", // Select only specific fields
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student has any enrolled courses
    if (!student.enrolledCourses || student.enrolledCourses.length === 0) {
      return res
        .status(200)
        .json({ message: "No enrolled courses found", courses: [] });
    }

    return res.status(200).json({
      message: "Enrolled courses retrieved successfully",
      courses: student.enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the enrolled courses",
      error: error.message,
    });
  }
};

// Controller function to get chat room ID by course ID
export const getChatRoomByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find the course by ID
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the chat room associated with the course
    const chatRoom = await ChatRoomModel.findOne({ course: course._id });
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Respond with the chat room ID
    res.status(200).json({ chatRoomId: chatRoom._id });
  } catch (error) {
    console.error("Error fetching chat room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const addNote = async (req, res) => {
//   try {
//     const { courseId, note } = req.body; // Extract courseId and note from the request body
//     const { userType } = req.user; // Extract user details from the authenticated user

//     // Check if the user is a teacher or volunteer
//     if (userType !== "teacher" && userType !== "volunteer") {
//       return res
//         .status(403)
//         .json({ message: "You do not have permission to add notes." });
//     }

//     // Validate the note structure
//     if (!note || !note.type || !note.content) {
//       return res
//         .status(400)
//         .json({ message: "Note type and content are required." });
//     }

//     // Find the course
//     const course = await CourseModel.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found." });
//     }

//     // Add the note to the course's notes array
//     course.notes.push({
//       ...note,
//       uploadedAt: new Date(), // Automatically add the current timestamp
//     });

//     // Save the updated course
//     await course.save();

//     res
//       .status(200)
//       .json({ message: "Note added successfully.", notes: course.notes });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

export const getNotesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params; // Extract courseId from the request params

    // Find the course by ID
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Return the notes associated with the course
    res.status(200).json({ notes: course.notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getStudentDetailsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params; // Find the course by ID and populate enrolledStudents
    const course = await CourseModel.findById(courseId).populate(
      "enrolledStudents",
      "name"
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    } // Extract student details
    const studentDetails = course.enrolledStudents.map((student) => ({
      studentId: student._id,
      courseId: course._id,
      studentName: student.name,
      startDate: course.startDate
    })); // Respond with the student details
    res.status(200).json({ studentDetails });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { userType } = req.user;


    if (userType !== 'teacher' && userType !== 'volunteer') {
      return res.status(403).json({ message: 'Access denied. Only teachers or volunteers can create assignments.' });
    }
    
    const { courseId, title, description, deadline, questions } = req.body;

    if (!courseId || !title || !deadline || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Missing required fields. Ensure courseId, title, deadline, and questions are provided.' });
    }

    
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Temporarily create questions without assignmentId
    const createdQuestions = await QuestionModel.insertMany(
      questions.map((q) => ({
        type: q.type,
        questionText: q.questionText,
        options: q.type === 'mcq' ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
      }))
    );

    const totalMarks = createdQuestions.reduce((sum, question) => sum + question.marks, 0);

    const newAssignment = new AssignmentModel({
      courseId,
      title,
      description,
      deadline,
      questions: createdQuestions.map((q) => q._id),
      totalMarks,
    });

    const savedAssignment = await newAssignment.save();

    // Update the questions with the new assignmentId
    await QuestionModel.updateMany(
      { _id: { $in: createdQuestions.map((q) => q._id) } },
      { $set: { assignmentId: savedAssignment._id } }
    );

    course.assignments.push(savedAssignment._id);
    await course.save();

    res.status(201).json({ message: 'Assignment created successfully.', assignment: savedAssignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const getAssignmentsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate the courseId
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required.' });
    }

    // Fetch assignments with only name and description fields
    const assignments = await AssignmentModel.find({ courseId })
      .select('title description deadline _id'); // Include `title` and `description`, exclude `_id`

    // Check if there are assignments for the course
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No assignments found for this course.' });
    }

    // Respond with the filtered assignments
    res.status(200).json({
      message: 'Assignments fetched successfully.',
      assignments,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    // Extract userId from JWT
    const { userId } = req.user;

    // Extract submission details from the request body
    const { assignmentId, responses } = req.body;

    // Validate the input
    if (!assignmentId || !responses || responses.length === 0) {
      return res.status(400).json({
        message: 'Assignment ID and responses are required.',
      });
    }

    // Check if the assignment exists
    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Check if the submission deadline has passed
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(403).json({ message: 'The submission deadline has passed.' });
    }

    // Fetch questions from the database
    const questionIds = responses.map((response) => response.questionId);
    const questions = await QuestionModel.find({ _id: { $in: questionIds } });

    // Map user responses to include question text, marks awarded, and correctness
    const processedResponses = responses.map((response) => {
      const question = questions.find((q) => q._id.toString() === response.questionId);

      if (!question) {
        throw new Error(`Question with ID ${response.questionId} not found.`);
      }

      const isCorrect = response.userAnswer === question.correctAnswer;
      const marksObtained = isCorrect ? question.marks : 0;

      return {
        questionId: response.questionId,
        questionText: question.questionText, // Include question text
        userAnswer: response.userAnswer,
        correctAnswer: question.correctAnswer,
        marksObtained,
        isCorrect,
      };
    });

    // Calculate total marks obtained
    const totalMarksObtained = processedResponses.reduce((sum, r) => sum + r.marksObtained, 0);

    // Create a new assignment response
    const newResponse = new AssignmentResponseModel({
      userId,
      assignmentId,
      responses: processedResponses,
      totalMarksObtained,
    });

    // Save the response in the database
    const savedResponse = await newResponse.save();

    // Return the response
    res.status(201).json({
      message: 'Assignment submitted successfully.',
      response: savedResponse,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    // Extract assignmentId from the request parameters
    const { assignmentId } = req.params;

    // Validate the assignmentId
    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required.' });
    }

    // Fetch the assignment details from the database
    const assignment = await AssignmentModel.findById(assignmentId).populate('courseId', 'courseName');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Fetch the questions associated with this assignment
    const questions = await QuestionModel.find({ assignmentId });

    // Construct the response object
    const assignmentDetails = {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline,
      totalMarks: assignment.totalMarks,
      courseName: assignment.courseId.courseName,
      questions: questions.map((question) => ({
        _id: question._id,
        questionText: question.questionText,
        type: question.type,
        options: question.type === 'mcq' ? question.options : undefined,
        marks: question.marks,
      })),
    };

    // Send the response
    res.status(200).json({ message: 'Assignment fetched successfully.', assignment: assignmentDetails });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const updateSessionLink = async (req, res) => {
  try {
    const { courseId } = req.params; // Extract course ID from route parameters
    const { googleMeetLink } = req.body; // Extract session link from request body

    if (!googleMeetLink) {
      return res.status(400).json({ error: "Session link is required." });
    }

    // Find the course by ID
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Replace the old session link with the new one (only keep one session)
    course.sessions = [
      {
        googleMeetLink,
        createdAt: new Date(), // Add the current timestamp
      },
    ];

    // Save the updated course
    await course.save();

    res.status(200).json({
      message: "Session link updated successfully.",
      courseId: course._id,
      sessions: course.sessions,
    });
  } catch (error) {
    console.error("Error updating session link:", error);
    res.status(500).json({ error: "Failed to update session link." });
  }
};

export const updateCourseStatus = async (req, res) => {
  const { courseId } = req.params;
  const { status } = req.body; // Expected values: 'ongoing', 'ended'

  // Validate status input
  const validStatuses = ['ongoing', 'ended','upcoming'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    // Find and update the course
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      { status },
      { new: true } // Return the updated course
    );

    // If course not found
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Respond with the updated course
    res.status(200).json({
      message: "Course status updated successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const getCourseDetailsById = async (req, res) => {
  const { courseId } = req.params;

  try {
    // Find course details
    const course = await CourseModel.findById(courseId)
      .populate({
        path: 'instructors',
        select: 'name email userType',
        match: { userType: 'teacher' },
      })
      .populate({
        path: 'enrolledStudents',
        select: 'name email userType',
      })
      .populate({
        path: 'enrolledStudentsRemoved',
        select: 'name email userType',
      })
      .populate({
        path: 'volunteers',
        select: 'name email userType',
      })
      .exec();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Separate students and volunteers
    const students = course.enrolledStudents.filter(
      (student) => student.userType === 'student'
    );
    const volunteers = course.enrolledStudents.filter(
      (volunteer) => volunteer.userType === 'volunteer'
    );

    // Response object
    const response = {
      courseDetails: {
        courseName: course.courseName,
        description: course.description,
        duration: course.duration,
        schedule: course.schedule,
        enrollmentLimit: course.enrollmentLimit,
        enrolledStudentsCount: course.enrolledStudents.length+course.enrolledStudentsRemoved.length,
        startDate: course.startDate,
        endDate: course.endDate,
        fee: course.fee,
        announcements: course.announcements,
        materials: course.materials,
        prerequisites: course.prerequisites,
        category: course.category,
        status: course.status,
      },
      instructors: course.instructors,
      students,
      removedStudent: course.enrolledStudentsRemoved,
      volunteers:course.volunteers,
    };

    // Send response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
export const removeStudentFromCourse = async (req, res) => {
  const { courseId, studentId } = req.params;

  try {
    // Find the course
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the student exists
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student is in enrolledStudents or enrolledStudentsRemoved
    const isEnrolled = course.enrolledStudents.includes(studentId);
    const isRemoved = course.enrolledStudentsRemoved.includes(studentId);

    if (!isEnrolled && !isRemoved) {
      return res
        .status(400)
        .json({ message: 'Student is neither enrolled nor removed in this course' });
    }

    if (isEnrolled) {
      // Remove from enrolledStudents and add to enrolledStudentsRemoved
      course.enrolledStudents = course.enrolledStudents.filter(
        (id) => id.toString() !== studentId
      );
      if (!isRemoved) {
        course.enrolledStudentsRemoved.push(studentId);
      }

      // Update user's enrolledCourses and add to enrolledCoursesRemoved
      student.enrolledCourses = student.enrolledCourses.filter(
        (id) => id.toString() !== courseId
      );
      if (!student.enrolledCoursesRemoved.includes(courseId)) {
        student.enrolledCoursesRemoved.push(courseId);
      }
    } else if (isRemoved) {
      // Re-enroll the student (undo removal)
      course.enrolledStudentsRemoved = course.enrolledStudentsRemoved.filter(
        (id) => id.toString() !== studentId
      );
      if (!course.enrolledStudents.includes(studentId)) {
        course.enrolledStudents.push(studentId);
      }

      // Update user's enrolledCoursesRemoved and re-add to enrolledCourses
      student.enrolledCoursesRemoved = student.enrolledCoursesRemoved.filter(
        (id) => id.toString() !== courseId
      );
      if (!student.enrolledCourses.includes(courseId)) {
        student.enrolledCourses.push(courseId);
      }
    }

    // Save changes to the database
    await course.save();
    await student.save();

    return res.status(200).json({
      message: isEnrolled
        ? 'Student removed from the course successfully'
        : 'Student re-enrolled to the course successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
};
export const addAnnouncement = async (req, res) => {
  try {
    const { courseId } = req.params; // Get course ID from the route parameters
    const { title, content } = req.body; // Get announcement details from the request body

    // Validate input
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    // Find the course and add the announcement
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Add the new announcement
    const newAnnouncement = { title, content, createdAt: new Date() };
    course.announcements.push(newAnnouncement);

    // Save the updated course
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Announcement added successfully.",
      data: newAnnouncement,
    });
  } catch (error) {
    console.error("Error adding announcement:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
export const getAnnouncements = async (req, res) => {
  try {
    const { courseId } = req.params; // Get course ID from the route parameters

    // Find the course by ID
    const course = await CourseModel.findById(courseId);

    
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Retrieve announcements from the course
    const announcements = course.announcements || [];

    return res.status(200).json({
      success: true,
      message: "Announcements retrieved successfully.",
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
