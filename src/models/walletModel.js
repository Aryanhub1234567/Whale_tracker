const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, 'A wallet address is required to track'],
      trim: true,
      validate: {
        // Validates that it follows standard EVM (Ethereum, BSC, Polygon) hex-address structure
        validator: function (val) {
          return /^0x[a-fA-F0-9]{40}$/.test(val);
        },
        message: 'Please provide a valid EVM wallet address starting with 0x (42 characters)',
      },
    },
    label: {
      type: String,
      required: [true, 'Please provide an identifiable label for this wallet'],
      trim: true,
      maxlength: [50, 'Label cannot exceed 50 characters'],
      default: 'Unnamed Whale',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A tracked wallet must belong to an authenticated user'],
    },
    isFlaggedByAdmin: {
      type: Boolean,
      default: false, // Flagged status managed purely by Admin users
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters'],
    },
  },
  {
    timestamps: true,
  }
);


walletSchema.index({ userId: 1, address: 1 }, { unique: true });

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
