const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Report = require('../models/Report');
const Withdrawal = require('../models/Withdrawal');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify/Approve Campaign
// @route   PUT /api/admin/verify-campaign/:id
// @access  Private (Admin)
exports.verifyCampaign = async (req, res) => {
  try {
    const { status } = req.body; // active, rejected

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active or rejected' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    campaign.status = status;
    await campaign.save();

    await AuditLog.create({
      action: 'Verify Campaign',
      performedBy: req.user ? req.user.name : 'Admin',
      details: `${status === 'active' ? 'Approved' : 'Rejected'} campaign: "${campaign.title}"`
    });

    res.status(200).json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reported campaigns
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('campaignId', 'title category organizerId status')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report a campaign
// @route   POST /api/admin/reports
// @access  Private (Donor/Organizer)
exports.createReport = async (req, res) => {
  try {
    const { campaignId, reason } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const report = await Report.create({
      campaignId,
      reportedBy: req.user.id,
      reason
    });

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
exports.resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // investigated, resolved

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    await AuditLog.create({
      action: 'Resolve Report',
      performedBy: req.user ? req.user.name : 'Admin',
      details: `Resolved report for campaign ID: ${report.campaignId} as ${status}`
    });

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject withdrawal request
// @route   PUT /api/admin/withdrawals/:id
// @access  Private (Admin)
exports.handleWithdrawal = async (req, res) => {
  try {
    const { status } = req.body; // approved, rejected

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Withdrawal has already been processed' });
    }

    withdrawal.status = status;
    await withdrawal.save();

    // If approved, subtract from campaign raisedAmount or mark withdrawal successful
    if (status === 'approved') {
      const campaign = await Campaign.findById(withdrawal.campaignId);
      if (campaign) {
        campaign.raisedAmount -= withdrawal.amount;
        await campaign.save();
      }
    }

    await AuditLog.create({
      action: 'Handle Withdrawal',
      performedBy: req.user ? req.user.name : 'Admin',
      details: `${status === 'approved' ? 'Approved' : 'Rejected'} payout of $${withdrawal.amount} for campaign ID: ${withdrawal.campaignId}`
    });

    res.status(200).json({
      success: true,
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Block User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalCampaigns = await Campaign.countDocuments({});
    const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const completedCampaigns = await Campaign.countDocuments({ status: 'completed' });

    const donations = await Donation.find({});
    const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const totalDonationsCount = donations.length;

    const reportsCount = await Report.countDocuments({ status: 'pending' });

    // Raised amounts by category
    const categories = ['medical', 'education', 'disaster', 'animal', 'environment', 'community', 'ngo', 'other'];
    const raisedByCategory = {};
    for (let cat of categories) {
      const camps = await Campaign.find({ category: cat });
      raisedByCategory[cat] = camps.reduce((sum, camp) => sum + camp.raisedAmount, 0);
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCampaigns,
        pendingCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalRaised,
        totalDonationsCount,
        reportsCount,
        raisedByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(100);
    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
