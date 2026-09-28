const express          = require('express');
const router           = express.Router();
const testController   = require('../controllers/testController');
const generateController = require('../controllers/generateController');

// GET /api/test
router.get('/test', testController.test);

// POST /api/generate
router.post('/generate', generateController.generate);

module.exports = router;
