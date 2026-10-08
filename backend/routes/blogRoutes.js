const express  = require('express');
const router   = express.Router();
const Blog     = require('../models/Blog');
const blogAuth = require('../middleware/blogAuth');

// CareerForge Core SEO Pillars
const CAREERFORGE_CATEGORIES = [
  'ATS Secrets',
  'Resume Writing',
  'Cover Letters',
  'Interview Prep',
  'Career Growth',
];

function normalizeToCareerForgeCategory(rawCategory, tags = [], title = '', summary = '') {
  // If already one of CareerForge's SEO categories, keep it
  const matched = CAREERFORGE_CATEGORIES.find(
    c => c.toLowerCase() === (rawCategory || '').trim().toLowerCase()
  );
  if (matched) return matched;

  const combinedText = `${(tags || []).join(' ')} ${title} ${summary} ${rawCategory}`.toLowerCase();

  if (/ats|applicant tracking|scan|parse|parser|score|keyword/.test(combinedText)) {
    return 'ATS Secrets';
  }
  if (/cover letter|tailored letter|hiring manager letter/.test(combinedText)) {
    return 'Cover Letters';
  }
  if (/interview|system design|behavioral|star method|mock interview/.test(combinedText)) {
    return 'Interview Prep';
  }
  if (/career|growth|salary|promotion|networking|roadmap|job search|offer/.test(combinedText)) {
    return 'Career Growth';
  }

  // Fallback to Resume Writing
  return 'Resume Writing';
}

// Helper: map Taqnik payload fields to Blog schema fields
function mapTaqnikPayload(body) {
  const tags = Array.isArray(body.tags) ? [...body.tags] : [];

  // Preserve original Taqnik category in tags if it was one of the generic CMS categories
  if (body.category && !CAREERFORGE_CATEGORIES.includes(body.category) && !tags.includes(body.category)) {
    tags.push(body.category);
  }

  const normalizedCategory = normalizeToCareerForgeCategory(
    body.category,
    tags,
    body.title || '',
    body.excerpt || body.summary || ''
  );

  return {
    slug:         body.id || body.slug,
    title:        body.title,
    summary:      body.excerpt !== undefined ? body.excerpt : body.summary,
    content:      body.content !== undefined ? body.content : '',
    heroImage:    body.image !== undefined ? body.image : (body.heroImage || ''),
    category:     normalizedCategory,
    date:         body.publishDate !== undefined ? body.publishDate : body.date,
    readTime:     body.readTime || '',
    author:       body.author_name !== undefined ? body.author_name : body.author,
    authorRole:   body.author_role !== undefined ? body.author_role : (body.authorRole || ''),
    authorAvatar: body.author_avatar !== undefined ? body.author_avatar : (body.authorAvatar || ''),
    tags:         tags,
    published:    body.published !== undefined ? body.published : true,
    ...(body.featured !== undefined && { featured: body.featured }),
  };
}

// POST /api/blog/publish — receive from Taqnik CMS (auth required)
router.post('/publish', blogAuth, async (req, res) => {
  try {
    const { id, title, excerpt, category, publishDate, author_name } = req.body;

    if (!id || !title || !excerpt || !category || !publishDate || !author_name) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Required: id, title, excerpt, category, publishDate, author_name',
      });
    }

    if (!/^[a-z0-9-_]+$/.test(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'id must be a valid slug: lowercase letters, numbers, hyphens, underscores only',
      });
    }

    const existing = await Blog.findOne({ slug: id });
    if (existing) {
      return res.status(409).json({ error: `Conflict: Post with slug '${id}' already exists` });
    }

    const blog = new Blog(mapTaqnikPayload(req.body));
    await blog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog post received and saved',
      data: { slug: blog.slug, title: blog.title, createdAt: blog.createdAt },
    });
  } catch (err) {
    console.error('[Blog Publish]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/blog/:slug — update post from Taqnik CMS (auth required)
router.put('/:slug', blogAuth, async (req, res) => {
  try {
    const mapped = mapTaqnikPayload({ id: req.params.slug, ...req.body });
    delete mapped.slug; // Prevent changing the slug on update

    const updated = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: mapped },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: `Post not found: ${req.params.slug}` });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('[Blog Update]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/blog — list published posts (public)
router.get('/', async (req, res) => {
  try {
    const { category, tag, limit = 20, page = 1 } = req.query;
    const filter = { published: true };
    if (category && category !== 'all') filter.category = category;
    if (tag) filter.tags = tag;

    const posts = await Blog
      .find(filter)
      .select('-content -__v')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    return res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error('[Blog List]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/blog/:slug — single post (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true }).select('-__v');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error('[Blog Single]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
