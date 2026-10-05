const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const fbAdmin = require('../config/firebaseAdmin');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  user.password = undefined;
  res.status(statusCode).json({ success: true, user });
};

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ name, email, password: hashed });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out.' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// POST /api/auth/firebase
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken, name: clientName } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
    }

    const auth = fbAdmin.getAuth();
    if (!auth) {
      return res.status(500).json({ 
        success: false, 
        message: 'Firebase Admin SDK is not configured. Please check backend/config/serviceAccountKey.json.' 
      });
    }

    // 1. Verify token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (tokenErr) {
      console.error('Firebase Token Verification Failed:', tokenErr.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired Firebase token. Please try again.' 
      });
    }

    const { uid, email, name, picture } = decodedToken;
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Firebase account does not have an associated email address.' 
      });
    }

    const providerId = decodedToken.firebase?.sign_in_provider || 'firebase';
    const authProvider = providerId.includes('google') ? 'google' : 'firebase';
    const displayName = name || clientName || email.split('@')[0];

    // 2. Find or create user in MongoDB
    try {
      let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] });

      if (!user) {
        user = await User.create({
          name: displayName,
          email: email.toLowerCase(),
          firebaseUid: uid,
          avatar: picture || '',
          authProvider,
          tier: 'free'
        });
      } else {
        let modified = false;
        if (!user.firebaseUid) {
          user.firebaseUid = uid;
          modified = true;
        }
        if (picture && !user.avatar) {
          user.avatar = picture;
          modified = true;
        }
        if (user.authProvider === 'local' && authProvider === 'google') {
          user.authProvider = 'google';
          modified = true;
        }
        if (modified) {
          await user.save();
        }
      }

      return sendToken(user, 200, res);
    } catch (dbErr) {
      console.warn('MongoDB Sync Warning (using session fallback):', dbErr.message);
      // Fallback session so user is never blocked
      const fallbackUser = {
        _id: uid,
        name: displayName,
        email: email.toLowerCase(),
        avatar: picture || '',
        authProvider,
        tier: 'free'
      };
      return sendToken(fallbackUser, 200, res);
    }
  } catch (err) {
    console.error('Unhandled Firebase Auth Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication. Please try again.' 
    });
  }
};

