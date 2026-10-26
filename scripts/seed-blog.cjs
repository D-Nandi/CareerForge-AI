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
  "what-information-should-you-put-on-a-resume": {
    slug: "what-information-should-you-put-on-a-resume",
    title: "What to Put on a Resume in 2026 (Guide) | CareerNest",
    subtitle: "Learn the 5 essential resume sections, key additions, and ATS formatting rules needed to pass automated filters and impress recruiters in 2026.",
    category: "Resume Writing",
    readTime: "7 min read",
    date: "Oct 13, 2026",
    author: "Marcus Vance",
    authorRole: "Senior Career Coach",
    featured: true,
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
        video: {
      title: "How to Make a Resume (Step-by-Step with Real Examples)",
      description: "Step-by-step masterclass covering what essential sections to include on a modern resume, how to format bullet points, and how to pass automated ATS filters.",
      thumbnailUrl: "https://i.ytimg.com/vi/Tt08KmFfIYQ/maxresdefault.jpg",
      uploadDate: "2024-01-15T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=Tt08KmFfIYQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/Tt08KmFfIYQ"
    },
    content: `
Modern corporate hiring in 2026 is governed by automated screening engines. Before a recruiter spends an average of 7.4 seconds skimming your credentials, Applicant Tracking Systems (ATS) such as Workday, Greenhouse, Taleo, Lever, and iCIMS parse your document via Natural Language Processing (NLP) tokenization. 

To secure interview shortlists, your resume must balance machine-readable UTF-8 layout standards with compelling, metric-backed professional storytelling.

---

## The 5 Essential Resume Sections

> **What belongs on a modern resume?**  
> In 2026, an effective resume contains five non-negotiable sections: **Contact Header**, **Professional Summary**, **Work Experience**, **Skills**, and **Education**. Additional sections like Certifications, Technical Projects, and Languages should only be included when they directly map to job description keywords.

<figure>
  <img src="/img/blog/ats-resume-anatomy-2026.svg" alt="Anatomy of an ATS compliant resume layout showing 5 essential sections in 2026" width="760" height="456" loading="lazy" />
  <figcaption>Visual Guide: The 5 core sections required for automated parsing and human recruiter review in 2026.</figcaption>
</figure>

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

## Video Guide: Modern Resume Masterclass & ATS Walkthrough

<div class="video-container">
  <iframe src="https://www.youtube-nocookie.com/embed/Tt08KmFfIYQ" title="How to Make a Resume (Step-by-Step with Real Examples)" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

**Does your current resume pass automated ATS screening?** Don't let formatting mistakes cost you an interview. Use our [Free ATS Resume Checker](/ats-score-checker) or build a verified recruiter-ready CV using our [AI Resume Builder](/form-index).
    `.trim()
  },
  "what-is-a-resume-and-what-is-it-used-for": {
    slug: "what-is-a-resume-and-what-is-it-used-for",
    title: "What Is a Resume and What Is It Used For? (Guide) | CareerNest",
    subtitle: "A resume is a targeted marketing document that summarizes your career trajectory, skills, and business impact to secure job interviews in 2026.",
    category: "Resume Writing",
    readTime: "5 min read",
    date: "Oct 26, 2026",
    author: "Marcus Vance",
    authorRole: "Senior Career Coach",
    featured: false,
    summary: "A resume is a targeted marketing document that summarizes your career trajectory, skills, and business impact to secure job interviews in 2026.",
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    tags: ["Resume Writing", "Resume Basics", "ATS", "Career Advice", "CV vs Resume"],
    faqs: [
      {
        question: "How does a CV differ from a resume?",
        answer: "A resume is a customizable marketing document for corporate job seekers, usually limited to two pages. A CV is a comprehensive, static record of your academic or scientific history used primarily for research or teaching roles where full historical documentation is required."
      },
      {
        question: "What are the common resume formats I can use?",
        answer: "The three primary types are chronological, which lists work history in date order; functional, which organizes content by skill sets rather than timelines; and hybrid, which merges both structures to highlight specific achievements alongside a standard employment history."
      },
      {
        question: "What is the ideal resume length?",
        answer: "Unless you are a senior executive or an academic with extensive research publications, a resume should be one to two pages. Modern trends favor extreme brevity; recruiters value clarity and high-impact, actionable data over long-form descriptions of past daily routines."
      },
      {
        question: "How do ATS platforms scan my file?",
        answer: "An ATS is software that screens and sorts applications. It uses Optical Character Recognition (OCR) and semantic parsing to extract your skills and employment history into a database, looking for contextual connections between your content and the job description requirements."
      },
      {
        question: "Which resume section matters most?",
        answer: "The \"Professional Summary\" and your most recent employment experience are the most vital segments. These areas occupy the \"golden triangle\" of eye-tracking patterns, serving as the first points of interaction for both AI screening tools and human recruiters making a quick decision to proceed."
      }
    ],
    video: {
      title: "Curriculum Vitae (CV) vs Resumé | What You Need to Know",
      description: "A clear breakdown of what a resume is, what hiring managers use it for, and key differences between a corporate resume and an academic CV.",
      thumbnailUrl: "https://i.ytimg.com/vi/tHQXZJ2f00Y/maxresdefault.jpg",
      uploadDate: "2021-06-19T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=tHQXZJ2f00Y",
      embedUrl: "https://www.youtube-nocookie.com/embed/tHQXZJ2f00Y"
    },
    content: `
A resume is a targeted marketing document that summarizes your career trajectory, technical abilities, and unique value propositions. Its primary function is to serve as a high-level bridge between your history and a recruiter’s needs, specifically designed to secure an interview rather than to function as an exhaustive biography.

---

## What Exactly Is a Resume?

A resume is a concise summary of your employment history, educational background, and skill sets intended to pique the interest of hiring managers. It acts as a curated highlight reel that showcases your ability to solve specific business problems rather than simply functioning as a chronological record of tasks performed.

Moving away from the legacy "list of duties" model remains vital for modern applicants. Recruiters prioritize quantified achievements over static responsibilities. A weak entry looks like: *"Responsible for managing a team."* A strong, results-driven entry reads: *"Increased quarterly department output by 22% through the implementation of agile workflows."* This shift from process-oriented descriptions to results-driven data helps you stand out. Consider your document a persuasive sales brochure for your labor, emphasizing the value you generate rather than the time you have spent in previous seats.

---

## Why Do You Need a Resume?

A resume functions as the critical gatekeeper between your talent and a company’s internal hiring workflow, including Applicant Tracking Systems (ATS) like Workday or Greenhouse. It is the primary data source that facilitates an initial semantic screening, determining whether your qualifications warrant a human review by a talent acquisition lead.

The **7-second rule** highlights the reality of candidate screening. Recruiters perform a rapid visual scan to extract data points like job titles, tenure, and high-impact keywords. If your document uses complex graphics, non-standard fonts, or nested tables, an ATS may fail to parse your data, leading to a "ghosting" scenario where your credentials are never read. Furthermore, your resume acts as the foundational blueprint for your professional brand, matching the narrative found on your LinkedIn profile. Inconsistency between these digital touchpoints often raises flags regarding your attention to detail.

<figure>
  <img src="/img/blog/ats-scanning-pipeline.svg" alt="Step-by-step ATS scanning workflow from resume parsing to semantic keyword ranking" width="760" height="400" loading="lazy" />
  <figcaption>The 4-stage automated ATS screening pipeline: document intake, entity parsing, semantic scoring, and candidate shortlisting.</figcaption>
</figure>

---

## What Information Should You Include?

Standard resume sections provide a structured framework that allows AI-powered parsing engines to accurately index your data. While basic contact details and employment history are universal, high-impact documents incorporate modern sections such as technical certifications, hyper-linked project portfolios, and language proficiencies to demonstrate versatile, adaptable skill sets.

* **Header:** Include your name, city/state, phone number, and a \`name@example.com\` address.
* **Professional Summary:** Use a three-sentence pitch covering your domain expertise and core business impact.
* **Experience:** List roles in reverse-chronological order, focusing on bullet points that describe specific outcomes.
* **Skills:** Differentiate between hard technical skills—like SQL or Python—and broad industry competencies.
* **Education:** Keep this brief if you have more than three years of experience, prioritizing degrees and specific certifications.

Candidates with non-traditional paths, such as career gaps or freelance transitions, should utilize a "Functional" layout that highlights core competencies over timeline continuity. If you have completed international certifications, create a dedicated "Credentials" section to ensure those global standards are immediately visible to local hiring authorities. Check out our comprehensive guide on [What to Put on a Resume in 2026](/blog/what-information-should-you-put-on-a-resume) for full section-by-section walkthroughs.

---

## Resume vs. CV: What’s the Difference?

A resume is a brief, 1-2 page document emphasizing specific accomplishments and skills, while a Curriculum Vitae (CV) is an exhaustive, document-length account of your academic and professional history. Resumes are the standard for corporate roles globally, whereas CVs are typically requested for scientific, academic, or high-level international medical placements.

| Feature | Resume | Curriculum Vitae (CV) |
|---|---|---|
| **Typical Length** | 1–2 pages | Unlimited (often 3+) |
| **Primary Focus** | Skills and achievements | Academic and research history |
| **Geographic Usage** | North America, parts of Asia | Europe, Middle East, Academia |
| **Updates** | Frequent (job-specific) | Rare (career-wide) |
| **Primary Goal** | Getting an interview | Comprehensive data disclosure |

<figure>
  <img src="/img/blog/resume-vs-cv-infographic.svg" alt="Infographic comparing Resume vs CV differences in length, purpose, and regional usage" width="760" height="400" loading="lazy" />
  <figcaption>Strategic differences: Resumes focus on 1–2 page quantified corporate outcomes; CVs provide comprehensive academic and research history.</figcaption>
</figure>

---

## How to Build a Modern Resume

Building a modern resume requires a balance between human readability and machine-readable optimization, utilizing clean typography and clear headings to facilitate quick parsing. You must leverage semantic keyword positioning—placing your most critical certifications and industry-standard technical tools in the top third of the document to capture immediate attention.

Avoid "keyword stuffing," a tactic where applicants list dozens of terms in white text to trick an ATS. AI-driven screening now uses vector similarity to understand context; the system looks for the relationship between the tool and your application of that tool. If you claim proficiency in Kubernetes, your experience section must show where you deployed it. By using standard formats, such as a clean, text-based PDF or UTF-8 encoded file, you optimize your chances of passing through sophisticated parsing layers. Explore our tested [ATS-Friendly Resume Templates](/templates) to start with a verified layout.

---

## Video Guide: Resume vs. CV Explained

<div class="video-container">
  <iframe src="https://www.youtube-nocookie.com/embed/tHQXZJ2f00Y" title="Curriculum Vitae (CV) vs Resumé | What You Need to Know" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Frequently Asked Questions

### How does a CV differ from a resume?
A resume is a customizable marketing document for corporate job seekers, usually limited to two pages. A CV is a comprehensive, static record of your academic or scientific history used primarily for research or teaching roles where full historical documentation is required.

### What are the common resume formats I can use?
The three primary types are chronological, which lists work history in date order; functional, which organizes content by skill sets rather than timelines; and hybrid, which merges both structures to highlight specific achievements alongside a standard employment history.

### What is the ideal resume length?
Unless you are a senior executive or an academic with extensive research publications, a resume should be one to two pages. Modern trends favor extreme brevity; recruiters value clarity and high-impact, actionable data over long-form descriptions of past daily routines.

### How do ATS platforms scan my file?
An ATS is software that screens and sorts applications. It uses Optical Character Recognition (OCR) and semantic parsing to extract your skills and employment history into a database, looking for contextual connections between your content and the job description requirements.

### Which resume section matters most?
The "Professional Summary" and your most recent employment experience are the most vital segments. These areas occupy the "golden triangle" of eye-tracking patterns, serving as the first points of interaction for both AI screening tools and human recruiters making a quick decision to proceed.

---

<div style="background:linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.08)); border:1px solid rgba(99,102,241,0.3); border-radius:14px; padding:24px; margin:36px 0; display:flex; flex-direction:column; gap:12px;">
  <strong style="color:var(--text); font-size:1.15rem; font-family:var(--font-head);">Ready to elevate your job search strategy?</strong>
  <p style="color:var(--text-muted); font-size:0.92rem; margin:0; line-height:1.6;">Our tools are built to help you navigate the 2026 hiring landscape with precision. Start crafting your high-conversion document today with our AI Resume Builder to pass the screen and secure your next interview.</p>
  <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px;">
    <a href="/form-index" class="btn-primary" style="display:inline-block; padding:10px 22px; text-decoration:none; color:#ffffff !important;">Build AI Resume Free →</a>
    <a href="/ats-score-checker" class="btn-ghost" style="display:inline-block; padding:10px 22px; text-decoration:none; color:var(--text) !important;">Check ATS Score →</a>
  </div>
</div>
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
    const payload = {
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
    };

    await Blog.findOneAndUpdate({ slug }, { $set: payload }, { upsert: true });
    console.log(`[SYNCED] ${slug}`);
  }

  // Remove any legacy dummy blog posts from MongoDB
  const keepSlugs = Object.keys(BLOG_POSTS);
  const deleted = await Blog.deleteMany({ slug: { $nin: keepSlugs } });
  if (deleted.deletedCount > 0) {
    console.log(`[CLEANED] Removed ${deleted.deletedCount} legacy dummy blog posts from MongoDB.`);
  }

  await mongoose.disconnect();
  console.log('✅ Seeding completed.');
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
