const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// POST /api/leads
router.post('/', leadController.createLead);

module.exports = router;
