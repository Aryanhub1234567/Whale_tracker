const Wallet = require('../models/walletModel');

/**
 * Fetches all wallets for a specific user
 */
exports.getWalletsByUser = async (userId) => {
  return await Wallet.find({ userId });
};

/**
 * Adds a new wallet to the user's watchlist with duplicate checking
 */
exports.addWalletToWatchlist = async (userId, address, label) => {
  // Check for duplicates
  const existingWallet = await Wallet.findOne({ address, userId });
  if (existingWallet) {
    throw new Error('You are already tracking this wallet');
  }

  // Create new tracked wallet
  const newWallet = await Wallet.create({
    address,
    label,
    userId
  });

  return newWallet;
};

/**
 * Updates a wallet label ensuring ownership
 */
exports.updateUserWallet = async (userId, walletId, label) => {
  const wallet = await Wallet.findOneAndUpdate(
    { _id: walletId, userId: userId },
    { label },
    { new: true, runValidators: true }
  );

  if (!wallet) {
    throw new Error('Wallet not found or permission denied');
  }

  return wallet;
};

/**
 * Deletes a wallet ensuring ownership
 */
exports.removeUserWallet = async (userId, walletId) => {
  const wallet = await Wallet.findOneAndDelete({ _id: walletId, userId: userId });

  if (!wallet) {
    throw new Error('Wallet not found or permission denied');
  }

  return wallet;
};
