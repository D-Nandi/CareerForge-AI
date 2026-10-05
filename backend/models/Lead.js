const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  source: {
    type: String,
    required: true,
    default: 'ats_score'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

leadSchema.index({ email: 1, source: 1 });

module.exports = mongoose.model('Lead', leadSchema);
