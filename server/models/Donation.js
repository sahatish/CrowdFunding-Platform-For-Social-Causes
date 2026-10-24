const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  donorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null // Can be null if anonymous or visitor
  },
  donorName: {
    type: String,
    default: 'Anonymous'
  },
  amount: {
    type: Number,
    required: [true, 'Please add a donation amount']
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  donatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', DonationSchema);
