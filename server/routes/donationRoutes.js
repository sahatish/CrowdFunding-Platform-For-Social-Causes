const express = require('express');
const {
  donate,
  getDonations,
  getReceipt,
  requestWithdrawal,
  getWithdrawals
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public donation can be made as guest or logged in user
router.post('/', (req, res, next) => {
  // If Authorization header is present, use protect middleware before calling donate
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, donate);

router.get('/', protect, getDonations);
router.get('/receipt/:id', getReceipt);
router.post('/withdraw', protect, authorize('organizer'), requestWithdrawal);
router.get('/withdrawals', protect, authorize('organizer', 'admin'), getWithdrawals);

module.exports = router;
