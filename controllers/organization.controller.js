import { OrganizationModel } from "../models/organization.schema";

import { OrganizationModel } from '../models/organizationModel.js'; // Adjust path as necessary

// Controller to create a new organization
import { OrganizationModel } from '../models/organization.js'; // Adjust the path based on your file structure

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
    } = req.body;

    // Validate required fields
    if (!name || !description || !address || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
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
    });

    // Save the organization to the database
    const savedOrganization = await organization.save();

    return res.status(201).json({
      message: 'Organization created successfully.',
      organization: savedOrganization,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({
      message: 'An error occurred while creating the organization.',
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
