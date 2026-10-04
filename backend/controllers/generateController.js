const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generate = async (req, res, next) => {
  try {
    // Initialize INSIDE the function so dotenv has already loaded the key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { personal, experience, projects, education, skills, jobDescription, tone } = req.body;

    const expText = (experience || []).map(e =>
      `${e.role} at ${e.company} (${e.startDate} – ${e.endDate}): ${e.description}`
    ).join('\n');

    const projText = (projects || []).map(p =>
      `${p.name} (${p.type || 'Project'}): ${p.description}`
    ).join('\n');

    const eduText = (education || []).map(e =>
      `${e.degree}, ${e.institution} (${e.startYear} – ${e.endYear})`
    ).join('\n');

    const prompt = `
Write a ${tone || 'professional'} cover letter for the following candidate applying to: ${jobDescription.targetRole}.

Candidate:
- Name: ${personal.firstName} ${personal.lastName}
- Title: ${personal.jobTitle}
- Summary: ${personal.summary || 'N/A'}

Experience:
${expText || 'N/A'}

Projects:
${projText || 'N/A'}

Education:
${eduText || 'N/A'}

Technical Skills: ${(skills.tech || []).join(', ') || 'N/A'}
Soft Skills: ${(skills.soft || []).join(', ') || 'N/A'}

Job Description:
${jobDescription.jobDescription}

Write only the cover letter body. No subject line. No placeholders. Keep it under 350 words.
`.trim();

    let text = '';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (modelErr) {
      console.warn('Gemini 1.5 flash failed, trying gemini-2.0-flash-exp...', modelErr.message);
      const model2 = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result2 = await model2.generateContent(prompt);
      text = result2.response.text();
    }

    res.json({ success: true, coverLetter: text });
  } catch (err) {
    next(err);
  }
};
