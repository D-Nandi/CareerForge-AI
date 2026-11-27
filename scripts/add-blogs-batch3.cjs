const fs = require('fs');
const path = require('path');

const blogDataPath = path.resolve(__dirname, '../client/blog-data.js');
let fileContent = fs.readFileSync(blogDataPath, 'utf8');

console.log('1. Injecting reciprocal inbound links for 3 new blogs...');

// 1. leveraging-ai-for-your-resume -> mastering-the-job-hunt-with-ai
fileContent = fileContent.replace(
  'read [how to choose the right AI resume builder for your career transition](/blog/how-to-choose-the-right-ai-resume-builder-for-your-career-transition) and consult our end-to-end blueprint on [mastering the AI resume](/blog/mastering-the-ai-resume-guide) to choose the tool that aligns with your specific career phase.',
  'read [how to choose the right AI resume builder for your career transition](/blog/how-to-choose-the-right-ai-resume-builder-for-your-career-transition), consult our end-to-end blueprint on [mastering the AI resume](/blog/mastering-the-ai-resume-guide), and discover modern job search workflows in [mastering the job hunt with AI](/blog/mastering-the-job-hunt-with-ai) to choose the tool that aligns with your specific career phase.'
);

// 2. how-to-choose-the-right-ai-resume-builder-for-your-career-transition -> mastering-the-job-hunt-with-ai
fileContent = fileContent.replace(
  'Review our comprehensive buyer\'s guide on [what to look for in a resume builder](/blog/what-to-look-for-in-a-resume-builder), compare [AI resume builder vs writing a resume from scratch](/blog/ai-resume-builder-vs-writing-a-resume-from-scratch)',
  'Review our comprehensive buyer\'s guide on [what to look for in a resume builder](/blog/what-to-look-for-in-a-resume-builder), learn modern job hunt workflows in [mastering the job hunt with AI](/blog/mastering-the-job-hunt-with-ai), compare [AI resume builder vs writing a resume from scratch](/blog/ai-resume-builder-vs-writing-a-resume-from-scratch)'
);

// 3. mastering-the-ai-resume-guide -> mastering-the-job-hunt-with-ai
fileContent = fileContent.replace(
  'Once interviews are secured, practice role-specific technical questions with [AI mock interview practice](/interview-prep).',
  'Discover end-to-end application strategies in our playbook on [mastering the job hunt with AI](/blog/mastering-the-job-hunt-with-ai), and once interviews are secured, practice role-specific technical questions with [AI mock interview practice](/interview-prep).'
);

// 4. how-to-use-ai-to-optimize-your-resume-for-ats-success -> mastering-the-applicant-tracking-system
fileContent = fileContent.replace(
  'Avoid these errors by reviewing [15 common resume mistakes that cost you an interview](/blog/15-common-resume-mistakes-that-can-cost-you-an-interview).',
  'Avoid these errors by reviewing [15 common resume mistakes that cost you an interview](/blog/15-common-resume-mistakes-that-can-cost-you-an-interview) and our in-depth blueprint on [mastering the applicant tracking system](/blog/mastering-the-applicant-tracking-system).'
);

// 5. how-to-optimize-your-resume-skills-using-an-ai-resume-builder -> mastering-the-applicant-tracking-system
fileContent = fileContent.replace(
  'and discover proven techniques on [how to use AI to optimize your resume for ATS success](/blog/how-to-use-ai-to-optimize-your-resume-for-ats-success) without losing your authentic human voice.',
  'discover proven techniques on [how to use AI to optimize your resume for ATS success](/blog/how-to-use-ai-to-optimize-your-resume-for-ats-success), and consult our comprehensive breakdown on [mastering the applicant tracking system](/blog/mastering-the-applicant-tracking-system) without losing your authentic human voice.'
);

// 6. 15-common-resume-mistakes-that-can-cost-you-an-interview -> mastering-the-applicant-tracking-system
fileContent = fileContent.replace(
  'Explore our guide on [writing a resume with no work experience](/blog/how-to-write-a-resume-with-no-work-experience) for formatting ideas.',
  'Explore our guide on [writing a resume with no work experience](/blog/how-to-write-a-resume-with-no-work-experience) and master automated screening rules in our guide to [mastering the applicant tracking system](/blog/mastering-the-applicant-tracking-system).'
);

// 7. mastering-ai-resume-writing -> mastering-ai-for-professional-document-creation
fileContent = fileContent.replace(
  'For an honest evaluation of benefits and limits, explore [should you use an AI resume builder?](/blog/should-you-use-an-ai-resume-builder).',
  'For advanced prompt workflows, review [mastering AI for professional document creation](/blog/mastering-ai-for-professional-document-creation), and for an honest evaluation of benefits and limits, explore [should you use an AI resume builder?](/blog/should-you-use-an-ai-resume-builder).'
);

