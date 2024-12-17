import { OrganizationModel } from "../models/organization.schema.js";
import { CourseModel } from "../models/course.schema.js";
import jwt from "jsonwebtoken";
import { UserModel, UserTypeEnum } from "../models/user.schema.js";
import { SessionModel } from "../models/sessions.schema.js";

export const createOrganization = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      contactEmail,
      contactPhone,
      website,
      coursesOffered,
      administrators,
      establishedYear,
      logo,
      adminName,
      adminPassword, // New fields for admin
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !address ||
      !contactEmail ||
      !contactPhone ||
      !adminName ||
      !adminPassword // Ensure admin credentials are provided
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Create the organization
    const organization = new OrganizationModel({
      name,
      description,
      address,
      contactEmail,
      contactPhone,
      website,
      coursesOffered,
      administrators,
      establishedYear,
      logo,
      plan: "starter",
      adminName,
      adminPassword, // Include admin credentials
    });

    // Save the organization to the database
    const savedOrganization = await organization.save();

    return res.status(201).json({
      message: "Organization created successfully.",
      organization: savedOrganization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return res.status(500).json({
      message: "An error occurred while creating the organization.",
      error: error.message,
    });
  }
};

// Controller to update an existing organization
export const updateOrganization = async (req, res) => {
  const { organizationId } = req.params;
  const {
    name,
    description,
    address,
    contactEmail,
    contactPhone,
    website,
    establishedYear,
    logo,
  } = req.body;

  try {
    // Find and update the organization by its ID
    const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
      organizationId,
      {
        name,
        description,
        address,
        contactEmail,
        contactPhone,
        website,
        establishedYear,
        logo,
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    res
      .status(200)
      .json({
        message: "Organization updated successfully.",
        organization: updatedOrganization,
      });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ message: "Failed to update organization.", error });
  }
};

export const getAllCoursesByOrganization = async (req, res) => {
  try {
    // Extract and verify the token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    // Find the organization
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Fetch courses for the organization with detailed fields
    const courses = await CourseModel.find({ organization: organizationId })
      .select(
        "courseName startDate endDate instructors enrolledStudents is_active status"
      )
      .populate("instructors", "contactPhone") // Assuming instructor contact numbers are needed
      .populate("enrolledStudents", "_id"); // To count total students

    // Format the data
    const formattedCourses = courses.map((course) => ({
      id: course._id,
      name: course.courseName,
      totalStudents: course.enrolledStudents.length || 0,
      trainerNumbers: course.instructors.length,
      startDate: course.startDate,
      endDate: course.endDate,
      isActive: course.is_active,
      status: course.status,
    }));

    return res.status(200).json({
      message: "Courses fetched successfully",
      courses: formattedCourses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      message: "An error occurred while fetching courses",
      error: error.message,
    });
  }
};

export const getAllTrainers = async (req, res) => {
  try {
    // Verify JWT token for authentication
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    // Ensure the requesting organization exists
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Fetch trainers based on their association with the organization or role
    const trainers = await UserModel.find({
      role: "trainer", // Assuming "role" field exists in User schema
      organization: organizationId, // Trainers associated with the organization
    }).select("name email contactPhone");

    return res.status(200).json({
      message: "Trainers fetched successfully",
      trainers,
    });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return res.status(500).json({
      message: "An error occurred while fetching trainers",
      error: error.message,
    });
  }
};

// Fetch courses by organization ID
export const getCoursesByOrganization = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    // Validate organization ID
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // Find the organization by ID
    const organization = await OrganizationModel.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: `Organization with ID '${organizationId}' not found`,
      });
    }

    // Find all courses associated with the organization
    const courses = await CourseModel.find({ organization: organization._id });

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        data: {
          totalCourses: 0,
          ongoingCourses: 0,
          endedCourses: 0,
          upcomingCourses: 0,
        },
        message: "No courses found for this organization",
      });
    }

    // Calculate course counts
    const totalCourses = courses.length;
    const ongoingCourses = courses.filter(
      (course) => course.status === "ongoing"
    ).length;
    const endedCourses = courses.filter(
      (course) => course.status === "ended"
    ).length;
    const upcomingCourses = courses.filter(
      (course) => course.status === "upcoming"
    ).length;

    // Return response
    return res.status(200).json({
      success: true,
      data: {
        totalCourses,
        ongoingCourses,
        endedCourses,
        upcomingCourses,
      },
    });
  } catch (error) {
    console.error("Error fetching courses by organization ID:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching courses",
      error: error.message,
    });
  }
};

