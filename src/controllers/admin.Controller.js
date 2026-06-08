const Wallet = require('../models/walletModel');

/**
 * @desc    Get all tracked wallets across the entire system
 * @route   GET /api/v1/admin/wallets
 * @access  Private (Admin Only)
 */
exports.getAllSystemWallets = async (req, res) => {
  try {
    // Fetches all wallets and populates the 'userId' field with the user's email
    // This allows the admin to see WHICH user is tracking WHICH wallet
    const wallets = await Wallet.find().populate({
      path: 'userId',
      select: 'email role'
    });

    res.status(200).json({
      status: 'success',
      results: wallets.length,
      data: { wallets }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Toggle the risk flag (isFlaggedByAdmin) on a specific wallet address
 * @route   PATCH /api/v1/admin/wallets/:id/flag
 * @access  Private (Admin Only)
 */
exports.toggleWalletRiskFlag = async (req, res) => {
  try {
    const { isFlagged } = req.body; // Expected boolean from frontend

    if (typeof isFlagged !== 'boolean') {
      return res.status(400).json({ status: 'fail', message: 'Please provide a boolean value for isFlagged' });
    }

    const wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { isFlaggedByAdmin: isFlagged },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({ status: 'fail', message: 'Wallet not found' });
    }

    res.status(200).json({
      status: 'success',
      message: `Wallet risk status updated to ${isFlagged}`,
      data: { wallet }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
