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
