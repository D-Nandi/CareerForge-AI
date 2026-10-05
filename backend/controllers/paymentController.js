const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Pricing table (in INR and paise)
const PRICING_TABLE = {
  pro: {
    monthly: { inr: 299, paise: 29900, durationDays: 30, label: 'Pro Monthly' },
    annual:  { inr: 1999, paise: 199900, durationDays: 365, label: 'Pro Annual (Save 44%)' }
  },
  career_plus: {
    monthly: { inr: 549, paise: 54900, durationDays: 30, label: 'Career+ Monthly' },
    annual:  { inr: 3499, paise: 349900, durationDays: 365, label: 'Career+ Annual (Save 47%)' }
  }
};

/**
 * Initializes Razorpay instance if keys are available in environment
 */
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && !key_id.includes('placeholder')) {
    return new Razorpay({ key_id, key_secret });
  }
  return null;
}

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay Order for a tier upgrade
 * @access  Protected
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { tier = 'pro', billingCycle = 'annual' } = req.body;

    if (!PRICING_TABLE[tier]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription tier selected.' });
    }

    const plan = PRICING_TABLE[tier][billingCycle];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid billing cycle.' });
    }

    const rzp = getRazorpayInstance();

    if (rzp) {
      // Live or Test Razorpay API order creation
      const options = {
        amount: plan.paise,
        currency: 'INR',
        receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now().toString().slice(-6)}`,
        notes: {
          userId: req.user._id.toString(),
          userEmail: req.user.email,
          tier,
          billingCycle
        }
      };

      const order = await rzp.orders.create(options);

      return res.json({
        success: true,
        orderId: order.id,
        amount: plan.paise,
        amountInRupees: plan.inr,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        tier,
        billingCycle,
        isSimulated: false,
        user: {
          name: req.user.name,
          email: req.user.email
        }
      });
    }

    // Graceful Simulation Mode if keys are not yet configured in .env
    const simulatedOrderId = `order_sim_${Date.now()}`;
    return res.json({
      success: true,
      orderId: simulatedOrderId,
      amount: plan.paise,
      amountInRupees: plan.inr,
      currency: 'INR',
      keyId: 'rzp_test_simulated',
      tier,
      billingCycle,
      isSimulated: true,
      message: 'Razorpay keys not configured; running in seamless simulated development mode.',
      user: {
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature & upgrade user tier
 * @access  Protected
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      tier = 'pro',
      billingCycle = 'annual',
      isSimulated = false
    } = req.body;

    const plan = PRICING_TABLE[tier]?.[billingCycle];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
    }

    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

    // Signature verification for live/test Razorpay payments
    if (!isSimulated && rzpSecret) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification parameters missing.' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', rzpSecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
      }
    }

    // Upgrade User tier
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.tier = tier;
    await user.save();

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Cancel prior active subscriptions
    await Subscription.updateMany(
      { userId: user._id, status: 'active' },
      { status: 'cancelled' }
    );

    // Record new subscription
    const newSubscription = await Subscription.create({
      userId: user._id,
      tier,
      billingCycle,
      amount: plan.inr,
      currency: 'INR',
      status: 'active',
      razorpayOrderId: razorpayOrderId || `order_sim_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_sim_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'simulated_signature',
      startDate,
      endDate
    });

    return res.json({
      success: true,
      message: `🎉 Congratulations! Your plan has been upgraded to ${tier === 'career_plus' ? 'Career+' : 'Pro'}.`,
      tier: user.tier,
      subscription: {
        id: newSubscription._id,
        tier: newSubscription.tier,
        billingCycle: newSubscription.billingCycle,
        amount: newSubscription.amount,
        currency: newSubscription.currency,
        status: newSubscription.status,
        startDate: newSubscription.startDate,
        endDate: newSubscription.endDate
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/payments/my-subscription
 * @desc    Fetch active plan & billing info for the logged-in user
 * @access  Protected
 */
exports.getMySubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const activeSub = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    const pastSubscriptions = await Subscription.find({
      userId: req.user._id
    }).sort({ createdAt: -1 }).limit(10);

    return res.json({
      success: true,
      tier: user.tier || 'free',
      subscription: activeSub || null,
      history: pastSubscriptions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/payments/cancel
 * @desc    Cancel active subscription renewal
 * @access  Protected
 */
exports.cancelSubscription = async (req, res, next) => {
  try {
    const activeSub = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!activeSub) {
      return res.status(404).json({ success: false, message: 'No active subscription found.' });
    }

    activeSub.status = 'cancelled';
    await activeSub.save();

    return res.json({
      success: true,
      message: 'Subscription cancelled. You will retain access until the end of your billing period.',
      subscription: activeSub
    });
  } catch (err) {
    next(err);
  }
};
