const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, select: false },
  firebaseUid:  { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google', 'firebase'], default: 'local' },
  avatar:       { type: String, default: '' },
  tier:         { type: String, enum: ['free', 'pro', 'career_plus'], default: 'free' },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
