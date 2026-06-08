const express = require('express');
const adminController = require('../controllers/admin.Controller');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Base Route: /api/v1/admin
 */

// Apply both 'protect' (must be logged in) AND 'restrictTo' (must be admin)
// to every route in this file. This fulfills the Role-Based Access requirement perfectly.
router.use(protect, restrictTo('admin'));

// GET /api/v1/admin/wallets - Fetch all tracked wallets across the entire system
router.get('/wallets', adminController.getAllSystemWallets);

// PATCH /api/v1/admin/wallets/:id/flag - Toggle the risk flag on a specific wallet address
router.patch('/wallets/:id/flag', adminController.toggleWalletRiskFlag);

module.exports = router;
