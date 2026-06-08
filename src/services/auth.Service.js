const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

/**
 * Generates a JWT for the authenticated user
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super-secret-fallback-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Handles business logic for registering a new user
 */
exports.registerUser = async (email, password, role) => {
  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already in use');
  }

  // 2. Create the user
  const newUser = await User.create({
    email,
    password,
    role: role || 'user',
  });

  // 3. Generate token
  const token = generateToken(newUser._id, newUser.role);

  return { user: newUser, token };
};

/**
 * Handles business logic for user login
 */
exports.loginUser = async (email, password) => {
  // 1. Find user and fetch the hidden password field
  const user = await User.findOne({ email }).select('+password');

  // 2. Validate password
  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new Error('Incorrect email or password');
  }

  // 3. Generate token
  const token = generateToken(user._id, user.role);

  return { user, token };
};
