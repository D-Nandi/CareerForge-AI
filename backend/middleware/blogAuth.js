/**
 * Validates Taqnik CMS shared API key for blog write operations.
 * Set TAQNIK_BLOG_API_KEY in your .env file.
 */
module.exports = function blogAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const apiKey     = process.env.TAQNIK_BLOG_API_KEY || process.env.CAREERFORGE_BLOG_API_KEY;

  if (!apiKey) {
    console.error('TAQNIK_BLOG_API_KEY is not configured.');
    return res.status(500).json({ error: 'Server authentication configuration error' });
  }

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }

  next();
};
