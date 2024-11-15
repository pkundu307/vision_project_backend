import { OrganizationModel } from "../models/organization.schema";

import { OrganizationModel } from '../models/organizationModel.js'; // Adjust path as necessary

// Controller to create a new organization
export const createOrganization = async (req, res) => {
  const { name, description, address, contactEmail, contactPhone, website, establishedYear, logo } = req.body;

  try {
    // Check if an organization with the same name already exists
    const existingOrg = await OrganizationModel.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization with this name already exists.' });
    }

    // Create a new organization document
    const organization = new OrganizationModel({
      name,
      description,
      address,
      contactEmail,
      contactPhone,
      website,
      establishedYear,
      logo,
    });

    // Save the organization to the database
    const savedOrganization = await organization.save();
    res.status(201).json({ message: 'Organization created successfully.', organization: savedOrganization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Failed to create organization.', error });
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
