const Campaign = require('../models/Campaign');
const User = require('../models/User');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
exports.getCampaigns = async (req, res) => {
  try {
        const { category, search, status, organizerId } = req.query;
    let query = {};

    // Filter by status (default to active for visitors, unless admin/organizer requests otherwise)
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = 'active'; // Public visitors only see approved, active campaigns
    }

    // Filter by organizer if specified
    if (organizerId) {
      query.organizerId = organizerId;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Text search on title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('organizerId', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('organizerId', 'name email profileImage phone isVerified');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.status(200).json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private (Organizer/Admin)
exports.createCampaign = async (req, res) => {
  try {
    // Add organizer to req.body
    req.body.organizerId = req.user.id;

    // Default status is pending verification
    req.body.status = 'pending';

    const campaign = await Campaign.create(req.body);

    res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Organizer/Admin)
exports.updateCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Make sure user is campaign organizer or admin
    if (campaign.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this campaign`
      });
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Organizer/Admin)
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Make sure user is campaign organizer or admin
    if (campaign.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this campaign`
      });
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add update/progress report to campaign
// @route   POST /api/campaigns/:id/updates
// @access  Private (Organizer)
exports.addCampaignUpdate = async (req, res) => {
  try {
    const { title, content } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check ownership
    if (campaign.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this campaign' });
    }

    // Add update
    campaign.updates.unshift({ title, content });
    await campaign.save();

    res.status(200).json({
      success: true,
      updates: campaign.updates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload campaign media (cover image or verification docs)
// @route   POST /api/campaigns/upload
// @access  Private (Organizer/Admin)
exports.uploadMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  // Create a URL for the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    fileUrl
  });
};
