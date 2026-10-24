const express = require('express');
const {
  getUsers,
  verifyCampaign,
  getReports,
  createReport,
  resolveReport,
  handleWithdrawal,
  deleteUser,
  getAdminStats,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin-only routes
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/verify-campaign/:id', protect, authorize('admin'), verifyCampaign);
router.get('/reports', protect, authorize('admin'), getReports);
router.put('/reports/:id', protect, authorize('admin'), resolveReport);
router.put('/withdrawals/:id', protect, authorize('admin'), handleWithdrawal);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

// Report campaign - accessible by any logged-in user
router.post('/reports', protect, createReport);

module.exports = router;
