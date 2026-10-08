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

    // Category enum supporting CareerForge SEO Pillars and Taqnik CMS categories
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     [
        'ATS Secrets',
        'Resume Writing',
        'Cover Letters',
        'Interview Prep',
        'Career Growth',
        'Tutorials',
        'Explainers',
        'Best Practices',
        'Products Review',
        'Products Comparison',
      ],
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

// Indexes (slug is already indexed with unique: true on the field definition)
blogSchema.index({ published: 1, createdAt: -1 });  // Blog listing
blogSchema.index({ category: 1, published: 1 });    // Category filter
blogSchema.index({ tags: 1 });                       // Tag filter

module.exports = mongoose.model('Blog', blogSchema);
