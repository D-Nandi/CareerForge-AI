const Roadmap = require('../models/Roadmap');
const { generateRoadmapFromAI } = require('../services/aiService');

// POST /api/roadmap/generate (Anonymous OK)
exports.generateRoadmap = async (req, res, next) => {
  try {
    const { currentRole, targetRole, skills, experienceLevel, timeline, resumeData } = req.body;

    if (!targetRole || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'targetRole and experienceLevel are required fields'
      });
    }

    const roadmapData = await generateRoadmapFromAI({
      currentRole: currentRole || 'CS Graduate / Engineer',
      targetRole,
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      experienceLevel,
      timeline: timeline || '6 months',
      resumeData
    });

    res.json({
      success: true,
      data: roadmapData
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/roadmap/save (Logged-in only)
exports.saveRoadmap = async (req, res, next) => {
  try {
    const { currentRole, targetRole, experienceLevel, timeline, profileScore, readinessSummary, phases, milestones } = req.body;

    if (!targetRole || !experienceLevel) {
      return res.status(400).json({ success: false, message: 'targetRole and experienceLevel required' });
    }

    // Upsert or create new active roadmap for the user
    let roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (roadmap) {
      roadmap.currentRole = currentRole || roadmap.currentRole;
      roadmap.targetRole = targetRole;
      roadmap.experienceLevel = experienceLevel;
      roadmap.timeline = timeline || roadmap.timeline;
      roadmap.profileScore = profileScore !== undefined ? profileScore : roadmap.profileScore;
      roadmap.readinessSummary = readinessSummary || roadmap.readinessSummary;
      roadmap.phases = phases || roadmap.phases;
      roadmap.milestones = milestones || roadmap.milestones;
      await roadmap.save();
    } else {
      roadmap = await Roadmap.create({
        userId: req.user._id,
        currentRole: currentRole || 'CS Graduate / Engineer',
        targetRole,
        experienceLevel,
        timeline: timeline || '6 months',
        profileScore: profileScore || 65,
        readinessSummary: readinessSummary || '',
        phases: phases || [],
        milestones: milestones || []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Roadmap saved to your dashboard',
      roadmap
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/roadmap/my (Logged-in only)
exports.getMyRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.json({ success: true, roadmap: null });
    }

    res.json({
      success: true,
      roadmap
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/roadmap/milestone (Logged-in only)
exports.toggleMilestone = async (req, res, next) => {
  try {
    const { milestoneId, completed } = req.body;
    if (!milestoneId) {
      return res.status(400).json({ success: false, message: 'milestoneId is required' });
    }

    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No active roadmap found to update' });
    }

    const milestone = roadmap.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.completed = typeof completed === 'boolean' ? completed : !milestone.completed;
    await roadmap.save();

    res.json({
      success: true,
      milestoneId,
      completed: milestone.completed,
      milestones: roadmap.milestones
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/roadmap/recalibrate (Protected - Career+ or Pro tier)
exports.recalibrateRoadmap = async (req, res, next) => {
  try {
    const { userReflection = '' } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No active roadmap found to recalibrate.' });
    }

    const { recalibrateRoadmapFromAI } = require('../services/aiService');
    const completedIds = (roadmap.milestones || []).filter(m => m.completed).map(m => m.id);

    const recalibrated = await recalibrateRoadmapFromAI({
      currentRoadmap: roadmap,
      completedMilestoneIds: completedIds,
      userReflection
    });

    roadmap.profileScore = recalibrated.profileScore || roadmap.profileScore;
    roadmap.readinessSummary = recalibrated.readinessSummary || roadmap.readinessSummary;
    if (recalibrated.phases && recalibrated.phases.length) {
      roadmap.phases = recalibrated.phases;
    }
    await roadmap.save();

    res.json({
      success: true,
      message: 'Roadmap successfully recalibrated with updated market trajectory!',
      roadmap,
      recalibration: {
        note: recalibrated.recalibrationNote,
        nextActions: recalibrated.nextActions
      }
    });
  } catch (err) {
    next(err);
  }
};
