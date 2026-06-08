const express = require('express');
const walletController = require('../controllers/wallet.Controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Base Route: /api/v1/wallets
 */

// Apply the 'protect' middleware to ALL routes in this file.
// This guarantees that no user can access these endpoints without a valid JWT.
router.use(protect);

// Routes for the root path (/api/v1/wallets)
router
  .route('/')
  .get(walletController.getMyWallets)    // READ: Get all wallets for the logged-in user
  .post(walletController.addWallet);     // CREATE: Add a new wallet to the watchlist

// Routes for a specific wallet ID (/api/v1/wallets/:id)
router
  .route('/:id')
  .put(walletController.updateWalletLabel) // UPDATE: Change the label of a tracked wallet
  .delete(walletController.removeWallet);  // DELETE: Remove wallet from the watchlist

module.exports = router;
