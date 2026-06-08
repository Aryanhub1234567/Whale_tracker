const Wallet = require('../models/walletModel');

/**
 * @desc    Get all wallets tracked by the logged-in user
 * @route   GET /api/v1/wallets
 * @access  Private (User)
 */
exports.getMyWallets = async (req, res) => {
  try {
    // Only fetch wallets that belong to the user ID decoded from the JWT
    const wallets = await Wallet.find({ userId: req.user.id });

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
 * @desc    Add a new wallet to the user's watchlist
 * @route   POST /api/v1/wallets
 * @access  Private (User)
 */
exports.addWallet = async (req, res) => {
  try {
    const { address, label } = req.body;

    if (!address) {
      return res.status(400).json({ status: 'fail', message: 'Wallet address is required' });
    }

    // Check if user is already tracking this exact wallet (Compound logic)
    const existingWallet = await Wallet.findOne({ address, userId: req.user.id });
    if (existingWallet) {
      return res.status(400).json({ status: 'fail', message: 'You are already tracking this wallet' });
    }

    const newWallet = await Wallet.create({
      address,
      label,
      userId: req.user.id // Attach the user ID from the protected JWT route
    });

    res.status(201).json({
      status: 'success',
      data: { wallet: newWallet }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Update a tracked wallet's label
 * @route   PUT /api/v1/wallets/:id
 * @access  Private (User)
 */
exports.updateWalletLabel = async (req, res) => {
  try {
    const { label } = req.body;

    // Find the wallet by ID AND ensure the logged-in user owns it
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { label },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({ status: 'fail', message: 'Wallet not found or you do not have permission to edit it' });
    }

    res.status(200).json({
      status: 'success',
      data: { wallet }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Remove a wallet from the watchlist
 * @route   DELETE /api/v1/wallets/:id
 * @access  Private (User)
 */
exports.removeWallet = async (req, res) => {
  try {
    // Find the wallet by ID AND ensure the logged-in user owns it before deleting
    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!wallet) {
      return res.status(404).json({ status: 'fail', message: 'Wallet not found or you do not have permission to delete it' });
    }

    // 204 means "No Content", which is the standard REST status code for a successful deletion
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
