const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Authentication Guard: Verifies the JWT sent in the Authorization Header
 * and attaches the authenticated user to the request object (req.user).
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from HTTP Authorization Header (Bearer Token pattern)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.',
      });
    }

    // 3. Verify token authenticity
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super-secret-fallback-key'
    );

    // 4. Verify if the user associated with the token still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 5. Grant access to protected route by saving user object on the req
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid authorization token. Please log in again.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your session has expired. Please log in again.',
      });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Role-Based Access Control (RBAC) Guard: Restricts access to specific user roles.
 * Must be mounted AFTER 'protect' middleware so req.user is populated.
 * @param {...string} roles - List of allowed roles (e.g. 'admin', 'moderator')
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // If the authenticated user's role is not included in the allowed roles list, block access
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};