export const getStatsByOrganization = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    // Validate organization ID
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // Fetch all courses for the given organization ID
    const courses = await CourseModel.find({ organization: organizationId });

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        data: {
          students: { total: 0, active: 0, passout: 0, newlyJoined: 0 },
          teachers: { total: 0, active: 0, inactive: 0 },
          volunteers: { total: 0 },
          subadmins: { total: 0 },
        },
        message: "No courses found for the specified organization",
      });
    }

    // Extract course IDs
    const courseIds = courses.map((course) => course._id);

    // Fetch users by roles
    const [students, teachers, volunteers, subadmins] = await Promise.all([
      UserModel.find({
        userType: UserTypeEnum.STUDENT,
        enrolledCourses: { $in: courseIds },
      }),
      UserModel.find({
        userType: UserTypeEnum.TEACHER,
        enrolledCourses: { $in: courseIds },
      }),
      UserModel.find({
        userType: UserTypeEnum.VOLUNTEER,
        organization: organizationId,
      }),
      UserModel.find({
        userType: UserTypeEnum.SUBADMIN,
        organization: organizationId,
      }),
    ]);

    // Initialize counters for students
    let activeStudents = 0;
    let passoutStudents = 0;
    let newlyJoinedStudents = 0;

    // Categorize students based on course status
    for (const student of students) {
      for (const courseId of student.enrolledCourses) {
        const course = courses.find(
          (c) => c._id.toString() === courseId.toString()
        );
        if (course) {
          switch (course.status) {
            case "ongoing":
              activeStudents++;
              break;
            case "ended":
              passoutStudents++;
              break;
            case "upcoming":
              newlyJoinedStudents++;
              break;
          }
        }
      }
    }

    // Initialize counters for teachers
    let activeTeachers = 0;
    let inactiveTeachers = 0;

    for (const teacher of teachers) {
      let isActive = false;
      for (const courseId of teacher.enrolledCourses) {
        const course = courses.find(
          (c) => c._id.toString() === courseId.toString()
        );
        if (course && course.status === "ongoing") {
          isActive = true;
          break;
        }
      }

      if (isActive) {
        activeTeachers++;
      } else {
        inactiveTeachers++;
      }
    }

    // Return combined response
    return res.status(200).json({
      success: true,
      data: {
        students: {
          total: students.length,
          active: activeStudents,
          passout: passoutStudents,
          newlyJoined: newlyJoinedStudents,
        },
        teachers: {
          total: teachers.length,
          active: activeTeachers,
          inactive: inactiveTeachers,
        },
        volunteers: {
          total: volunteers.length,
        },
        subadmins: {
          total: subadmins.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching stats by organization ID:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching stats",
      error: error.message,
    });
  }
};


