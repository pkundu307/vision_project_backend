import { AdminModel } from '../models/admin.schema.js';
import bcrypt from 'bcrypt';

// Create Admin Controller
export const createAdmin = async (req, res) => {
  try {
    const { name, organizationName, password, email, admin } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new AdminModel({
      name,
      organizationName,
      password: hashedPassword,
      email,
      admin, // Optional: Defaults to false if not provided
    });

    // Save the admin to the database
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully!', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin.', error: error.message });
  }
};

// Update Admin Controller
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, organizationName, password, email, admin } = req.body;

    // Find the admin by ID
    const existingAdmin = await AdminModel.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Update fields if provided
    if (name) existingAdmin.name = name;
    if (organizationName) existingAdmin.organizationName = organizationName;
    if (email) existingAdmin.email = email;
    if (admin !== undefined) existingAdmin.admin = admin; // Check for boolean explicitly

    // Hash the new password if provided
    if (password) {
      existingAdmin.password = await bcrypt.hash(password, 10);
    }

    // Save the updated admin
    await existingAdmin.save();

    res.status(200).json({ message: 'Admin updated successfully!', admin: existingAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin.', error: error.message });
  }
};
