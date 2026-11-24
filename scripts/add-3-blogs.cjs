const fs = require('fs');
const path = require('path');

const blogDataPath = path.resolve(__dirname, '../client/blog-data.js');
let fileContent = fs.readFileSync(blogDataPath, 'utf8');

console.log('1. Injecting reciprocal inbound links for 3 new blogs...');

// 1. what-is-an-ai-resume-builder -> mastering-the-ai-resume-guide
fileContent = fileContent.replace(
  'Once your resume opens doors, prepare for behavioral screening calls with [AI mock interview practice](/interview-prep). This hybrid approach',
  'Explore our comprehensive blueprint for [mastering the AI resume](/blog/mastering-the-ai-resume-guide) to understand modern parsing behavior, and once your resume opens doors, prepare for behavioral screening calls with [AI mock interview practice](/interview-prep). This hybrid approach'
);

// 2. leveraging-ai-for-your-resume -> mastering-the-ai-resume-guide
fileContent = fileContent.replace(
  'If you are navigating a pivot, read [how to choose the right AI resume builder for your career transition](/blog/how-to-choose-the-right-ai-resume-builder-for-your-career-transition)',
  'If you are navigating a pivot, read [how to choose the right AI resume builder for your career transition](/blog/how-to-choose-the-right-ai-resume-builder-for-your-career-transition) and consult our end-to-end blueprint on [mastering the AI resume](/blog/mastering-the-ai-resume-guide)'
);

// 3. what-to-look-for-in-a-resume-builder -> mastering-ai-resume-writing
fileContent = fileContent.replace(
  'Explore entry-level and pivot frameworks in our guides on [writing a resume with no work experience](/blog/how-to-write-a-resume-with-no-work-experience) and [choosing the best resume format](/blog/what-is-the-best-resume-format).',
  'Explore entry-level and pivot frameworks in our guides on [writing a resume with no work experience](/blog/how-to-write-a-resume-with-no-work-experience), [choosing the best resume format](/blog/what-is-the-best-resume-format), and our strategic guide to [mastering AI resume writing](/blog/mastering-ai-resume-writing).'
);

// 4. ai-resume-builder-vs-writing-a-resume-from-scratch -> mastering-ai-resume-writing
fileContent = fileContent.replace(
  'read our comprehensive explainer on [what is an AI resume builder](/blog/what-is-an-ai-resume-builder) and make sure your structure contains all [essential resume sections](/blog/what-information-should-you-put-on-a-resume).',
  'read our comprehensive explainer on [what is an AI resume builder](/blog/what-is-an-ai-resume-builder), explore our advanced technical guide on [mastering AI resume writing](/blog/mastering-ai-resume-writing), and make sure your structure contains all [essential resume sections](/blog/what-information-should-you-put-on-a-resume).'
);

// 5. how-to-optimize-your-resume-skills-using-an-ai-resume-builder -> how-to-use-ai-to-optimize-your-resume-for-ats-success
fileContent = fileContent.replace(
  'and master tactical frameworks for [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume) without losing your authentic human voice.',
  'master tactical frameworks for [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume), and discover proven techniques on [how to use AI to optimize your resume for ATS success](/blog/how-to-use-ai-to-optimize-your-resume-for-ats-success) without losing your authentic human voice.'
);

// 6. should-you-use-an-ai-resume-builder -> how-to-use-ai-to-optimize-your-resume-for-ats-success
fileContent = fileContent.replace(
  'test your draft with our [Free ATS Resume Checker](/ats-score-checker) and align your sections with the [essential resume sections](/blog/what-information-should-you-put-on-a-resume).',
  'test your draft with our [Free ATS Resume Checker](/ats-score-checker), follow our deep-dive on [how to use AI to optimize your resume for ATS success](/blog/how-to-use-ai-to-optimize-your-resume-for-ats-success), and align your sections with the [essential resume sections](/blog/what-information-should-you-put-on-a-resume).'
);

console.log('2. Loading 3 blog markdown files...');

const inputDir = path.resolve(__dirname, 'blogs_input');
const blog7Content = fs.readFileSync(path.join(inputDir, 'blog7.md'), 'utf8');
const blog8Content = fs.readFileSync(path.join(inputDir, 'blog8.md'), 'utf8');
const blog9Content = fs.readFileSync(path.join(inputDir, 'blog9.md'), 'utf8');

