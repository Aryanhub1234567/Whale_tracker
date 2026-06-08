/**
 * Custom Input Sanitization & Validation Middleware
 * Keeps request controller pipelines secure and pristine without depending on heavy third-party packages.
 */

// Basic email formatting validator
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Standard EVM (Ethereum / BNB chain / Polygon) crypto address validator
const isValidEVMAddress = (address) => {
  const re = /^0x[a-fA-F0-9]{40}$/;
  return re.test(address);
};

/**
 * Validates payload structures for User Registration
 */
exports.validateRegister = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password are required fields.',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid email address.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password must be at least 8 characters long.',
    });
  }

  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid system role designated.',
    });
  }

  next();
};

/**
 * Validates payload structures for User Login
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Both email and password are required for verification.',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please enter a valid email address format.',
    });
  }

  next();
};

/**
 * Validates payload inputs for tracking standard EVM Wallets
 */
exports.validateWalletPayload = (req, res, next) => {
  const { address, label } = req.body;

  if (!address) {
    return res.status(400).json({
      status: 'fail',
      message: 'Wallet blockchain address field is required.',
    });
  }

  if (!isValidEVMAddress(address)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid EVM crypto address format. Must be an alphanumeric 42-character hex starting with 0x.',
    });
  }

  if (label && label.trim().length > 50) {
    return res.status(400).json({
      status: 'fail',
      message: 'Wallet tracking label must not exceed 50 characters.',
    });
  }

  next();
};
