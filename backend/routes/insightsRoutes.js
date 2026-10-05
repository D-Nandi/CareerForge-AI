const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');
const { protect } = require('../middleware/authMiddleware');

// Public Salary Benchmark & Market Trends
router.get('/salary-benchmark', insightsController.getSalaryData);
router.get('/market-trends', insightsController.getMarketTrends);

// Referral Program
router.get('/referral/my-code', protect, insightsController.getMyReferralCode);
router.post('/referral/redeem', protect, insightsController.redeemReferral);

module.exports = router;
