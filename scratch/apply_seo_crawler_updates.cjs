const fs = require('fs');
const path = require('path');

const clientDir = path.resolve(__dirname, '../client');

// 1. Update backlink-tracker.html with noindex, nofollow
const blPath = path.join(clientDir, 'backlink-tracker.html');
let blContent = fs.readFileSync(blPath, 'utf8');
if (!blContent.includes('name="robots"')) {
  blContent = blContent.replace('<title>', '<meta name="robots" content="noindex, nofollow" />\n  <title>');
  fs.writeFileSync(blPath, blContent, 'utf8');
  console.log('Updated backlink-tracker.html with noindex, nofollow');
}

// 2. Update blog-post.html with noindex, follow
const bpPath = path.join(clientDir, 'blog-post.html');
let bpContent = fs.readFileSync(bpPath, 'utf8');
bpContent = bpContent.replace(
  /<meta name="robots" content="index, follow" \/>/,
  '<meta name="robots" content="noindex, follow" />'
);
fs.writeFileSync(bpPath, bpContent, 'utf8');
console.log('Updated blog-post.html with noindex, follow');

// 3. Update resume-example.html with noindex, follow
const rePath = path.join(clientDir, 'resume-example.html');
let reContent = fs.readFileSync(rePath, 'utf8');
reContent = reContent.replace(
  /<meta name="robots" content="index, follow" \/>/,
  '<meta name="robots" content="noindex, follow" />'
);
fs.writeFileSync(rePath, reContent, 'utf8');
console.log('Updated resume-example.html with noindex, follow');

// 4. Update sitemap.xml with today's date (2026-10-29) for updated pages
const smPath = path.join(clientDir, 'sitemap.xml');
let smContent = fs.readFileSync(smPath, 'utf8');
smContent = smContent.replace(/<lastmod>2026-10-13<\/lastmod>/g, '<lastmod>2026-10-29</lastmod>');
smContent = smContent.replace(/<lastmod>2026-10-26<\/lastmod>/g, '<lastmod>2026-10-29</lastmod>');
smContent = smContent.replace(/<lastmod>2026-10-27<\/lastmod>/g, '<lastmod>2026-10-29</lastmod>');
smContent = smContent.replace(/<lastmod>2026-10-28<\/lastmod>/g, '<lastmod>2026-10-29</lastmod>');
fs.writeFileSync(smPath, smContent, 'utf8');
console.log('Updated sitemap.xml with 2026-10-29 lastmod dates');

// 5. Update robots.txt with clean URL disallows
const robotsPath = path.join(clientDir, 'robots.txt');
const robotsContent = `# ══════════════════════════════════════════════════════════════════════
#  CareerNest (https://careernest.taqnik.in) — Robots.txt
#  Optimized for Search Engine Indexing (Google, Bing)
#  and AI Engines (ChatGPT, Gemini, Claude, Perplexity, Apple Intelligence)
# ══════════════════════════════════════════════════════════════════════

# ── 1. Default Rules for All Web Crawlers ──
User-agent: *
Allow: /
# Protect private user authentication, app state, & admin utilities
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /growth-hub
Disallow: /growth-hub.html
Disallow: /ad-landing
Disallow: /ad-landing.html
Disallow: /backlink-tracker
Disallow: /backlink-tracker.html
Disallow: /r
Disallow: /r.html
Disallow: /blog-post
Disallow: /blog-post.html
Disallow: /resume-example$
Disallow: /resume-example.html
Disallow: /api/

# ── 2. OpenAI / ChatGPT (Training, Browsing & SearchGPT) ──
User-agent: GPTBot
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

# ── 3. Google (Googlebot & Gemini / AI Overviews) ──
User-agent: Googlebot
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /growth-hub
Disallow: /ad-landing
Disallow: /backlink-tracker
Disallow: /blog-post
Disallow: /resume-example$
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

# ── 4. Anthropic / Claude (ClaudeBot, anthropic-ai, Claude-Web) ──
User-agent: ClaudeBot
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

User-agent: anthropic-ai
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

User-agent: Claude-Web
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

# ── 5. Perplexity AI (PerplexityBot) ──
User-agent: PerplexityBot
Allow: /
Disallow: /dashboard
Disallow: /dashboard.html
Disallow: /login
Disallow: /login.html
Disallow: /signup
Disallow: /signup.html
Disallow: /preview
Disallow: /preview.html
Disallow: /api/

# ── 6. Apple Intelligence & Siri Knowledge ──
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# ── 7. Meta AI & Frontier LLM Crawlers ──
User-agent: Meta-ExternalAgent
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

# ── 8. AI Knowledge Base & Sitemaps ──
# Machine-readable product briefing for LLMs:
# https://careernest.taqnik.in/llms.txt
# https://careernest.taqnik.in/llms-full.txt

Sitemap: https://careernest.taqnik.in/sitemap.xml
`;
fs.writeFileSync(robotsPath, robotsContent, 'utf8');
console.log('Updated robots.txt with clean URL disallows');

// 6. Update llms.txt & llms-full.txt clean URLs
const llmsPath = path.join(clientDir, 'llms.txt');
let llmsContent = fs.readFileSync(llmsPath, 'utf8');
llmsContent = llmsContent.replace(/\.html/g, '');
// Keep sitemap.xml intact
llmsContent = smContent ? llmsContent.replace('/sitemap', '/sitemap.xml') : llmsContent;
fs.writeFileSync(llmsPath, llmsContent, 'utf8');
console.log('Updated llms.txt with clean canonical URLs');

const llmsFullPath = path.join(clientDir, 'llms-full.txt');
let llmsFullContent = fs.readFileSync(llmsFullPath, 'utf8');
llmsFullContent = llmsFullContent.replace(/\.html/g, '');
llmsFullContent = smContent ? llmsFullContent.replace('/sitemap', '/sitemap.xml') : llmsFullContent;
fs.writeFileSync(llmsFullPath, llmsFullContent, 'utf8');
console.log('Updated llms-full.txt with clean canonical URLs');

