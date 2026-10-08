// scripts/seed-blog.cjs
const path = require('path');
const fs   = require('fs');

// Resolve backend dependencies (handles monorepo where dotenv/mongoose are in backend/node_modules)
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

const dotenv   = resolveBackendModule('dotenv');
const mongoose = resolveBackendModule('mongoose');

dotenv.config({ path: path.join(backendDir, '.env') });
const Blog = require('../backend/models/Blog');

const BLOG_POSTS = {
  "how-to-beat-ats-in-2025": {
    slug: "how-to-beat-ats-in-2025",
    title: "How to Beat Applicant Tracking Systems (ATS) in 2025: The Definitive Guide",
    subtitle: "Over 75% of resumes are rejected before a human recruiter ever sees them. Here is how to pass the robots.",
    category: "ATS Secrets",
    readTime: "6 min read",
    date: "Sep 28, 2025",
    author: "Elena Rostova",
    authorRole: "Head of Recruiting Intelligence",
    featured: true,
    summary: "Discover how modern AI-powered ATS algorithms parse resumes, why formatting tables fail, and the exact keyword matching techniques top candidates use.",
    content: `
## 1. How Modern ATS Algorithms Actually Work

Applicant Tracking Systems (ATS) like Workday, Taleo, Greenhouse, and Lever don't just search for exact words anymore—they use natural language processing (NLP) to parse your career trajectory, skills density, and quantified outcomes.

When you submit a resume, the parser performs three sequential steps:
* **Text Extraction:** Converts your document into raw text strings. Complex multi-layer tables and graphic text boxes frequently get scrambled here.
* **Entity Recognition:** Identifies sections like Experience, Education, and Skills.
* **Semantic Keyword Scoring:** Compares your qualifications against the hiring manager's job requisition query.

> 💡 **Pro Tip:** Always use standard section headings like *"Work Experience"* and *"Technical Skills"*. Creative titles like *"Where I've Been"* confuse ATS parsers.

## 2. The 4 Fatal Formatting Mistakes to Avoid

Even the most accomplished candidates get automatically disqualified due to subtle document formatting traps:
1. **Putting Contact Info in Headers/Footers:** Older parsers ignore Word and PDF header/footer zones entirely. Keep your name and email in the main document body.
2. **Using Custom Icons Instead of Text:** Never replace the word "Phone" or "Email" solely with an SVG icon without fallback text.
3. **Low-Contrast Colors & Unreadable Fonts:** Stick to standard web fonts like Syne, Inter, Roboto, or Arial.
4. **Images of Text:** Never paste charts or certificates as static images expecting text parsers to OCR them.

## 3. The Exact Formula for High-Scoring Bullet Points

Recruiters and AI screening algorithms look for the **Google X-Y-Z Formula**:
> *"Accomplished [X], as measured by [Y], by doing [Z]."*

* **Weak Bullet:** Responsible for speeding up the company website.
* **Strong ATS Bullet:** Optimized frontend bundle size and caching layers, cutting initial page load times by 42% and increasing mobile checkout conversion by 14%.
    `.trim()
  },
  "best-resume-power-verbs": {
    slug: "best-resume-power-verbs",
    title: "100+ High-Impact Action Verbs That Will Transform Your Resume",
    subtitle: "Ditch 'responsible for' and 'assisted with'. Use these powerful verbs categorized by industry and impact.",
    category: "Resume Writing",
    readTime: "5 min read",
    date: "Sep 24, 2025",
    author: "Marcus Vance",
    authorRole: "Senior Career Coach",
    featured: false,
    summary: "A curated master list of executive action verbs proven to increase recruiter callbacks and pass semantic ATS keyword scoring.",
    content: `
## Why Action Verbs Make or Break First Impressions

Recruiters spend an average of 6 to 7 seconds scanning a resume during initial triage. Starting your bullet points with dynamic, decisive verbs immediately conveys ownership and impact.

## Top Verbs for Engineering & Architecture
Architected, Spearheaded, Engineered, Automated, Deployed, Refactored, Accelerated, Scaled, Overhauled, Optimized, Integrated, Debugged.

## Top Verbs for Leadership & Management
Directed, Orchestrated, Mobilized, Championed, Mentored, Negotiated, Aligned, Cultivated, Delegated, Galvanized.

## Top Verbs for Growth & Revenue
Generated, Maximized, Outperformed, Expanded, Captured, Boosted, Monetized, Propelled, Doubled.
    `.trim()
  },
  "cover-letter-secrets-2025": {
    slug: "cover-letter-secrets-2025",
    title: "How to Write a Tailored Cover Letter in Under 5 Minutes with AI",
    subtitle: "Stop writing generic cover letters that end up in the trash. Here is the 3-paragraph formula that gets replies.",
    category: "Cover Letters",
    readTime: "4 min read",
    date: "Sep 18, 2025",
    author: "Sarah Jenkins",
    authorRole: "Tech Talent Lead",
    featured: false,
    summary: "The step-by-step framework to pair with Google Gemini AI to draft compelling, bespoke cover letters for any application.",
    content: `
## The 3-Paragraph High-Conversion Blueprint

Nobody wants to read a 2-page essay. The most effective cover letters are crisp, personalized, and focus entirely on how you can solve the company's biggest challenges.

* **Paragraph 1: The Hook & Enthusiasm:** State the exact role, why their mission excites you, and your high-level value proposition.
* **Paragraph 2: Quantified Proof:** 1-2 major career wins directly addressing the core requirements from the job description.
* **Paragraph 3: Confident Closing:** Express eagerness to discuss further and thank the hiring team.
    `.trim()
  }
};

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerforge';

  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to Primary MongoDB.');
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}). Attempting local fallback...`);
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/careerforge', { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to Local Fallback MongoDB.');
    } catch (localErr) {
      console.error('❌ Could not connect to any MongoDB instance:', localErr.message);
      process.exit(1);
    }
  }

  for (const [slug, post] of Object.entries(BLOG_POSTS)) {
    const existing = await Blog.findOne({ slug });
    if (existing) {
      console.log(`[SKIP] Already exists: ${slug}`);
      continue;
    }

    await Blog.create({
      slug,
      title:        post.title,
      summary:      post.summary || post.subtitle || '',
      content:      post.content || '',
      heroImage:    '',
      category:     post.category || 'Tutorials',
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
  console.log('✅ Seeding completed.');
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
