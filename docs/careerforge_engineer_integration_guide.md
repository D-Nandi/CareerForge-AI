# CareerForge × Taqnik CMS — Engineer Integration Guide

> **Version**: 1.0  
> **Date**: October 2026  
> **Prepared by**: Taqnik Engineering  
> **Audience**: CareerForge-AI backend engineers  

---

## Overview

Taqnik CMS will act as the **content authoring and publishing system** for CareerForge blog posts. When a Taqnik admin publishes or updates a blog post, the CMS makes an authenticated HTTP `POST` request to a **CareerForge blog API endpoint** that your team needs to implement.

This document defines:
- The exact API contract your server must implement
- The MongoDB schema and index requirements  
- Required changes to `client/blog-data.js` (migrating to dynamic data)
- Auth, error handling, and testing requirements

---

## 1. Integration Model

```
┌─────────────────────────────┐
│        Taqnik CMS           │
│  (Next.js + Supabase)       │
│                             │
│  Admin publishes blog post  │
│         ↓                  │
│  POST /api/publish/post     │  ← Internal Taqnik endpoint
│         ↓                  │
│  Webhook/Push Service       │
└──────────┬──────────────────┘
           │ HTTPS POST
           │ Authorization: Bearer <CAREERFORGE_BLOG_API_KEY>
           ↓
┌─────────────────────────────┐
│     CareerForge Backend     │
│  (Node.js / Express)        │
│                             │
│  POST /api/blog/publish     │  ← YOU MUST BUILD THIS
│         ↓                  │
│      MongoDB                │
│   (blogs collection)        │
└─────────────────────────────┘
           │
           ↓ (dynamic fetch)
┌─────────────────────────────┐
│  client/blog.html           │
│  client/blog-post.html      │  ← Refactor from static JS to API
└─────────────────────────────┘
```

---

## 2. API Endpoints You Must Implement

### 2.1 `POST /api/blog/publish` — Receive a Blog Post from Taqnik CMS

This is the **primary integration endpoint**. Taqnik will `POST` to this URL when a blog post is published.

#### Request

```
POST /api/blog/publish
Content-Type: application/json
Authorization: Bearer <CAREERFORGE_BLOG_API_KEY>
```

#### Request Body (sent by Taqnik CMS)

```json
{
  "id":           "how-to-write-a-killer-resume",
  "title":        "How to Write a Killer Resume in 2026",
  "excerpt":      "A concise summary of the blog post visible in listing cards.",
  "content":      "## Introduction\n\nYour resume is your first impression...",
  "image":        "https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=800",
  "category":     "Tutorials",
  "publishDate":  "October 7, 2026",
  "readTime":     "6 min read",
  "author_name":  "Elena Rostova",
  "author_role":  "Head of Career Intelligence",
  "author_avatar": "https://images.unsplash.com/photo-yyy?auto=format&fit=crop&w=150",
  "tags":         ["Resume", "Career", "Job Search"],
  "published":    true
}
```

#### Field Reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | ✅ Yes | URL-safe slug. Pattern: `^[a-z0-9-_]+$`. Use as the document slug. |
| `title` | `string` | ✅ Yes | Full title of the post. |
| `excerpt` | `string` | ✅ Yes | Short summary (~150 chars). Maps to your `summary` field. |
| `content` | `string` | No | Full body in **Markdown** format. Render as HTML client-side. |
| `image` | `string (url)` | No | Cover image URL. May be empty string `""`. |
| `category` | `string (enum)` | ✅ Yes | One of: `Tutorials`, `Explainers`, `Best Practices`, `Products Review`, `Products Comparison` |
| `publishDate` | `string` | ✅ Yes | Human-readable date string e.g. `"October 7, 2026"`. Store as-is. |
| `readTime` | `string` | No | e.g. `"6 min read"` |
| `author_name` | `string` | ✅ Yes | Author display name. Maps to your `author` field. |
| `author_role` | `string` | No | Author job title. Maps to your `authorRole` field. |
| `author_avatar` | `string (url)` | No | Author photo URL. May be empty string `""`. |
| `tags` | `string[]` | No | Array of tag strings. Defaults to `[]`. |
| `published` | `boolean` | No | Defaults to `true`. Only `true` posts visible publicly. |