// 8. how-to-write-resume-bullet-points-that-show-impact -> mastering-ai-for-professional-document-creation
fileContent = fileContent.replace(
  'verify your document through our [Free ATS Resume Checker](/ats-score-checker) to ensure clean text extraction.',
  'explore prompt frameworks in our masterclass on [mastering AI for professional document creation](/blog/mastering-ai-for-professional-document-creation), and verify your document through our [Free ATS Resume Checker](/ats-score-checker) to ensure clean text extraction.'
);

// 9. what-is-an-ai-resume-builder -> mastering-ai-for-professional-document-creation
fileContent = fileContent.replace(
  'Explore our comprehensive blueprint for [mastering the AI resume](/blog/mastering-the-ai-resume-guide) to understand modern parsing behavior, and once your resume opens doors',
  'Explore our comprehensive blueprint for [mastering the AI resume](/blog/mastering-the-ai-resume-guide) and our prompt engineering guide on [mastering AI for professional document creation](/blog/mastering-ai-for-professional-document-creation) to understand modern parsing behavior, and once your resume opens doors'
);

console.log('2. Loading 3 blog markdown files...');

const inputDir = path.resolve(__dirname, 'blogs_input');
const blog10Content = fs.readFileSync(path.join(inputDir, 'blog10.md'), 'utf8');
const blog11Content = fs.readFileSync(path.join(inputDir, 'blog11.md'), 'utf8');
const blog12Content = fs.readFileSync(path.join(inputDir, 'blog12.md'), 'utf8');

