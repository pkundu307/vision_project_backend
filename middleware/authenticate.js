import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
  // Get token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the secret key (same key used to generate the token)
    const decoded = jwt.verify(token, "pkpkpkpkpkpkpkpkpkpkpk");

    // Attach the userId from the decoded token to the request object
    req.user = { userId: decoded.userId, userType: decoded.userType };

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authenticateUser;
