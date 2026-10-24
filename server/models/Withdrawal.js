const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  organizerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please specify withdrawal amount']
  },
  bankDetails: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
