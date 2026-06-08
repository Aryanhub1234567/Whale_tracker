const express = require('express');
const authController = require('../controllers/auth.Controller');

// Initialize the Express router
const router = express.Router();

/**
 * Base Route: /api/v1/auth
 */

// POST /api/v1/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/v1/auth/login - Authenticate user and get JWT
router.post('/login', authController.login);

module.exports = router;
