const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMySubscription,
  cancelSubscription
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-subscription', protect, getMySubscription);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
