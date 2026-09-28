const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');

// ── If you have an auth middleware, import and apply it: ──
// const protect = require('../middleware/protect');
// router.use(protect);

// ── RESUMES ──
router.post  ('/resumes',      ctrl.saveResume);
router.get   ('/resumes',      ctrl.getResumes);
router.get   ('/resumes/:id',  ctrl.getResume);
router.put   ('/resumes/:id',  ctrl.updateResume);
router.delete('/resumes/:id',  ctrl.deleteResume);

// ── COVER LETTERS ──
router.post  ('/cover-letters',      ctrl.saveCoverLetter);
router.get   ('/cover-letters',      ctrl.getCoverLetters);
router.delete('/cover-letters/:id',  ctrl.deleteCoverLetter);

module.exports = router;
