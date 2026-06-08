const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust path if necessary

// Helper function to generate JWT
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super-secret-fallback-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email is already in use' });
    }

    // 3. Create user (Password hashing is handled by Mongoose pre-save hook in userModel)
    const newUser = await User.create({
      email,
      password,
      role: role || 'user', // Defaults to 'user' if not provided
    });

    // 4. Generate Token
    const token = signToken(newUser._id, newUser.role);

    // 5. Send Response (excluding the password)
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Login a user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    // 2. Find user and explicitly select the password field (since it is select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    // 3. Check if user exists && password is correct (assuming you have a comparePassword method on your user schema)
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // 4. Generate Token
    const token = signToken(user._id, user.role);

    // 5. Send Response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