> **Important**: The `content` field is **Markdown**, not HTML. Use a client-side library like [marked.js](https://marked.js.org/) to render it in `blog-post.html`.

#### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Blog post received and saved",
  "data": {
    "slug":      "how-to-write-a-killer-resume",
    "title":     "How to Write a Killer Resume in 2026",
    "createdAt": "2026-10-07T11:11:00.000Z"
  }
}
```

#### Error Responses

| Status | Condition | Response Body |
|---|---|---|
| `400` | Missing required fields or invalid `id` pattern | `{ "error": "Validation failed", "details": "..." }` |
| `401` | Missing or wrong `Authorization` header | `{ "error": "Unauthorized: Invalid or missing API key" }` |
| `409` | Post with this `id` (slug) already exists | `{ "error": "Conflict: Post with slug '...' already exists" }` |
| `500` | Server / DB error | `{ "error": "Internal Server Error" }` |

---

### 2.2 `PUT /api/blog/:slug` — Update a Blog Post

Taqnik may send updates when a post is edited.

```
PUT /api/blog/:slug
Content-Type: application/json
Authorization: Bearer <CAREERFORGE_BLOG_API_KEY>
```

Body: same shape as `POST /api/blog/publish`.  
Response on success: `200 OK` with updated document.  
Response if not found: `404 Not Found`.

---

### 2.3 `GET /api/blog` — List All Published Posts (Public)

Used by `client/blog.html` to render the blog listing page.

```
GET /api/blog
```

No auth required. Optional query params: `?category=Tutorials`, `?tag=ATS`, `?page=1`, `?limit=20`.

#### Response — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "slug":       "how-to-beat-ats-in-2025",
      "title":      "How to Beat Applicant Tracking Systems (ATS) in 2025",
      "summary":    "Over 75% of resumes are rejected before a human ever sees them...",
      "category":   "Tutorials",
      "date":       "Sep 28, 2025",
      "readTime":   "6 min read",
      "author":     "Elena Rostova",
      "authorRole": "Head of Recruiting Intelligence",
      "heroImage":  "https://...",
      "tags":       ["ATS", "Resume"],
      "featured":   false
    }
  ]
}
```

> Sort by `createdAt` descending. Filter to `published: true` only. Exclude `content` field from listing response.

---

### 2.4 `GET /api/blog/:slug` — Get Single Post (Public)

Used by `client/blog-post.html` to render full post content.

```
GET /api/blog/:slug
```

No auth required.

#### Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "slug":        "how-to-beat-ats-in-2025",
    "title":       "How to Beat ATS in 2025",
    "summary":     "...",
    "content":     "## Section 1\n\nMarkdown content here...",
    "category":    "Tutorials",
    "date":        "Sep 28, 2025",
    "readTime":    "6 min read",
    "author":      "Elena Rostova",
    "authorRole":  "Head of Recruiting Intelligence",
    "authorAvatar":"https://...",
    "heroImage":   "https://...",
    "tags":        ["ATS", "Resume"],
    "featured":    false
  }
}
```

Response if not found: `404 Not Found` → `{ "error": "Post not found" }`.

---

## 3. MongoDB Schema — `blogs` Collection

### 3.1 Mongoose Model (`backend/models/Blog.js`)

```javascript
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    // Primary identifier — same as Taqnik's `id` field (slug)
    slug: {
      type:     String,
      required: [true, 'Slug is required'],
      unique:   true,
      trim:     true,
      match:    [/^[a-z0-9-_]+$/, 'Slug must be lowercase letters, numbers, hyphens, underscores'],
    },

    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
    },

    // Maps from Taqnik `excerpt` field
    summary: {
      type:     String,
      required: [true, 'Summary (excerpt) is required'],
      trim:     true,
    },

    // Markdown string — render client-side with marked.js
    content: {
      type:    String,
      default: '',
    },

    // Maps from Taqnik `image` field
    heroImage: {
      type:    String,
      default: '',
    },

    // Enum matches Taqnik CMS category values exactly
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['Tutorials', 'Explainers', 'Best Practices', 'Products Review', 'Products Comparison'],
    },

    // Maps from Taqnik `publishDate` — stored as human-readable string
    date: {
      type:     String,
      required: [true, 'Date is required'],
    },

    readTime: {
      type:    String,
      default: '',
    },

    // Maps from Taqnik `author_name`
    author: {
      type:     String,
      required: [true, 'Author name is required'],
      trim:     true,
    },

    // Maps from Taqnik `author_role`
    authorRole: {
      type:    String,
      default: '',
    },

    // Maps from Taqnik `author_avatar`
    authorAvatar: {
      type:    String,
      default: '',
    },

    tags: {
      type:    [String],
      default: [],
    },

    // Internal CareerForge field — NOT sent by Taqnik, manage via your own admin
    featured: {
      type:    Boolean,
      default: false,
    },

    // Controls public visibility — sent by Taqnik, defaults to true
    published: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,  // Auto-adds createdAt + updatedAt
  }
);

// Indexes
blogSchema.index({ slug: 1 },             { unique: true });
blogSchema.index({ published: 1, createdAt: -1 });  // Blog listing
blogSchema.index({ category: 1, published: 1 });    // Category filter
blogSchema.index({ tags: 1 });                       // Tag filter

module.exports = mongoose.model('Blog', blogSchema);
```

### 3.2 Field Mapping Reference (Taqnik → MongoDB)

| Taqnik CMS Field | MongoDB Field | Transformation |
|---|---|---|
| `id` | `slug` | Rename — use as unique identifier |
| `title` | `title` | Direct copy |
| `excerpt` | `summary` | Rename only |
| `content` | `content` | Direct copy (Markdown string) |
| `image` | `heroImage` | Rename only |
| `category` | `category` | Direct copy (same enum values) |
| `publishDate` | `date` | Rename only |
| `readTime` | `readTime` | Direct copy |
| `author_name` | `author` | Rename only |
| `author_role` | `authorRole` | Rename + camelCase |
| `author_avatar` | `authorAvatar` | Rename + camelCase |
| `tags` | `tags` | Direct copy |
| `published` | `published` | Direct copy |
| _(not sent by Taqnik)_ | `featured` | Default `false`, manage internally |

---

## 4. Auth Middleware (`backend/middleware/blogAuth.js`)

```javascript
/**
 * Validates Taqnik CMS shared API key for blog write operations.
 * Set TAQNIK_BLOG_API_KEY in your .env file.
 */
module.exports = function blogAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const apiKey     = process.env.TAQNIK_BLOG_API_KEY;

  if (!apiKey) {
    console.error('TAQNIK_BLOG_API_KEY is not configured.');
    return res.status(500).json({ error: 'Server authentication configuration error' });
  }

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }

  next();
};
```

---

## 5. Route Implementation (`backend/routes/blogRoutes.js`)

```javascript
const express  = require('express');
const router   = express.Router();
const Blog     = require('../models/Blog');
const blogAuth = require('../middleware/blogAuth');

// Helper: map Taqnik payload fields to Blog schema fields
function mapTaqnikPayload(body) {
  return {
    slug:         body.id,
    title:        body.title,
    summary:      body.excerpt,
    content:      body.content      || '',
    heroImage:    body.image        || '',
    category:     body.category,
    date:         body.publishDate,
    readTime:     body.readTime     || '',
    author:       body.author_name,
    authorRole:   body.author_role  || '',
    authorAvatar: body.author_avatar || '',
    tags:         body.tags         || [],
    published:    body.published !== undefined ? body.published : true,
  };
}

