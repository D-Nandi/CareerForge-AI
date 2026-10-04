// ══════════════════════════════════════════════════════════
//  Resumatic — Blog & Content Engine Database
// ══════════════════════════════════════════════════════════
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
      <h2>1. How Modern ATS Algorithms Actually Work</h2>
      <p>Applicant Tracking Systems (ATS) like Workday, Taleo, Greenhouse, and Lever don't just search for exact words anymore—they use natural language processing (NLP) to parse your career trajectory, skills density, and quantified outcomes.</p>
      
      <p>When you submit a resume, the parser performs three sequential steps:</p>
      <ul>
        <li><strong>Text Extraction:</strong> Converts your document into raw text strings. Complex multi-layer tables and graphic text boxes frequently get scrambled here.</li>
        <li><strong>Entity Recognition:</strong> Identifies sections like Experience, Education, and Skills.</li>
        <li><strong>Semantic Keyword Scoring:</strong> Compares your qualifications against the hiring manager's job requisition query.</li>
      </ul>

      <div style="background:rgba(108,92,231,0.08); border-left:4px solid var(--accent); padding:16px; border-radius:8px; margin:24px 0;">
        <strong style="color:var(--text); font-size:0.95rem;">💡 Pro Tip:</strong>
        <p style="color:var(--text-muted); font-size:0.88rem; margin-top:4px;">Always use standard section headings like <em>"Work Experience"</em> and <em>"Technical Skills"</em>. Creative titles like <em>"Where I've Been"</em> confuse ATS parsers.</p>
      </div>

      <h2>2. The 4 Fatal Formatting Mistakes to Avoid</h2>
      <p>Even the most accomplished candidates get automatically disqualified due to subtle document formatting traps:</p>
      <ol>
        <li><strong>Putting Contact Info in Headers/Footers:</strong> Older parsers ignore Word and PDF header/footer zones entirely. Keep your name and email in the main document body.</li>
        <li><strong>Using Custom Icons Instead of Text:</strong> Never replace the word "Phone" or "Email" solely with an SVG icon without fallback text.</li>
        <li><strong>Low-Contrast Colors & Unreadable Fonts:</strong> Stick to standard web fonts like Syne, Inter, Roboto, or Arial.</li>
        <li><strong>Images of Text:</strong> Never paste charts or certificates as static images expecting text parsers to OCR them.</li>
      </ol>

      <h2>3. The Exact Formula for High-Scoring Bullet Points</h2>
      <p>Recruiters and AI screening algorithms look for the <strong>Google X-Y-Z Formula</strong>:</p>
      <blockquote style="font-style:italic; border-left:3px solid #10b981; padding-left:14px; margin:18px 0; color:var(--text);">
        "Accomplished [X], as measured by [Y], by doing [Z]."
      </blockquote>
      <p><strong>Weak Bullet:</strong> Responsible for speeding up the company website.</p>
      <p><strong>Strong ATS Bullet:</strong> Optimized frontend bundle size and caching layers, cutting initial page load times by 42% and increasing mobile checkout conversion by 14%.</p>
    `
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
      <h2>Why Action Verbs Make or Break First Impressions</h2>
      <p>Recruiters spend an average of 6 to 7 seconds scanning a resume during initial triage. Starting your bullet points with dynamic, decisive verbs immediately conveys ownership and impact.</p>

      <h2>Top Verbs for Engineering & Architecture</h2>
      <p>Architected, Spearheaded, Engineered, Automated, Deployed, Refactored, Accelerated, Scaled, Overhauled, Optimized, Integrated, Debugged.</p>

      <h2>Top Verbs for Leadership & Management</h2>
      <p>Directed, Orchestrated, Mobilized, Championed, Mentored, Negotiated, Aligned, Cultivated, Delegated, Galvanized.</p>

      <h2>Top Verbs for Growth & Revenue</h2>
      <p>Generated, Maximized, Outperformed, Expanded, Captured, Boosted, Monetized, Propelled, Doubled.</p>
    `
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
      <h2>The 3-Paragraph High-Conversion Blueprint</h2>
      <p>Nobody wants to read a 2-page essay. The most effective cover letters are crisp, personalized, and focus entirely on how you can solve the company's biggest challenges.</p>

      <ul>
        <li><strong>Paragraph 1: The Hook & Enthusiasm:</strong> State the exact role, why their mission excites you, and your high-level value proposition.</li>
        <li><strong>Paragraph 2: Quantified Proof:</strong> 1-2 major career wins directly addressing the core requirements from the job description.</li>
        <li><strong>Paragraph 3: Confident Closing:</strong> Express eagerness to discuss further and thank the hiring team.</li>
      </ul>
    `
  }
};
