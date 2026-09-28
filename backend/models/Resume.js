const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  role:        { type: String, default: '' },
  company:     { type: String, default: '' },
  startDate:   { type: String, default: '' },
  endDate:     { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  degree:      { type: String, default: '' },
  institution: { type: String, default: '' },
  startYear:   { type: String, default: '' },
  endYear:     { type: String, default: '' },
  details:     { type: String, default: '' },
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title:    { type: String, default: 'Untitled Resume', trim: true },
  template: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'classic' },
  personal: {
    firstName: { type: String, default: '' },
    lastName:  { type: String, default: '' },
    jobTitle:  { type: String, default: '' },
    email:     { type: String, default: '' },
    phone:     { type: String, default: '' },
    location:  { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    summary:   { type: String, default: '' },
  },
  experience: [ExperienceSchema],
  education:  [EducationSchema],
  skills: {
    tech:      [String],
    soft:      [String],
    languages: [String],
  },
  // backward compatibility with existing saved documents
  formData:             { type: Object, default: null },
  generatedCoverLetter: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
