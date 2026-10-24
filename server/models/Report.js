const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please explain the reason for reporting this campaign'],
    trim: true,
    minlength: [10, 'Reason details must be at least 10 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'investigated', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