// POST /api/blog/publish  — receive from Taqnik CMS (auth required)
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

// PUT /api/blog/:slug  — update post from Taqnik CMS (auth required)
router.put('/:slug', blogAuth, async (req, res) => {
  try {
    const updated = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: mapTaqnikPayload({ id: req.params.slug, ...req.body }) },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: `Post not found: ${req.params.slug}` });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('[Blog Update]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/blog  — list published posts (public)
router.get('/', async (req, res) => {
  try {
    const { category, tag, limit = 20, page = 1 } = req.query;
    const filter = { published: true };
    if (category) filter.category = category;
    if (tag)      filter.tags     = tag;

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

// GET /api/blog/:slug  — single post (public)
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
```

---

## 6. Register Route in `server.js`

Add these two lines to `backend/server.js`:

```javascript
// With your other route requires:
const blogRoutes = require('./routes/blogRoutes');

// With your other app.use() registrations:
app.use('/api/blog', blogRoutes);
```

---

## 7. Environment Variables

Add to `backend/.env`:

```env
# Shared secret with Taqnik CMS.
# The value must match what Taqnik has stored as CAREERFORGE_BLOG_API_KEY.
TAQNIK_BLOG_API_KEY=your-shared-secret-here
```

> ⚠️ Coordinate with Taqnik to agree on the shared secret **before** deploying to production.

---

## 8. Client-Side Migration

### 8.1 `blog.html` — Replace static data with API fetch

**Remove**:
```html
<script src="blog-data.js"></script>
```

**Add dynamic loading**:
```javascript
async function loadBlogPosts() {
  const res  = await fetch('/api/blog');
  const json = await res.json();

  json.data.forEach(post => {
    // API field     →  your template variable
    // post.slug     →  URL: blog-post.html?id=post.slug
    // post.title    →  card title
    // post.summary  →  card excerpt
    // post.category →  category badge
    // post.date     →  date display
    // post.readTime →  read time chip
    // post.author   →  author name
    // post.heroImage → cover image src
    // post.featured →  featured badge
    // post.tags     →  tag chips
  });
}
loadBlogPosts();
```

### 8.2 `blog-post.html` — Replace static lookup with API fetch

**Remove**:
```javascript
const post = BLOG_POSTS[slug];
```

**Add**:
```html
<!-- In <head> -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

```javascript
const slug = new URLSearchParams(window.location.search).get('id');

async function loadPost() {
  const res  = await fetch(`/api/blog/${slug}`);
  if (!res.ok) { /* render 404 state */ return; }

  const { data: post } = await res.json();

  // Render Markdown content as HTML
  document.getElementById('post-content').innerHTML = marked.parse(post.content || '');

  // API field        →  your template variable
  // post.title       →  <title> + h1
  // post.summary     →  subtitle / lead paragraph
  // post.author      →  author name
  // post.authorRole  →  author title
  // post.authorAvatar→  author photo <img src>
  // post.date        →  publish date display
  // post.readTime    →  read time display
  // post.category    →  category badge
  // post.heroImage   →  hero <img src>
  // post.tags        →  tag chips
}
loadPost();
```

---

## 9. Seed Script — Migrate `blog-data.js` to MongoDB

Run once to migrate existing hardcoded posts into MongoDB:

```javascript
// scripts/seed-blog.js
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const mongoose = require('mongoose');
const Blog     = require('../backend/models/Blog');

// Paste your existing BLOG_POSTS object here, or require the file
const BLOG_POSTS = { /* ...existing static data... */ };

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const [slug, post] of Object.entries(BLOG_POSTS)) {
    if (await Blog.findOne({ slug })) {
      console.log(`[SKIP] ${slug}`);
      continue;
    }
    await Blog.create({
      slug,
      title:        post.title,
      summary:      post.summary || post.subtitle || '',
      content:      post.content  || '',
      heroImage:    '',
      category:     'Tutorials',          // set appropriate category per post
      date:         post.date,
      readTime:     post.readTime || '',
      author:       post.author,
      authorRole:   post.authorRole || '',
      authorAvatar: '',
      tags:         [],
      featured:     post.featured || false,
      published:    true,
    });
    console.log(`[SEEDED] ${slug}`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(console.error);
```

Run: `node scripts/seed-blog.js`

---

## 10. Schema Change Summary

### New fields (not in old `blog-data.js`)

| Field | Type | Source | Purpose |
|---|---|---|---|
| `heroImage` | `String` | Taqnik (`image`) | Cover image URL (was implicit, now explicit) |
| `authorAvatar` | `String` | Taqnik (`author_avatar`) | Author photo URL |
| `tags` | `String[]` | Taqnik (`tags`) | Filterable tag array |
| `published` | `Boolean` | Taqnik (`published`) | Draft / live toggle |
| `createdAt` | `Date` | Auto (Mongoose) | Listing sort key |
| `updatedAt` | `Date` | Auto (Mongoose) | Last update tracking |

### Renamed fields (old name → new name)

| Old (`blog-data.js`) | New (MongoDB) | Notes |
|---|---|---|
| `slug` | `slug` | Same name; now unique DB key |
| `summary` | `summary` | Taqnik sends as `excerpt` — rename on ingest |
| `author` | `author` | Taqnik sends as `author_name` — rename on ingest |
| `authorRole` | `authorRole` | Taqnik sends as `author_role` — rename on ingest |
| `date` | `date` | Taqnik sends as `publishDate` — rename on ingest |

### Deprecated fields

| Old Field | Reason |
|---|---|
| `subtitle` | Not in Taqnik schema. Use `summary` instead (maps from `excerpt`). |

---

## 11. CORS Configuration

Update your `cors()` config in `server.js` to allow Taqnik origin:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',          // Taqnik local dev
    'https://taqnik.com',            // Taqnik production (confirm exact domain with Taqnik team)
    'https://www.careerforgeai.com', // CareerForge production
  ],
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));
```

---

## 12. Testing Checklist

Verify these before going live:

- [ ] `POST /api/blog/publish` returns `201` with a valid Taqnik payload
- [ ] `POST /api/blog/publish` returns `401` when `Authorization` header is missing
- [ ] `POST /api/blog/publish` returns `401` when API key is wrong
- [ ] `POST /api/blog/publish` returns `409` when the same `id` is sent twice
- [ ] `POST /api/blog/publish` returns `400` when required fields are missing (`id`, `title`, `excerpt`, `category`, `publishDate`, `author_name`)
- [ ] `POST /api/blog/publish` returns `400` when `id` contains uppercase or special chars
- [ ] `GET /api/blog` returns only `published: true` posts
- [ ] `GET /api/blog` does **not** include the `content` field in list response
- [ ] `GET /api/blog/:slug` returns `404` for unknown slug
- [ ] `GET /api/blog/:slug` does not expose `__v` field
- [ ] `PUT /api/blog/:slug` updates an existing post and returns `200`
- [ ] `PUT /api/blog/:slug` returns `404` for non-existent slug
- [ ] `blog.html` renders post listing correctly from API
- [ ] `blog-post.html` renders Markdown `content` as HTML using `marked.js`
- [ ] Seed script completes without errors; existing posts load in blog listing
- [ ] `TAQNIK_BLOG_API_KEY` is set in both staging and production environments

---

## 13. Contact

For integration questions, API key exchange, or schema changes contact the Taqnik team.  

Reference files in Taqnik CMS repo:
- **OpenAPI Spec**: [`docs/openapi.yaml`](https://github.com/your-org/taqnik-cms/blob/main/docs/openapi.yaml)
- **Publish Route**: `src/app/api/publish/post/route.ts`
- **CMS Config**: `src/cms.config.ts`
