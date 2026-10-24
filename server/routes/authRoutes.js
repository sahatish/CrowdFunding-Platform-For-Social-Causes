const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updateProfile,
  toggleBookmark,
  getBookmarks
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:id', resetPassword);
router.get('/verify/:id', verifyEmail);

router.put('/profile', protect, updateProfile);
router.post('/bookmarks/:campaignId', protect, toggleBookmark);
router.get('/bookmarks', protect, getBookmarks);

module.exports = router;