const postsToAdd = [
  {
    slug: "mastering-the-ai-resume-guide",
    title: "Mastering the AI Resume: A Guide for Modern Job Seekers",
    subtitle: "Discover how to format, structure, and strategically optimize your resume with AI tools to satisfy automated ATS filters while captivating human hiring managers.",
    category: "Resume Writing",
    readTime: "9 min read",
    date: "Nov 19, 2026",
    author: "Marcus Vance",
    authorRole: "Executive Career Coach & Resume Strategist",
    featured: false,
    summary: "Learn how to craft high-impact summaries, integrate strategic keywords, and optimize machine readability so your resume breezes past ATS filters and into recruiters' hands.",
    heroImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: ["AI Resume Builder", "ATS Optimization", "Resume Writing", "Job Search", "Career Tips"],
    faqs: [
      {
        question: "Do I need a different resume for every single job application?",
        answer: "You should tailor your professional summary and skills section for every application. Adjusting your keywords to match the specific job description increases your ranking significantly."
      },
      {
        question: "Will the AI reject me if I have a career gap?",
        answer: "No. ATS software is designed to parse data. If you label the gap clearly or include relevant training or freelance projects during that time, the system will process your experience without issue."
      },
      {
        question: "Is it better to use a PDF or a Word document?",
        answer: "Both are generally acceptable, but Word documents are often easier for some legacy ATS platforms to parse. If you use a PDF, ensure it is a text-based PDF rather than an image-based scan."
      }
    ],
    video: {
      title: "How to Write an ATS-Friendly Resume (Full Walkthrough)",
      description: "Complete step-by-step tutorial on formatting, keyword optimization, and structuring your resume to pass automated ATS filters and reach human recruiters.",
      thumbnailUrl: "https://i.ytimg.com/vi/sD0VXsorduI/maxresdefault.jpg",
      uploadDate: "2024-01-15T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=sD0VXsorduI",
      embedUrl: "https://www.youtube-nocookie.com/embed/sD0VXsorduI"
    },
    content: blog7Content
  },
  {
    slug: "mastering-ai-resume-writing",
    title: "Mastering AI Resume Writing: A Strategic Guide for Modern Professionals",
    subtitle: "Transform your raw career milestones into a precision-engineered narrative using semantic matching, transformer architectures, and edge-case handling.",
    category: "AI Tools",
    readTime: "8 min read",
    date: "Nov 21, 2026",
    author: "Elena Rostova",
    authorRole: "HR Technology Consultant",
    featured: false,
    summary: "Discover how transformer architectures power AI resume generation, how semantic matching beats keyword stuffing, and how to navigate edge cases like career gaps.",
    heroImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    tags: ["AI Resume Builder", "Semantic Matching", "Career Pivot", "ATS Compliance", "Resume Writing"],
    faqs: [
      {
        question: "Will AI resume writing result in a generic-sounding document?",
        answer: "It can if you rely solely on default outputs. The best approach involves using the tool to draft technical structures and then manually refining the language to include your personal anecdotes, specific metrics, and unique project results."
      },
      {
        question: "Does using AI for my resume hurt my chances with human recruiters?",
        answer: "Human recruiters care about clarity and impact. If your AI-assisted resume is easier to read and clearly highlights your achievements, it increases your chances. Avoid robotic, repetitive language, as human readers are sensitive to unnatural phrasing."
      },
      {
        question: "Should I disclose that I used AI tools for my resume?",
        answer: "It is generally unnecessary. AI is considered a productivity tool, similar to spell-checkers or design software. As long as the content remains factually accurate and represents your actual skill set, you are using the technology appropriately."
      },
      {
        question: "How do I handle AI-generated claims that are not true?",
        answer: "Never publish a resume containing fabricated skills or roles. AI models can hallucinate or over-optimize. You must audit every word of the generated document to ensure it reflects your professional reality accurately."
      },
      {
        question: "Are there specific AI tools I should avoid?",
        answer: "Avoid any tool that guarantees job interviews or promises magic results. Focus on established platforms that prioritize formatting and semantic optimization rather than those that claim to bypass recruiter scrutiny through unethical means."
      }
    ],
    video: {
      title: "Step-by-Step ATS Resume Tutorial & Keyword Optimization",
      description: "Learn how to format and optimize your resume for Applicant Tracking Systems using smart keyword placement, semantic structure, and modern templates.",
      thumbnailUrl: "https://i.ytimg.com/vi/9Ph_t_L1EqY/maxresdefault.jpg",
      uploadDate: "2024-02-10T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=9Ph_t_L1EqY",
      embedUrl: "https://www.youtube-nocookie.com/embed/9Ph_t_L1EqY"
    },
    content: blog8Content
  },
  {
    slug: "how-to-use-ai-to-optimize-your-resume-for-ats-success",
    title: "How to Use AI to Optimize Your Resume for ATS Success",
    subtitle: "Master strategic keyword integration, technical skill verification, and parsing best practices to conquer modern Applicant Tracking Systems.",
    category: "ATS Optimization",
    readTime: "8 min read",
    date: "Nov 23, 2026",
    author: "David Chen",
    authorRole: "Senior Technical Recruiter",
    featured: false,
    summary: "Learn how to calibrate keyword density, vet AI-suggested technical proficiencies, and structure error-free formatting that guarantees ATS parse rate success.",
    heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    tags: ["ATS Optimization", "AI Resume Builder", "Technical Skills", "Resume Formatting", "Job Search"],
    faqs: [
      {
        question: "Does using AI make my resume look generic to recruiters?",
        answer: "It only looks generic if you rely on the initial AI output. If you treat the AI draft as a starting point and inject your personal voice, specific project metrics, and career narrative, it remains unique and tailored."
      },
      {
        question: "Will an ATS detect that I used ChatGPT to write my resume?",
        answer: "An ATS looks for relevant keywords and formatting compliance, not the origin of the text. As long as your document is formatted in a machine-readable way and contains the required industry terms, the software will rank it based on content, not writing style."
      },
      {
        question: "How do I handle career gaps or freelance work when using AI?",
        answer: "AI tools often provide generic templates that fail to account for non-linear career paths. Explicitly instruct the AI to categorize your freelance work as Contract Projects or label a career gap as a period of Professional Development and Skill Acquisition to provide context."
      },
      {
        question: "Should I include a skills section if I am an experienced professional?",
        answer: "Yes, keep a dedicated skills section to help with keyword density. However, focus this section on high-level, technical, or industry-specific expertise rather than basic software skills like Web Browsing or Zoom, which are expected of most modern professionals."
      },
      {
        question: "Is it safe to upload my personal data to resume AI tools?",
        answer: "Remove sensitive personal information like your full home address or social security number before inputting your resume into public AI models. Provide only the job description and your professional experience history to maintain privacy."
      }
    ],
    video: {
      title: "Resume Builder Walkthrough: Creating ATS-Optimized Applications",
      description: "Watch a live demonstration of building an ATS-compliant resume from scratch, optimizing keywords, and formatting for corporate portals.",
      thumbnailUrl: "https://i.ytimg.com/vi/LXSfa8eti9Q/maxresdefault.jpg",
      uploadDate: "2024-03-01T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=LXSfa8eti9Q",
      embedUrl: "https://www.youtube-nocookie.com/embed/LXSfa8eti9Q"
    },
    content: blog9Content
  }
];

