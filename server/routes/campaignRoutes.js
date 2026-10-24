const express = require('express');
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addCampaignUpdate,
  uploadMedia
} = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);

router.post('/', protect, authorize('organizer', 'admin'), createCampaign);
router.put('/:id', protect, authorize('organizer', 'admin'), updateCampaign);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteCampaign);
router.post('/:id/updates', protect, authorize('organizer', 'admin'), addCampaignUpdate);

// Media Upload route
router.post('/upload', protect, authorize('organizer', 'admin'), upload.single('media'), uploadMedia);

module.exports = router;
