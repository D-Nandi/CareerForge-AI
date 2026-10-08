// scripts/test-blog-api.cjs
const path = require('path');
const fs   = require('fs');

const backendDir = path.join(__dirname, '../backend');
function resolveBackendModule(name) {
  try {
    return require(name);
  } catch (e) {
    const backendModPath = path.join(backendDir, 'node_modules', name);
    if (fs.existsSync(backendModPath)) {
      return require(backendModPath);
    }
    throw e;
  }
}

const dotenv = resolveBackendModule('dotenv');
const express = resolveBackendModule('express');
const mongoose = resolveBackendModule('mongoose');

dotenv.config({ path: path.join(backendDir, '.env') });

const Blog = require('../backend/models/Blog');
const blogRoutes = require('../backend/routes/blogRoutes');

const app = express();
app.use(express.json());
app.use('/api/blog', blogRoutes);

let server;
const PORT = 5566;
const BASE_URL = `http://127.0.0.1:${PORT}/api/blog`;
const API_KEY = process.env.TAQNIK_BLOG_API_KEY || 'cf_live_taqnik_secret_2026_dev';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerforge';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    await mongoose.connect('mongodb://127.0.0.1:27017/careerforge', { serverSelectionTimeoutMS: 3000 });
  }

  await new Promise(resolve => {
    server = app.listen(PORT, resolve);
  });
  console.log(`Test server running on port ${PORT}\n`);

  // Clean test documents if any from previous test runs
  await Blog.deleteOne({ slug: 'test-taqnik-guide-post' });
  await Blog.deleteOne({ slug: 'test-taqnik-draft-post' });

  // 1. POST /api/blog/publish returns 401 when Authorization header is missing
  {
    const res = await fetch(`${BASE_URL}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No Auth' }),
    });
    assert(res.status === 401, 'POST /publish returns 401 when Authorization header is missing');
  }

  // 2. POST /api/blog/publish returns 401 when API key is wrong
  {
    const res = await fetch(`${BASE_URL}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer wrong_secret_key',
      },
      body: JSON.stringify({ title: 'Wrong Key' }),
    });
    assert(res.status === 401, 'POST /publish returns 401 when API key is wrong');
  }

  // 3. POST /api/blog/publish returns 400 when required fields are missing
  {
    const res = await fetch(`${BASE_URL}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ id: 'valid-id' }),
    });
    assert(res.status === 400, 'POST /publish returns 400 when required fields are missing');
  }

  // 4. POST /api/blog/publish returns 400 when id contains uppercase or special chars
  {
    const res = await fetch(`${BASE_URL}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        id: 'Invalid_ID_With_UpperCase',
        title: 'Title',
        excerpt: 'Excerpt',
        category: 'Tutorials',
        publishDate: 'October 8, 2026',
        author_name: 'Elena',
      }),
    });
    assert(res.status === 400, 'POST /publish returns 400 when id contains uppercase characters');
  }

  // 5. POST /api/blog/publish returns 201 with a valid Taqnik payload
  {
    const res = await fetch(`${BASE_URL}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        id: 'test-taqnik-guide-post',
        title: 'How to Build an ATS Engine',
        excerpt: 'A comprehensive explainer on building modern ATS pipelines.',
        content: '## Introduction\n\nParsing resumes requires robust OCR.',
        image: 'https://images.unsplash.com/photo-test',
        category: 'Tutorials',
        publishDate: 'October 8, 2026',
        readTime: '7 min read',
        author_name: 'Elena Rostova',
        author_role: 'Head of Recruiting Intelligence',
        author_avatar: 'https://images.unsplash.com/photo-avatar',
        tags: ['Engineering', 'ATS'],
        published: true,
      }),
    });
    const json = await res.json();
    assert(res.status === 201 && json.success && json.data.slug === 'test-taqnik-guide-post', 'POST /publish returns 201 with valid Taqnik payload');
  }

  // 6. POST /api/blog/publish returns 409 when the same id is sent twice
  {
    const res = await fetch(`${BASE_URL}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        id: 'test-taqnik-guide-post',
        title: 'Duplicate Post Attempt',
        excerpt: 'Duplicate excerpt',
        category: 'Tutorials',
        publishDate: 'October 8, 2026',
        author_name: 'Elena Rostova',
      }),
    });
    assert(res.status === 409, 'POST /publish returns 409 when duplicate slug is sent');
  }

  // Insert a draft post directly to verify GET listing filtering
  await Blog.create({
    slug: 'test-taqnik-draft-post',
    title: 'Draft Post That Should Not Appear in Public Listing',
    summary: 'Draft summary',
    category: 'Tutorials',
    date: 'October 8, 2026',
    author: 'Elena',
    published: false,
  });

  // 7. GET /api/blog returns only published: true posts and excludes content & __v
  {
    const res = await fetch(`${BASE_URL}`);
    const json = await res.json();
    const hasDraft = json.data.some(p => p.slug === 'test-taqnik-draft-post');
    const hasContent = json.data.some(p => p.content !== undefined);
    const hasV = json.data.some(p => p.__v !== undefined);
    assert(res.status === 200 && !hasDraft && !hasContent && !hasV, 'GET / returns only published: true posts and excludes content & __v');
  }

  // 8. GET /api/blog/:slug returns single post with content and excludes __v
  {
    const res = await fetch(`${BASE_URL}/test-taqnik-guide-post`);
    const json = await res.json();
    assert(
      res.status === 200 &&
      json.success &&
      json.data.slug === 'test-taqnik-guide-post' &&
      json.data.content.includes('## Introduction') &&
      json.data.__v === undefined,
      'GET /:slug returns full post and does not expose __v'
    );
  }

  // 9. GET /api/blog/:slug returns 404 for unknown slug or unpublished post
  {
    const res404 = await fetch(`${BASE_URL}/unknown-slug-xyz`);
    const resDraft404 = await fetch(`${BASE_URL}/test-taqnik-draft-post`);
    assert(res404.status === 404 && resDraft404.status === 404, 'GET /:slug returns 404 for unknown slug and draft posts');
  }

  // 10. PUT /api/blog/:slug updates post and returns 200
  {
    const res = await fetch(`${BASE_URL}/test-taqnik-guide-post`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        title: 'Updated: How to Build an ATS Engine',
        excerpt: 'Updated excerpt description',
        category: 'Best Practices',
      }),
    });
    const json = await res.json();
    assert(res.status === 200 && json.success && json.data.title === 'Updated: How to Build an ATS Engine' && json.data.category === 'ATS Secrets', 'PUT /:slug updates existing post and normalizes category to CareerForge SEO pillar');
  }

  // 11. PUT /api/blog/:slug returns 404 for non-existent slug
  {
    const res = await fetch(`${BASE_URL}/non-existent-slug-xyz`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ title: 'Update Non-existent' }),
    });
    assert(res.status === 404, 'PUT /:slug returns 404 for non-existent slug');
  }

  // Clean up test documents
  await Blog.deleteOne({ slug: 'test-taqnik-guide-post' });
  await Blog.deleteOne({ slug: 'test-taqnik-draft-post' });

  await mongoose.disconnect();
  server.close();

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
