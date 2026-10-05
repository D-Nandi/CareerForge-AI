const Lead = require('../models/Lead');

// POST /api/leads
exports.createLead = async (req, res, next) => {
  try {
    const { email, source, score, metadata } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const lead = await Lead.create({
      email: email.trim().toLowerCase(),
      source: source || 'ats_score',
      score: typeof score === 'number' ? score : undefined,
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      leadId: lead._id
    });
  } catch (err) {
    next(err);
  }
};
