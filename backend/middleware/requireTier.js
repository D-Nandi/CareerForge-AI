// middleware/requireTier.js
const TIER_HIERARCHY = { free: 0, pro: 1, career_plus: 2 };

module.exports = (requiredTier) => (req, res, next) => {
  const userTier = req.user?.tier || 'free';
  const userTierLevel = TIER_HIERARCHY[userTier] !== undefined ? TIER_HIERARCHY[userTier] : 0;
  const requiredTierLevel = TIER_HIERARCHY[requiredTier] !== undefined ? TIER_HIERARCHY[requiredTier] : 0;

  if (userTierLevel >= requiredTierLevel) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'upgrade_required',
    requiredTier,
    currentTier: userTier,
    feature: req.originalUrl || req.path
  });
};
