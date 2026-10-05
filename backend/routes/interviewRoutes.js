const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// Public question generation & STAR synthesis
router.post('/generate', interviewController.generateQuestions);
router.post('/star', interviewController.generateSTAR);
router.post('/mock/turn', interviewController.conductMockTurn);
router.post('/mock/evaluate', interviewController.evaluateMockSession);

// User-saved sessions (requires auth)
router.post('/save', protect, interviewController.saveSession);
router.get('/my', protect, interviewController.getMySessions);

module.exports = router;