function serializePost(slug, p) {
  const escapedContent = p.content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

  return `  "${slug}": {
    slug: ${JSON.stringify(p.slug)},
    title: ${JSON.stringify(p.title)},
    subtitle: ${JSON.stringify(p.subtitle)},
    category: ${JSON.stringify(p.category)},
    readTime: ${JSON.stringify(p.readTime)},
    date: ${JSON.stringify(p.date)},
    author: ${JSON.stringify(p.author)},
    authorRole: ${JSON.stringify(p.authorRole)},
    featured: ${p.featured},
    summary: ${JSON.stringify(p.summary)},
    heroImage: ${JSON.stringify(p.heroImage)},
    tags: ${JSON.stringify(p.tags, null, 2).replace(/\n/g, '\n    ')},
    faqs: ${JSON.stringify(p.faqs, null, 2).replace(/\n/g, '\n    ')},
    video: ${JSON.stringify(p.video, null, 2).replace(/\n/g, '\n    ')},
    content: \`
${escapedContent}
    \`.trim()
  }`;
}

const serializedPosts = postsToAdd.map(p => serializePost(p.slug, p)).join(',\n');

// Find closing bracket of BLOG_POSTS
const lastClosingIndex = fileContent.lastIndexOf('};');
if (lastClosingIndex === -1) {
  console.error('Could not find closing }; in client/blog-data.js');
  process.exit(1);
}

const beforeClosing = fileContent.substring(0, lastClosingIndex).trimEnd();
const afterClosing = fileContent.substring(lastClosingIndex);

const updatedContent = beforeClosing + ',\n' + serializedPosts + '\n' + afterClosing;

// Validate with new Function before writing
try {
  const sandbox = {};
  new Function('sandbox', `${updatedContent}; sandbox.BLOG_POSTS = BLOG_POSTS;`)(sandbox);
  const count = Object.keys(sandbox.BLOG_POSTS).length;
  console.log(`✅ Validation successful: Loaded ${count} blog posts cleanly.`);
} catch (err) {
  console.error('❌ Validation failed! Syntax error in generated blog data:', err);
  process.exit(1);
}

fs.writeFileSync(blogDataPath, updatedContent, 'utf8');
console.log('✅ client/blog-data.js updated successfully with 20 total posts!');
