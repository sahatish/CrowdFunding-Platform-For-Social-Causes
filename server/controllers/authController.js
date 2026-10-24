const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { sendEmail } = require('../services/emailService');

// Helper to sign JWT token and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_987654321',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      isVerified: user.isVerified
    }
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || 'donor', // donor, organizer, admin
      phone: phone || '',
      isVerified: role === 'admin' // Admins auto-verified, others can be verified later
    });

    // Send verification email (simulated or real)
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${user._id}`;
    const emailHtml = `
      <h1>Email Verification</h1>
      <p>Thank you for registering on the Crowdfunding Platform for Social Causes.</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify your account',
      html: emailHtml
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Simulating token resetting
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${user._id}`;
    const emailHtml = `
      <h1>Reset Password Request</h1>
      <p>We received a request to reset your password. Please click the link below to set a new password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Reset your password',
      html: emailHtml
    });

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:id
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email Link
// @route   GET /api/auth/verify/:id
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('<h1>User not found</h1>');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
        <h1 style="color: #10b981;">Email Verified Successfully!</h1>
        <p>Your account is now verified. You can close this window and log in to the application.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<h1>Verification failed: ${error.message}</h1>`);
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Campaign Bookmark
// @route   POST /api/auth/bookmarks/:campaignId
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const campaignId = req.params.campaignId;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const idx = user.bookmarks.indexOf(campaignId);
    if (idx > -1) {
      user.bookmarks.splice(idx, 1);
    } else {
      user.bookmarks.push(campaignId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Bookmarked Campaigns
// @route   GET /api/auth/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'organizerId', select: 'name email profileImage' }
    });

    res.status(200).json({
      success: true,
      count: user.bookmarks.length,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