export const addTodo = async (req, res) => {
  try {
    const { todoItem } = req.body;

    if (!todoItem || typeof todoItem !== "string") {
      return res
        .status(400)
        .json({
          message: "Invalid or missing 'todoItem' in the request body.",
        });
    }

    // Add the new todo object to the organization's todo array
    req.organization.todo.push({ todoItem });

    // Save the updated organization
    await req.organization.save();

    return res.status(200).json({
      message: "Todo added successfully.",
      organization: {
        id: req.organization._id,
        name: req.organization.name,
        todo: req.organization.todo, // Return the updated todo list
      },
    });
  } catch (error) {
    console.error("Error adding todo:", error);
    return res.status(500).json({
      message: "An error occurred while adding the todo.",
      error: error.message,
    });
  }
};
// Controller to make announcements
export const makeAnnouncement = async (req, res) => {
  try {
    const { announcement } = req.body;
    const organizationId = req.organization._id;

    // Validate the input
    if (!announcement || typeof announcement !== "string") {
      return res
        .status(400)
        .json({
          message: "Invalid or missing 'announcement' in the request body.",
        });
    }

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    // Fetch the organization
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    // Ensure the plan is set
    if (!organization.plan) {
      return res
        .status(400)
        .json({ message: "Organization plan is required." });
    }

    // Add the announcement to the organization's announcements array
    organization.announcements.push({ todoItem: announcement });
    // Save the updated organization
    await organization.save();

    return res.status(200).json({
      message: "Announcement added successfully.",
      organization: {
        id: organization._id,
        name: organization.name,
        announcements: organization.announcements, // Return the updated announcements list
      },
    });
  } catch (error) {
    console.error("Error making announcement:", error);
    return res.status(500).json({
      message: "An error occurred while making the announcement.",
      error: error.message,
    });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    // Retrieve the organization ID from the authenticated middleware
    const organizationId = req.organization._id;

    if (!organizationId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Fetch the organization by ID and get its announcements
    const organization = await OrganizationModel.findById(
      organizationId,
      "announcements"
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Respond with the organization's announcements
    return res.status(200).json({
      message: "Announcements fetched successfully",
      announcements: organization.announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({
      message: "An error occurred while fetching announcements",
      error: error.message,
    });
  }
};

export const getStudentsByOrganizationId = async (req, res) => {
  try {
    let organizationId = req.organization._id;
    // Validate if organization exists
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Find all courses offered by the organization
    const courses = await CourseModel.find({
      organization: organizationId,
    }).populate("enrolledStudents enrolledStudentsRemoved", "name email");

    // Extract enrolled students and include course names
    const studentsData = [];
    courses.forEach((course) => {
      course.enrolledStudents.forEach((student) => {
        studentsData.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          courseName: course.courseName,
        });
      });
    });

    // Remove duplicates (in case a student is enrolled in multiple courses)
    const uniqueStudents = studentsData.filter(
      (student, index, self) =>
        index ===
        self.findIndex(
          (s) =>
            s.studentId.equals(student.studentId) &&
            s.courseName === student.courseName
        )
    );

    res.status(200).json({
      organization: {
        id: organization._id,
        name: organization.name,
      },
      students: uniqueStudents,
    });
  } catch (error) {
    console.error("Error fetching students by organization ID:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching students",
        error: error.message,
      });
  }
};
export const getCourseAnnouncementsByOrganization = async (req, res) => {
  try {
    const organizationId = req.organization._id;

    if (!organizationId) {
      return res.status(401).json({ message: "Unauthorized access" });
    } // Get organization ID from route parameters

    // Validate organization ID
    if (!organizationId) {
      return res
        .status(400)
        .json({ success: false, message: "Organization ID is required." });
    }

    // Find the organization and populate courses
    const organization = await OrganizationModel.findById(
      organizationId
    ).populate({
      path: "coursesOffered",
      select: "announcements courseName",
    });

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found." });
    }

    // Extract announcements from all courses
    const announcements = organization.coursesOffered.flatMap((course) => {
      return course.announcements.map((announcement) => ({
        courseName: course.courseName,
        ...announcement,
      }));
    });

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
export const getTrainersByOrganizationId = async (req, res) => {
  try {
    const organizationId = req.organization._id;
    // Validate if organization exists
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Find all courses offered by the organization
    const courses = await CourseModel.find({
      organization: organizationId,
    }).populate("instructors", "name email");

    // Extract enrolled students and include course names
    const trainsData = [];
    courses.forEach((course) => {
      course.instructors.forEach((trainer) => {
        trainsData.push({
          trainerId: trainer._id,
          name: trainer.name,
          email: trainer.email,
          phone: trainer.phone,
          courseName: course.courseName,
        });
      });
    });

    // Remove duplicates (in case a trainer is enrolled in multiple courses)
    const uniqueTrainers = trainsData.filter(
      (trainer, index, self) =>
        index ===
        self.findIndex(
          (s) =>
            s.trainerId.equals(trainer.trainerId) &&
            s.courseName === trainer.courseName
        )
    );

    res.status(200).json({
      organization: {
        id: organization._id,
        name: organization.name,
      },
      trainers: uniqueTrainers,
    });
  } catch (error) {
    console.error("Error fetching trainers by organization ID:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching trainers",
        error: error.message,
      });
  }
};

export const addSubAdmin = async (req, res) => {
  try {
    const { email, name } = req.body;
    const organizationId = req.organization?._id;

    if (!email || !organizationId) {
      return res
        .status(400)
        .json({ message: "Invalid or missing 'email' or 'organizationId' in the request body." });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const user = await UserModel.create({
      email,
      name,
      password: "subadmin123", // Default password for sub-admins
      userType: "subadmin",
      organization: organizationId,
    });

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    organization.administrators.push(user._id);
    await organization.save();

    res.status(201).json({ message: "Sub-admin saved successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while adding the sub-admin." });
  }
};

export const addSessionToOrganization = async (req, res) => {
  const { organizationId, name, link, startDate, endDate } = req.body;

  try {
    // Validate required fields
    if (!organizationId || !name || !link || !startDate) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Check if the organization exists
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    // Create a new session
    const session = new SessionModel({
      organization: organizationId,
      name,
      link,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Save the session
    const savedSession = await session.save();

    // Add session to the organization's session list
    organization.sessions.push(savedSession._id);
    await organization.save();

    return res.status(201).json({
      message: "Session added successfully.",
      session: savedSession,
    });
  } catch (error) {
    console.error("Error adding session:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};