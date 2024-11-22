import jwt from "jsonwebtoken";
import adminSchema from "../models/admin.schema";

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from the request headers
    const token = req.headers.authorization?.split(' ')[1]; // Expected format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have a JWT_SECRET in your environment variables

    // Find the admin by ID from the token payload
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Check if the user is an admin
    if (!admin.admin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Attach admin info to the request object for further use
    req.admin = admin;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyAdmin;
