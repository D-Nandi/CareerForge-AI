const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generate = async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing GEMINI_API_KEY environment variable.'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const { personal = {}, experience = [], projects = [], education = [], skills = {}, jobDescription = {}, tone = 'professional' } = req.body;

    const targetRole = jobDescription.targetRole || personal.jobTitle || 'Target Role';
    const targetJD = jobDescription.jobDescription || 'N/A';

    const expText = (experience || []).map(e =>
      `${e.role || ''} at ${e.company || ''} (${e.startDate || ''} – ${e.endDate || 'Present'}): ${e.description || ''}`
    ).filter(t => t.trim()).join('\n');

    const projText = (projects || []).map(p =>
      `${p.name || p.title || ''} (${p.type || 'Project'}): ${p.description || ''}`
    ).filter(t => t.trim()).join('\n');

    const eduText = (education || []).map(e =>
      `${e.degree || ''}, ${e.institution || ''} (${e.startYear || ''} – ${e.endYear || ''})`
    ).filter(t => t.trim()).join('\n');

    const techSkills = Array.isArray(skills.tech) ? skills.tech.join(', ') : (skills.tech || 'N/A');
    const softSkills = Array.isArray(skills.soft) ? skills.soft.join(', ') : (skills.soft || 'N/A');

    const prompt = `
Write a ${tone} cover letter for the following candidate applying to: ${targetRole}.

Candidate:
- Name: ${personal.firstName || ''} ${personal.lastName || ''}
- Title: ${personal.jobTitle || personal.title || ''}
- Summary: ${personal.summary || 'N/A'}

Experience:
${expText || 'N/A'}

Projects:
${projText || 'N/A'}

Education:
${eduText || 'N/A'}

Technical Skills: ${techSkills}
Soft Skills: ${softSkills}

Job Description:
${targetJD}

Write only the cover letter body. No subject line. No placeholders. Keep it under 350 words.
`.trim();

    let text = '';
    const preferredModels = ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-pro-latest'];
    let lastError = null;

    for (const modelName of preferredModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        if (text) break;
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`Generative AI model "${modelName}" failed:`, modelErr.message);
      }
    }

    if (!text) {
      throw new Error(`All AI models failed to generate response. Last error: ${lastError ? lastError.message : 'Unknown'}`);
    }

    res.json({ success: true, coverLetter: text });
  } catch (err) {
    next(err);
  }
};
