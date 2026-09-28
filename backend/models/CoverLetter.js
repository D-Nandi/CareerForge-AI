const mongoose = require('mongoose');

const CoverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  title: {
    type: String,
    default: 'Untitled Cover Letter',
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'professional',
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('CoverLetter', CoverLetterSchema);
