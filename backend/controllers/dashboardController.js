const Resume      = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');

// ══════════════════════════════════════════════════════
//  RESUMES
// ══════════════════════════════════════════════════════

// POST /api/dashboard/resumes
exports.saveResume = async (req, res, next) => {
  try {
    const { title, template, personal, experience, education, skills } = req.body;

    const autoTitle = title ||
      [personal?.firstName, personal?.lastName].filter(Boolean).join(' ') +
      (personal?.jobTitle ? ` — ${personal.jobTitle}` : '') ||
      'Untitled Resume';

    const resume = await Resume.create({
      userId:     req.user?._id || null,
      title:      autoTitle,
      template:   template || 'classic',
      personal:   personal || {},
      experience: experience || [],
      education:  education  || [],
      skills:     skills     || { tech: [], soft: [], languages: [] },
    });

    res.status(201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/resumes
exports.getResumes = async (req, res, next) => {
  try {
    const filter = req.user ? { userId: req.user._id } : {};
    const resumes = await Resume.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, resumes });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/resumes/:id
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

// PUT /api/dashboard/resumes/:id
exports.updateResume = async (req, res, next) => {
  try {
    const { title, template, personal, experience, education, skills } = req.body;

    const update = {};
    if (title)      update.title      = title;
    if (template)   update.template   = template;
    if (personal)   update.personal   = personal;
    if (experience) update.experience = experience;
    if (education)  update.education  = education;
    if (skills)     update.skills     = skills;

    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/dashboard/resumes/:id
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    // cascade-delete linked cover letters
    await CoverLetter.deleteMany({ resumeId: req.params.id });

    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════
//  COVER LETTERS
// ══════════════════════════════════════════════════════

// POST /api/dashboard/cover-letters
exports.saveCoverLetter = async (req, res, next) => {
  try {
    const { content, targetRole, tone, resumeId, title } = req.body;

    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const autoTitle = title || (targetRole ? `Cover Letter — ${targetRole}` : 'Untitled Cover Letter');

    const cl = await CoverLetter.create({
      userId:     req.user?._id || null,
      title:      autoTitle,
      content,
      targetRole: targetRole || '',
      tone:       tone       || 'professional',
      resumeId:   resumeId   || null,
    });

    res.status(201).json({ success: true, coverLetter: cl });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/cover-letters
exports.getCoverLetters = async (req, res, next) => {
  try {
    const filter = req.user ? { userId: req.user._id } : {};
    const coverLetters = await CoverLetter.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, coverLetters });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/dashboard/cover-letters/:id
exports.deleteCoverLetter = async (req, res, next) => {
  try {
    const cl = await CoverLetter.findByIdAndDelete(req.params.id);
    if (!cl) return res.status(404).json({ success: false, message: 'Cover letter not found' });
    res.json({ success: true, message: 'Cover letter deleted' });
  } catch (err) {
    next(err);
  }
};
