const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a campaign title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a campaign description']
  },
  category: {
    type: String,
    required: [true, 'Please select a campaign category'],
    enum: [
      'medical',
      'education',
      'disaster',
      'animal',
      'environment',
      'community',
      'ngo',
      'other'
    ]
  },
  goalAmount: {
    type: Number,
    required: [true, 'Please add a fundraising goal amount']
  },
  raisedAmount: {
    type: Number,
    default: 0
  },
  coverImage: {
    type: String,
    required: [true, 'Please add a campaign cover image']
  },
  documents: [
    {
      type: String
    }
  ],
  organizerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'completed'],
    default: 'pending'
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify a campaign deadline']
  },
  location: {
    type: String,
    required: [true, 'Please specify a campaign location']
  },
  updates: [
    {
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
