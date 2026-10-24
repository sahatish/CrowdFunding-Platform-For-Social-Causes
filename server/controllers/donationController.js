const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const Withdrawal = require('../models/Withdrawal');
const { sendEmail } = require('../services/emailService');

// @desc    Make a donation
// @route   POST /api/donations
// @access  Public (Optional auth for donorId)
exports.donate = async (req, res) => {
  try {
    const { campaignId, amount, message, anonymous, paymentMethod, donorName } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Campaign is not active' });
    }

    // Prepare payment ID (Simulating Stripe/Razorpay transaction ID)
    const txId = `${paymentMethod === 'stripe' ? 'ch_' : 'pay_'}${Math.random().toString(36).substr(2, 9)}`;

    // Create donation record
    const donation = await Donation.create({
      campaignId,
      donorId: req.user ? req.user.id : null,
      donorName: anonymous ? 'Anonymous' : (donorName || (req.user ? req.user.name : 'Guest Donor')),
      amount: Number(amount),
      paymentId: txId,
      paymentStatus: 'completed',
      message: message || '',
      anonymous: anonymous || false
    });

    // Update campaign raisedAmount
    campaign.raisedAmount += Number(amount);
    if (campaign.raisedAmount >= campaign.goalAmount) {
      campaign.status = 'completed';
    }
    await campaign.save();

    // Send confirmation email if email is available (from logged-in user or input)
    const emailTo = req.user ? req.user.email : null;
    if (emailTo) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #0d9488;">Thank You for Your Generous Donation!</h2>
          <p>Hi ${req.user.name},</p>
          <p>We are delighted to confirm your donation of <strong>$${amount}</strong> to the campaign: <strong>"${campaign.title}"</strong>.</p>
          <p>Your support makes a huge difference in supporting genuine social causes.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Receipt ID:</strong> ${donation._id}</p>
            <p style="margin: 4px 0;"><strong>Transaction ID:</strong> ${txId}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> $${amount}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(donation.donatedAt).toLocaleDateString()}</p>
          </div>
          <p>You can view and print your full tax exemption/donation receipt via your dashboard.</p>
          <p style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px;">
            Crowdfunding Platform for Social Causes. Thank you for making a difference.
          </p>
        </div>
      `;

      await sendEmail({
        email: emailTo,
        subject: 'Donation Receipt Confirmation',
        html: emailHtml
      });
    }

    res.status(201).json({
      success: true,
      donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donations
// @route   GET /api/donations
// @access  Private / Public depending on query
exports.getDonations = async (req, res) => {
  try {
    const { campaignId, donorId } = req.query;
    let query = {};

    if (campaignId) {
      query.campaignId = campaignId;
    }

    if (donorId) {
      query.donorId = donorId;
    }

    // If query has no filters, check if requester is Admin
    if (!campaignId && !donorId) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to fetch all donations' });
      }
    }

    const donations = await Donation.find(query)
      .populate('campaignId', 'title category organizerId')
      .populate('donorId', 'name email')
      .sort({ donatedAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donation receipt HTML for printing
// @route   GET /api/donations/receipt/:id
// @access  Public / Private
exports.getReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('campaignId', 'title category description')
      .populate('donorId', 'name email');

    if (!donation) {
      return res.status(404).send('<h1>Receipt not found</h1>');
    }

    // Return dynamic receipt page for print/download
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Receipt - ${donation._id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
          .receipt-container { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border-radius: 8px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #0d9488; margin: 0; font-size: 28px; }
          .meta-info { margin-bottom: 30px; }
          .meta-info table { width: 100%; border-collapse: collapse; }
          .meta-info td { padding: 8px 0; }
          .meta-info td.label { font-weight: bold; color: #666; width: 150px; }
          .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .details-table th { background-color: #f4f4f5; text-align: left; padding: 12px; font-weight: bold; border-bottom: 1px solid #ddd; }
          .details-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .total { font-size: 20px; font-weight: bold; color: #0d9488; text-align: right; margin-top: 20px; }
          .footer { text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; }
          .btn-print { background-color: #0d9488; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
          @media print {
            .btn-print { display: none; }
            body { margin: 0; }
            .receipt-container { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: auto; text-align: right;">
          <button class="btn-print" onclick="window.print()">Print Receipt</button>
        </div>
        <div class="receipt-container">
          <div class="header">
            <div>
              <h1>CROWDFUNDING FOR SOCIAL CAUSES</h1>
              <p style="margin: 5px 0 0 0; color: #666;">Empowering NGOs, Charities, and Individuals</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #333;">DONATION RECEIPT</h3>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Date: ${new Date(donation.donatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="meta-info">
            <table>
              <tr>
                <td class="label">Receipt No:</td>
                <td>REC-${donation._id}</td>
              </tr>
              <tr>
                <td class="label">Transaction ID:</td>
                <td>${donation.paymentId}</td>
              </tr>
              <tr>
                <td class="label">Donor Name:</td>
                <td>${donation.donorName}</td>
              </tr>
              <tr>
                <td class="label">Donor Email:</td>
                <td>${donation.donorId ? donation.donorId.email : 'N/A (Guest / Anonymous)'}</td>
              </tr>
            </table>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Cause Description / Campaign Title</th>
                <th style="text-align: right; width: 150px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${donation.campaignId.title}</strong><br/>
                  <span style="font-size: 12px; color: #666;">Category: ${donation.campaignId.category.toUpperCase()}</span>
                </td>
                <td style="text-align: right; font-weight: bold;">$${donation.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Contribution: $${donation.amount.toFixed(2)}
          </div>

          <div style="margin-top: 40px; font-size: 14px; color: #555;">
            <p><strong>Note:</strong> This is a computer-generated transaction receipt confirming your donation. 
            Your support will go directly to funding genuine efforts and activities for the selected cause.</p>
          </div>

          <div class="footer">
            <p>Thank you for your generous contribution. We appreciate your kindness and trust.</p>
            <p>© ${new Date().getFullYear()} Crowdfunding Platform for Social Causes. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`<h1>Error generating receipt: ${error.message}</h1>`);
  }
};

// @desc    Request fund withdrawal
// @route   POST /api/donations/withdraw
// @access  Private (Organizer)
exports.requestWithdrawal = async (req, res) => {
  try {
    const { campaignId, amount, bankDetails } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Verify ownership
    if (campaign.organizerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to request withdrawal for this campaign' });
    }

    // Check balance
    const availableAmount = campaign.raisedAmount;
    if (amount > availableAmount) {
      return res.status(400).json({ success: false, message: `Insufficient funds. Maximum available is $${availableAmount}` });
    }

    const withdrawal = await Withdrawal.create({
      campaignId,
      organizerId: req.user.id,
      amount,
      bankDetails,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get withdrawal requests
// @route   GET /api/donations/withdrawals
// @access  Private (Organizer/Admin)
exports.getWithdrawals = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'organizer') {
      query.organizerId = req.user.id;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('campaignId', 'title category goalAmount raisedAmount')
      .populate('organizerId', 'name email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
