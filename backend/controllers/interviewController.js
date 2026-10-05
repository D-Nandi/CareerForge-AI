const InterviewSession = require('../models/InterviewSession');
const { generateInterviewQuestions, generateSTARAnswer } = require('../services/aiService');

// POST /api/interview/generate (Anonymous OK)
exports.generateQuestions = async (req, res, next) => {
  try {
    const { companyTier, role, roundType, experienceSnippets, resumeData } = req.body;

    if (!companyTier || !role) {
      return res.status(400).json({
        success: false,
        message: 'companyTier and role are required'
      });
    }

    const data = await generateInterviewQuestions({
      companyTier,
      role,
      roundType: roundType || 'Full Loop',
      experienceSnippets: Array.isArray(experienceSnippets) ? experienceSnippets : (experienceSnippets ? [experienceSnippets] : []),
      resumeData
    });

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/interview/star
exports.generateSTAR = async (req, res, next) => {
  try {
    const { question, situation, task, action, result } = req.body;

    if (!question || !action) {
      return res.status(400).json({
        success: false,
        message: 'question and action are required to synthesize STAR answer'
      });
    }

    const starResult = await generateSTARAnswer({
      question,
      situation,
      task,
      action,
      result
    });

    res.json({
      success: true,
      data: starResult
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/interview/save (Logged-in only)
exports.saveSession = async (req, res, next) => {
  try {
    const { companyTier, role, roundType, companyOverview, interviewFocus, questions } = req.body;

    if (!companyTier || !role) {
      return res.status(400).json({ success: false, message: 'companyTier and role are required' });
    }

    const session = await InterviewSession.create({
      userId: req.user._id,
      companyTier,
      role,
      roundType: roundType || 'Full Loop',
      companyOverview: companyOverview || '',
      interviewFocus: interviewFocus || '',
      questions: questions || []
    });

    res.status(201).json({
      success: true,
      message: 'Interview session saved to your dashboard',
      session
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/interview/my (Logged-in only)
exports.getMySessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/interview/mock/turn
exports.conductMockTurn = async (req, res, next) => {
  try {
    const { role = 'Software Engineer', companyTier = 'Product', roundType = 'Technical', history = [] } = req.body;
    const { conductMockInterviewTurn } = require('../services/aiService');

    const turn = await conductMockInterviewTurn({ role, companyTier, roundType, history });
    res.json({ success: true, turn });
  } catch (err) {
    next(err);
  }
};

// POST /api/interview/mock/evaluate
exports.evaluateMockSession = async (req, res, next) => {
  try {
    const { role = 'Software Engineer', companyTier = 'Product', roundType = 'Technical', history = [] } = req.body;
    const { evaluateMockInterviewSession } = require('../services/aiService');

    const scorecard = await evaluateMockInterviewSession({ role, companyTier, roundType, history });
    res.json({ success: true, scorecard });
  } catch (err) {
    next(err);
  }
};
