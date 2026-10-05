const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const requireTier = require('../middleware/requireTier');

// Public roadmap generation (anonymous OK)
router.post('/generate', roadmapController.generateRoadmap);

// User-saved roadmaps & milestone tracking (requires auth)
router.post('/save', protect, roadmapController.saveRoadmap);
router.get('/my', protect, roadmapController.getMyRoadmap);
router.post('/milestone', protect, roadmapController.toggleMilestone);
router.post('/recalibrate', protect, requireTier('pro'), roadmapController.recalibrateRoadmap);

module.exports = router;
