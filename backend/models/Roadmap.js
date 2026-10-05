const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  phase: { type: Number, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  url: { type: String, default: '' },
  duration: { type: String, default: '' },
  relevance: { type: String, default: 'High' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  techStack: [{ type: String }],
  description: { type: String, required: true },
  duration: { type: String, default: '' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' }
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  phaseNumber: { type: Number, required: true },
  label: { type: String, required: true },
  duration: { type: String, required: true },
  focus: { type: String, required: true },
  skills: [{ type: String }],
  certifications: [certificationSchema],
  projects: [projectSchema],
  resumeImpact: { type: String, default: '' }
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  currentRole: { type: String, default: 'Fresher / CS Graduate' },
  targetRole: { type: String, required: true },
  experienceLevel: {
    type: String,
    enum: ['fresher', '1-3', '4-7', '7+'],
    required: true
  },
  timeline: { type: String, default: '6 months' },
  profileScore: { type: Number, min: 0, max: 100, default: 60 },
  readinessSummary: { type: String, default: '' },
  phases: [phaseSchema],
  milestones: [milestoneSchema]
}, { timestamps: true });

roadmapSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
