
import { OrganizationModel } from "../models/organization.schema.js";
import jwt, { decode } from "jsonwebtoken";
import { UserModel } from "../models/user.schema.js";

 const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};


export const authenticateOrganization = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting format "Bearer <token>"
  

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    // Verify the token
    const decoded = verifyToken(token);


    // Check if the token corresponds to an admin userType
    if (decoded.userType !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin user." });
    }

    let user;
    // Find the organization associated with the admin
    const organization = await OrganizationModel.findById(decoded.userId);
    if (!organization) {
       user = await UserModel.findById(decoded.userId);
      if(!user) {
        return res.status(404).json({ message: "User or organization not found" });
      }
    }

    // Attach the organization details to the request object for further use
    if(organization){
    req.organization = organization}
    else{
      req.user = user
    }


    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
