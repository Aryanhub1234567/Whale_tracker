/**
 * Express Global Error Handling Middleware
 * Catching all operational and unhandled errors cleanly in one centralized location.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Differentiate between Local/Development and Production environments
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: Limit stack leaks to clients and translate native database errors
    let error = { ...err };
    error.message = err.message;

    // Handle Mongoose/MongoDB specific validation & structural errors
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message || 'Something went wrong on the server.',
    });
  }
};

// 1. Translates invalid Mongoose Database IDs (Cast Errors)
const handleCastErrorDB = (err) => {
  const message = `Invalid value for ${err.path}: ${err.value}.`;
  return createOperationalError(message, 400);
};

// 2. Translates duplicate field insertions (MongoDB index constraints)
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : '';
  const message = `Duplicate value field: ${value}. Please use another value!`;
  return createOperationalError(message, 400);
};

// 3. Formats custom Mongoose validation validation failures cleanly
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return createOperationalError(message, 400);
};

// Helper to convert typical errors to structural operational objects
const createOperationalError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = 'fail';
  return err;
};
