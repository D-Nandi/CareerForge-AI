const fs = require('fs');
const path = require('path');

const blogDataPath = path.resolve(__dirname, '../client/blog-data.js');
let fileContent = fs.readFileSync(blogDataPath, 'utf8');

console.log('1. Injecting reciprocal inbound links for leveraging-ai-for-your-resume...');

// 1. how-to-choose-the-right-ai-resume-builder-for-your-career-transition
fileContent = fileContent.replace(
  'compare [AI resume builder vs writing a resume from scratch](/blog/ai-resume-builder-vs-writing-a-resume-from-scratch), and explore [ATS-friendly resume templates](/templates) with real-time keyword optimization.',
  'compare [AI resume builder vs writing a resume from scratch](/blog/ai-resume-builder-vs-writing-a-resume-from-scratch), learn strategic frameworks for [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume), and explore [ATS-friendly resume templates](/templates) with real-time keyword optimization.'
);

// 2. how-to-optimize-your-resume-skills-using-an-ai-resume-builder
fileContent = fileContent.replace(
  'and weigh whether [you should use an AI resume builder](/blog/should-you-use-an-ai-resume-builder) for your current search.',
  'weigh whether [you should use an AI resume builder](/blog/should-you-use-an-ai-resume-builder), and master tactical frameworks for [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume) without losing your authentic human voice.'
);

// 3. should-you-use-an-ai-resume-builder
fileContent = fileContent.replace(
  'Providing "context-rich" prompts is the secret to getting better results. A vague prompt like "write a resume for a marketing manager" will always result in a template.',
  'Providing "context-rich" prompts and applying the human-in-the-loop principle is the core of [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume). A vague prompt like "write a resume for a marketing manager" will always result in a template.'
);

// 4. ai-resume-builder-vs-writing-a-resume-from-scratch
fileContent = fileContent.replace(
  'To build a solid foundation, start with verified [ATS-friendly resume templates](/templates) and follow our walkthrough on [how to write a resume step-by-step](/blog/how-to-write-a-resume-step-by-step).',
  'To master this approach, explore our playbook on [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume), start with verified [ATS-friendly resume templates](/templates), and follow our walkthrough on [how to write a resume step-by-step](/blog/how-to-write-a-resume-step-by-step).'
);

// 5. free-resume-builder-vs-making-a-resume-manually
fileContent = fileContent.replace(
  'Read our analysis of [what makes a good resume in 2026](/blog/how-to-write-a-resume-for-2026) to stay ahead of automated filters.',
  'Read our analysis of [what makes a good resume in 2026](/blog/how-to-write-a-resume-for-2026) and discover the human-in-the-loop framework in [leveraging AI for your resume](/blog/leveraging-ai-for-your-resume) to stay ahead of automated filters.'
);

console.log('2. Loading blog 6 markdown...');

const inputDir = path.resolve(__dirname, 'blogs_input');
const blog6Content = fs.readFileSync(path.join(inputDir, 'blog6.md'), 'utf8');

const post = {
  slug: "leveraging-ai-for-your-resume",
  title: "Leveraging AI for Your Resume: A Strategy for Success",
  subtitle: "Master the human-in-the-loop strategy to harness AI speed, protect data integrity, bypass ATS filters, and craft a compelling narrative that wins recruiter callbacks.",
  category: "AI Tools",
  readTime: "8 min read",
  date: "Nov 17, 2026",
  author: "Elena Rostova",
  authorRole: "HR Technology Consultant",
  featured: false,
  summary: "AI resume builders promise efficiency, but real hiring success demands human strategy. Learn how to verify metrics, avoid AI hallucination traps, and optimize for recruiters.",
  heroImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
  tags: ["AI Resume Builder", "Resume Strategy", "ATS Optimization", "Career Advice", "Job Search"],
  faqs: [
    {
      question: "Will recruiters know if I used AI to write my resume?",
      answer: "Recruiters generally do not mind if you use AI tools to help with drafting or formatting. They do, however, flag resumes that are generic, filled with inaccurate data, or clearly written by a machine. Use AI as a drafting assistant, not as the author of your career story."
    },
    {
      question: "How do I explain a career gap using AI?",
      answer: "AI can suggest ways to frame a gap, but it cannot convey your personal context. Use the tool to brainstorm how to present your time away as a period of professional development or personal growth, then manually refine the text to sound sincere and honest rather than defensive or overly corporate."
    },
    {
      question: "Should I ask a friend for a referral after using AI to write my resume?",
      answer: "Yes, but send them your human-edited draft. Verify that every line sounds authentically like your own voice and that your verifiable metrics are 100% accurate before requesting employee referrals."
    },
    {
      question: "Does the AI know which keywords are current?",
      answer: "Most generative AI models have a knowledge cutoff and may not know the specific buzzwords currently trending in your niche. Always double-check the job description to find the most current, essential skills requested for that specific position and mirror that language accurately in your draft."
    }
  ],
  video: {
    title: "I Read 2,216 Resumes. Here's How You Stand Out",
    description: "Ali Abdaal reviews thousands of job applications to reveal what actually catches a hiring manager's eye, how to balance automated formatting, and how to stand out from generic AI drafts.",
    thumbnailUrl: "https://i.ytimg.com/vi/MqXjqOy-TA8/maxresdefault.jpg",
    uploadDate: "2023-11-20T08:00:00+00:00",
    url: "https://www.youtube.com/watch?v=MqXjqOy-TA8",
    embedUrl: "https://www.youtube-nocookie.com/embed/MqXjqOy-TA8"
  },
  content: blog6Content
};

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

const serializedPost = serializePost(post.slug, post);

// Find closing bracket of BLOG_POSTS
const lastClosingIndex = fileContent.lastIndexOf('};');
if (lastClosingIndex === -1) {
  console.error('Could not find closing }; in client/blog-data.js');
  process.exit(1);
}

const beforeClosing = fileContent.substring(0, lastClosingIndex).trimEnd();
const afterClosing = fileContent.substring(lastClosingIndex);

const updatedContent = beforeClosing + ',\n' + serializedPost + '\n' + afterClosing;

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
console.log('✅ client/blog-data.js updated successfully with 17 total posts!');
