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
  },
  "what-information-should-you-put-on-a-resume": {
    slug: "what-information-should-you-put-on-a-resume",
    title: "What to Put on a Resume in 2026 (Guide) | CareerNest",
    subtitle: "Learn the 5 essential resume sections, key additions, and ATS formatting rules needed to pass automated filters and impress recruiters in 2026.",
    category: "Resume Writing",
    readTime: "7 min read",
    date: "Oct 13, 2026",
    author: "Marcus Vance",
    authorRole: "Senior Career Coach",
    featured: false,
    summary: "Learn the 5 essential resume sections, key additions, and ATS formatting rules needed to pass automated filters and impress recruiters in 2026.",
    heroImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    tags: ["Resume Writing", "Resume Tips", "ATS", "Career Advice", "Job Search"],
    faqs: [
      {
        question: "Should I Include a Photo on My Resume?",
        answer: "In the United States, India, and most Western tech markets, including a photo is unnecessary and can introduce unconscious hiring bias. Furthermore, image layers often cause parsing errors in automated Applicant Tracking Systems like Workday and Taleo."
      },
      {
        question: "How Many Pages Should a Resume Be?",
        answer: "A single-page resume is optimal for students, recent college graduates, and professionals with under 5 years of experience. Experienced specialists, technical architects, and senior managers can use two pages provided every line conveys quantifiable impact."
      },
      {
        question: "Do I Need a Skills-Based Resume?",
        answer: "Reverse-chronological resumes remain the gold standard for 95% of corporate hiring workflows because enterprise ATS parsers map experience linearly. A functional or hybrid format should only be used for severe career pivots."
      }
    ],
    content: `
Modern corporate hiring in 2026 is governed by automated screening engines. Before a recruiter spends an average of 7.4 seconds skimming your credentials, Applicant Tracking Systems (ATS) such as Workday, Greenhouse, Taleo, Lever, and iCIMS parse your document via Natural Language Processing (NLP) tokenization. 

To secure interview shortlists, your resume must balance machine-readable UTF-8 layout standards with compelling, metric-backed professional storytelling.

---

## The 5 Essential Resume Sections

> **What belongs on a modern resume?**  
> In 2026, an effective resume contains five non-negotiable sections: **Contact Header**, **Professional Summary**, **Work Experience**, **Skills**, and **Education**. Additional sections like Certifications, Technical Projects, and Languages should only be included when they directly map to job description keywords.

---

### 1. Header and Contact Information

Your header must sit in the main document canvas. Avoid placing contact info inside Word or PDF header and footer zones, as legacy optical character recognition (OCR) engines frequently bypass margins.

* **Full Name:** Prominently formatted in 16–20pt bold font.
* **Phone Number:** Mobile contact with country code.
* **Email Address:** Clean, professional address (e.g., \`firstname.lastname@email.com\`).
* **Location:** City, State, or Country (full street addresses are obsolete and pose privacy risks).
* **Digital Footprint:** Live hyperlinks to your verified LinkedIn profile, GitHub repository, or online portfolio.

---

### 2. Professional Summary

Replace outdated "Objective" statements with a targeted, 3-to-4 sentence value proposition. Synthesize your years in the industry, primary technical stack, and signature quantifiable achievement.

#### Examples by Career Stage:

* **Junior Software Engineer:**  
  *"Full-Stack Developer with 2+ years of experience building scalable TypeScript and Node.js microservices. Engineered REST APIs handling 400k+ daily requests and reduced query latency by 32% across cloud databases."*
* **Senior Operations Lead:**  
  *"Cross-functional Operations Director with 9+ years optimizing tech supply chains and agile logistics. Directed 14-member teams, reduced operational overhead by $1.4M, and spearheaded ERP automation across 3 regional hubs."*

---

### 3. Work Experience (Reverse-Chronological)

Present your roles starting with your current or most recent engagement. Frame every bullet point around business outcomes using the **Google X-Y-Z formula**: *"Accomplished [X], as measured by [Y], by doing [Z]."*

| Typical Weak Duty | ATS-Optimized Metric-Driven Bullet |
|---|---|
| *Responsible for resolving software customer tickets.* | *Maintained 99.4% SLA resolution rate across 1,200+ Zendesk tickets, improving client CSAT score from 84% to 96%.* |
| *Managed social media accounts and posted updates.* | *Spearheaded multi-channel B2B content campaign across LinkedIn and YouTube, boosting inbound demo signups by 44% in Q3.* |
| *Built backend database queries for internal dashboards.* | *Refactored PostgreSQL indexing layers, slashing query response times by 58% for 8,500 active dashboard users.* |

Pair your drafted bullets with our [100+ High-Impact Action Verbs](/blog-post?slug=best-resume-power-verbs) to eliminate passive language, and run your draft through our [Free ATS Resume Checker](/ats-score-checker) to verify keyword parsing scores.

---

### 4. Technical & Strategic Skills Taxonomy

Organize your abilities into structured clusters so recruiters and algorithm spiders can verify core competencies within milliseconds:

* **Hard Skills & Tools (ATS Parsing Signals):** Python, React, AWS Lambda, Docker, SQL, Kubernetes, Figma, Tableau.
* **Methodologies & Domain Knowledge:** Agile/Scrum, CI/CD Pipelines, System Architecture, Financial Modeling.
* **Workplace Collaboration (Interview Verification):** Stakeholder Alignment, Technical Mentorship, Cross-Functional Team Leadership.

> ⚠️ **Crucial ATS Warning:** Never engage in "white-fonting" (pasting hidden job description text in white fonts). Modern NLP parsers extract text regardless of font color and automatically flag candidate submissions for deceptive keyword manipulation.

To benchmark compensation against your current skill repertoire, explore our real-time [Tech Salary Benchmark Tool](/salary-benchmark) or review recommended skills on the [Career Roadmap](/career-roadmap).

---

### 5. Education & Academic Credentials

Keep your academic background concise:
* **Degree & Field of Study** (e.g., *B.S. in Computer Science*)
* **Institution Name & Graduation Year**
* **Academic Honors / CGPA** (only include GPA if $\\ge$ 3.5/4.0 or within 3 years of graduation)

---

## Strategic Resume Additions: When to Go Beyond the Basics

| Section | Best Suited For | Core ATS Benefit |
|---|---|---|
| **Industry Certifications** | AWS, CISSP, PMP, Scrum Master | Validates standardized skills for automated filter gates. |
| **Independent Projects** | Freshers, Campus Placements, Bootcamps | Demonstrates applied execution without formal employer history. |
| **Publications & Patents** | R&D, PhDs, AI/ML Engineers | Exceptional authority signal for senior research positions. |
| **Languages** | Global Enterprises, Client Success | Differentiates candidates in multinational accounts. |

For tested single-column layouts that pass automated parser tests, browse our [ATS-Friendly Resume Templates](/templates).

---

**Does your current resume pass automated ATS screening?** Don't let formatting mistakes cost you an interview. Use our [Free ATS Resume Checker](/ats-score-checker) or build a verified recruiter-ready CV using our [AI Resume Builder](/form-index).
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
      heroImage:    post.heroImage || '',
      category:     post.category || 'Tutorials',
      date:         post.date,
      readTime:     post.readTime || '',
      author:       post.author,
      authorRole:   post.authorRole || '',
      authorAvatar: post.authorAvatar || '',
      tags:         post.tags || [],
      faqs:         post.faqs || [],
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
