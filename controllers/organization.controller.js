import { OrganizationModel } from "../models/organization.schema.js";
import { CourseModel } from "../models/course.schema.js";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.schema.js";


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
      return res.status(400).json({ message: "All required fields must be provided." });
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
  const { name, description, address, contactEmail, contactPhone, website, establishedYear, logo } = req.body;

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
      return res.status(404).json({ message: 'Organization not found.' });
    }

    res.status(200).json({ message: 'Organization updated successfully.', organization: updatedOrganization });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Failed to update organization.', error });
  }
};


export const getAllCoursesByOrganization = async (req, res) => {
  try {
    // Extract and verify the token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;

    // Find the organization
    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Fetch courses for the organization with only the required fields
    const courses = await CourseModel.find({ organization: organizationId })
      .select("courseName startDate enrolledStudents instructors _id")
      .populate("enrolledStudents", "_id") // To count total students if needed
      .populate("instructors", "contactPhone"); // Assuming instructors' numbers are stored in `contactPhone`

    // Format the data
    const formattedCourses = courses.map((course) => ({
      id:course.id,
      name: course.courseName,
      totalStudents: course.enrolledStudents?.length || 0,
      trainerNumber: course.instructors?.map((instructor) => instructor.contactPhone) || [],
      startDate: course.startDate,
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
      return res.status(401).json({ message: "Authorization token is required" });
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
      organization: organizationId // Trainers associated with the organization
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
      return res.status(401).json({ message: "Authorization token is required" });
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
    const ongoingCourses = courses.filter(course => course.status === "ongoing").length;
    const endedCourses = courses.filter(course => course.status === "ended").length;
    const upcomingCourses = courses.filter(course => course.status === "upcoming").length;

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

export const getStudentsByOrganization = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");
    const organizationId = decoded.userId;


    // Validate the organization ID
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // Fetch all courses for the given organization ID
    const courses = await CourseModel.find({ organization: organizationId });

    if (!courses.length) {
      return res.status(404).json({
        success: true,
        data: {
          totalStudents: 0,
          activeStudents: 0,
          passoutStudents: 0,
          newlyJoinedStudents: 0,
        },
        message: "No courses found for the specified organization",
      });
    }

    // Extract course IDs
    const courseIds = courses.map(course => course._id);

    // Fetch all students enrolled in these courses
    const students = await UserModel.find({ enrolledCourses: { $in: courseIds } });

    if (!students.length) {
      return res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          activeStudents: 0,
          passoutStudents: 0,
          newlyJoinedStudents: 0,
        },
        message: "No students found for this organization",
      });
    }

    // Initialize counters
    let activeStudents = 0;
    let passoutStudents = 0;
    let newlyJoinedStudents = 0;

    // Categorize students based on course status
    for (const student of students) {
      for (const courseId of student.enrolledCourses) {
        const course = courses.find(c => c._id.toString() === courseId.toString());
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

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        totalStudents: students.length,
        activeStudents,
        passoutStudents,
        newlyJoinedStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching students by organization ID:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching students",
      error: error.message,
    });
  }
};
