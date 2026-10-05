const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, enum: ['DSA', 'System Design', 'Behavioral', 'HR'], required: true },
  question: { type: String, required: true },
  hint: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  practiced: { type: Boolean, default: false },
  userNotes: { type: String, default: '' },
  starAnswer: {
    situation: { type: String, default: '' },
    task: { type: String, default: '' },
    action: { type: String, default: '' },
    result: { type: String, default: '' },
    polishedAnswer: { type: String, default: '' }
  }
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyTier: {
    type: String,
    enum: ['FAANG', 'Unicorn', 'Product', 'IT Services', 'Startup'],
    required: true
  },
  role: { type: String, required: true },
  roundType: { type: String, default: 'Full Loop' },
  companyOverview: { type: String, default: '' },
  interviewFocus: { type: String, default: '' },
  questions: [questionSchema]
}, { timestamps: true });

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
