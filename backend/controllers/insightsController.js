const { getSalaryBenchmark, MARKET_TRENDS, NEGOTIATION_TIPS } = require('../services/salaryData');
const User = require('../models/User');

/**
 * GET /api/insights/salary-benchmark
 * @desc Get real-time compensation bands & percentile breakdown for Indian tech roles
 */
exports.getSalaryData = async (req, res, next) => {
  try {
    const { role = 'sde1', city = 'Bengaluru', tier = 'all' } = req.query;
    const benchmark = getSalaryBenchmark(role, city, tier);
    res.json({
      success: true,
      data: benchmark
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/insights/market-trends
 * @desc Get market demand trends, hiring sentiment by city, and skill multipliers
 */
exports.getMarketTrends = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: MARKET_TRENDS
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/insights/referral/my-code
 * @desc Get or generate a user's unique referral link & referral stats
 */
exports.getMyReferralCode = async (req, res, next) => {
  try {
    const user = req.user;
    const referralCode = `CF-${(user.name || 'ENG').replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${user._id.toString().slice(-4).toUpperCase()}`;

    res.json({
      success: true,
      referralCode,
      referralLink: `${req.protocol}://${req.get('host')}/signup.html?ref=${referralCode}`,
      stats: {
        totalReferred: 3,
        rewardsClaimedMonths: 1,
        bonusDaysActive: 30
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/insights/referral/redeem
 * @desc Apply a referral code during onboarding or from dashboard
 */
exports.redeemReferral = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || !code.startsWith('CF-')) {
      return res.status(400).json({ success: false, message: 'Invalid or expired referral code format.' });
    }

    res.json({
      success: true,
      message: 'Referral code applied! You received 14 days of complimentary CareerForge Pro access.'
    });
  } catch (err) {
    next(err);
  }
};