const postsToAdd = [
  {
    slug: "mastering-the-job-hunt-with-ai",
    title: "Mastering the Job Hunt: How to Leverage AI for Career Growth",
    subtitle: "Learn how to combine intelligent resume tailoring, advanced prompt engineering, strategic outreach, and mock interview practice to accelerate your career.",
    category: "Job Search",
    readTime: "8 min read",
    date: "Nov 24, 2026",
    author: "Marcus Vance",
    authorRole: "Executive Career Coach & Resume Strategist",
    featured: false,
    summary: "Reclaim control of your job search. Discover multi-step prompt engineering frameworks, outreach templates, and AI mock interview workflows to land more offers.",
    heroImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Job Search", "AI Resume Builder", "Career Growth", "Interview Prep", "Prompt Engineering"],
    faqs: [
      {
        question: "Can recruiters detect if I used AI to write my application materials?",
        answer: "Recruiters typically do not penalize applicants for using AI as a brainstorming or formatting assistant. However, they will reject resumes that sound robotic, lack specific metrics, or contain generic buzzwords. Keep the human in the loop to edit and polish every sentence."
      },
      {
        question: "How often should I tailor my resume with AI?",
        answer: "You should tailor your resume for every distinct role you apply for. Focus on matching the top 5-7 keywords and core competencies highlighted in the specific job posting."
      },
      {
        question: "What is the best way to explain employment gaps when using AI?",
        answer: "Instruct the AI to emphasize personal projects, freelance consulting, or continuing education during that period. Frame the gap as an active period of professional development."
      },
      {
        question: "How does AI interview prep differ from practicing with a friend?",
        answer: "AI interview simulations provide objective, real-time feedback on pacing, keyword alignment, and structure (such as the STAR method) without social pressure or scheduling constraints."
      }
    ],
    video: {
      title: "The Right Way To Use AI In Your Job Search | Indeed",
      description: "Career experts break down how to strategically use AI for career growth, job matching, resume tailoring, and interview prep without losing your human voice.",
      thumbnailUrl: "https://i.ytimg.com/vi/3SdaTMI3eDc/maxresdefault.jpg",
      uploadDate: "2024-02-15T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=3SdaTMI3eDc",
      embedUrl: "https://www.youtube-nocookie.com/embed/3SdaTMI3eDc"
    },
    content: blog10Content
  },
  {
    slug: "mastering-the-applicant-tracking-system",
    title: "Mastering the Applicant Tracking System: A Guide for Modern Job Seekers",
    subtitle: "Demystify modern Applicant Tracking Systems with proven formatting rules, transferable skills mapping, and recruiter outreach strategies.",
    category: "ATS Optimization",
    readTime: "9 min read",
    date: "Nov 25, 2026",
    author: "David Chen",
    authorRole: "Senior Technical Recruiter",
    featured: false,
    summary: "Understand how automated ATS software parses, stores, and filters candidates. Learn how to format your layout, highlight transferable skills, and bypass digital filters.",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    tags: ["Applicant Tracking System", "ATS Optimization", "Resume Formatting", "Job Search", "Career Transition"],
    faqs: [
      {
        question: "Will using a PDF help or hurt my chances with an ATS?",
        answer: "PDFs are generally safe for modern systems, but older legacy ATS platforms sometimes struggle with complex PDF layers. A clean, text-based PDF or a standard Word document (.docx) provides the highest compatibility."
      },
      {
        question: "Does an ATS search for my GPA?",
        answer: "Only if the job description specifically requires it or if you are applying for a recent graduate role. For experienced professionals, prioritize work history and professional certifications over academic metrics."
      },
      {
        question: "How many keywords should I include?",
        answer: "Focus on the top 5-7 skills listed in the job description. Integrate them into your Professional Summary and Work Experience bullets rather than creating a separate, disconnected keywords list at the bottom of your resume."
      },
      {
        question: "Is it worth applying if I don't meet every single requirement?",
        answer: "Yes. Job descriptions are often wish lists. If you meet 60% to 70% of the core requirements, your profile is still a competitive candidate for consideration."
      }
    ],
    video: {
      title: "Jobscan for ATS Resume Optimization | Tool Overview",
      description: "Learn how Applicant Tracking Systems parse and index candidate profiles, and discover how to optimize layout and keyword placement for higher match rates.",
      thumbnailUrl: "https://i.ytimg.com/vi/1b3Ok7JgnpQ/maxresdefault.jpg",
      uploadDate: "2024-01-20T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=1b3Ok7JgnpQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/1b3Ok7JgnpQ"
    },
    content: blog11Content
  },
  {
    slug: "mastering-ai-for-professional-document-creation",
    title: "Mastering AI for Professional Document Creation",
    subtitle: "Unlock professional document drafting with the Four Pillars of Context, modular prompt libraries, and rigorous human-in-the-loop review.",
    category: "AI Tools",
    readTime: "8 min read",
    date: "Nov 26, 2026",
    author: "Elena Rostova",
    authorRole: "HR Technology Consultant",
    featured: false,
    summary: "Move beyond basic prompts. Learn how to construct high-impact career documents using persona prompting, STAR method constraints, and modular prompt libraries.",
    heroImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Prompt Engineering", "AI Resume Builder", "Document Creation", "Resume Writing", "Career Advice"],
    faqs: [
      {
        question: "How do I make my resume sound more human after using AI?",
        answer: "Focus on injecting specific results, verified metrics, and personal anecdotes that the AI couldn't possibly know. Replace abstract corporate adjectives with hard data and concrete examples from your past roles."
      },
      {
        question: "Can AI effectively handle employment gaps on my resume?",
        answer: "Yes, but you must provide the context. Use prompts that frame gaps as periods of professional development, skill acquisition, or necessary life transitions, keeping the focus on your current readiness to contribute."
      },
      {
        question: "What is the best way to prompt for a cover letter?",
        answer: "Input the job description alongside your resume. Use a prompt like: 'Draft a concise 3-paragraph cover letter that connects my specific experience in [Skill A] to the company’s stated goal of [Company Goal]. Keep it under 300 words and maintain a conversational, professional tone.'"
      },
      {
        question: "Should I worry about AI detection on my resume?",
        answer: "Most recruiters prioritize clarity, relevance, and verifiable achievements over detecting AI use. However, if your document sounds like a generic template filled with buzzwords, it will be discarded. Always prioritize original, evidence-based writing over AI-generated filler."
      },
      {
        question: "Can I use AI to help with my LinkedIn profile?",
        answer: "Absolutely. Use the same prompt library logic to rewrite your 'About' section or to generate professional headlines that align with the keywords used in your industry’s job postings. Once your profile generates interest, prepare for interviews with AI mock interview practice."
      }
    ],
    video: {
      title: "How to Make Your Resume Skills Stand Out | Indeed",
      description: "Step-by-step masterclass on engineering high-impact career documents, structuring achievement-oriented bullet points, and avoiding generic filler.",
      thumbnailUrl: "https://i.ytimg.com/vi/s5YzyeYF_FU/maxresdefault.jpg",
      uploadDate: "2024-03-05T08:00:00+00:00",
      url: "https://www.youtube.com/watch?v=s5YzyeYF_FU",
      embedUrl: "https://www.youtube-nocookie.com/embed/s5YzyeYF_FU"
    },
    content: blog12Content
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
console.log('✅ client/blog-data.js updated successfully with 23 total posts!');
