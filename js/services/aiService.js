/**
 * CareerForge AI / Resumatic — AI Service Integration Layer
 * Connects frontend UI to backend Google Gemini AI generation endpoints.
 */

const API_BASE_URL = '/api';

/**
 * Generates a tailored Cover Letter via Backend AI Endpoint
 * @param {Object} resumeData - Candidate profile, experience, education, skills
 * @param {Object} jobDetails - Target role and job description text
 * @param {string} [tone='professional'] - Desired tone
 * @returns {Promise<string>} Generated Cover Letter text
 */
async function generateAICoverLetter(resumeData, jobDetails, tone = 'professional') {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personal: resumeData.personal || {},
        experience: resumeData.experience || [],
        projects: resumeData.projects || [],
        education: resumeData.education || [],
        skills: resumeData.skills || {},
        jobDescription: {
          targetRole: jobDetails.targetRole || 'Target Role',
          jobDescription: jobDetails.jobDescription || ''
        },
        tone
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error (${response.status})`);
    }

    const data = await response.json();
    if (data && data.success && data.coverLetter) {
      return data.coverLetter;
    }

    throw new Error('Invalid response format from AI service.');
  } catch (err) {
    console.error('AI Cover Letter Generation failed:', err);
    throw err;
  }
}

/**
 * Enhances a bullet point with action verbs and quantifiable metrics
 * @param {string} originalBullet 
 * @param {string} roleTitle 
 * @returns {Promise<string>} Enhanced bullet point string
 */
async function enhanceBulletPoint(originalBullet, roleTitle = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/enhance-bullet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet: originalBullet, role: roleTitle })
    });

    if (!response.ok) {
      throw new Error(`Enhancement failed (${response.status})`);
    }

    const data = await response.json();
    return data.enhancedBullet || originalBullet;
  } catch (err) {
    console.warn('AI Bullet Enhancement fallback triggered:', err.message);
    return originalBullet;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateAICoverLetter, enhanceBulletPoint };
} else {
  window.generateAICoverLetter = generateAICoverLetter;
  window.enhanceBulletPoint = enhanceBulletPoint;
}
