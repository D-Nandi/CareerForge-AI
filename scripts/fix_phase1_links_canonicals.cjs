const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '../client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

const canonicalMap = [
  [/https:\/\/careernest\.taqnik\.in\/ats-score-checker\.html/g, 'https://careernest.taqnik.in/ats-score-checker'],
  [/https:\/\/careernest\.taqnik\.in\/blog-post\.html\?slug=/g, 'https://careernest.taqnik.in/blog-post?slug='],
  [/https:\/\/careernest\.taqnik\.in\/blog-post\.html\?id=/g, 'https://careernest.taqnik.in/blog-post?slug='],
  [/https:\/\/careernest\.taqnik\.in\/blog\.html/g, 'https://careernest.taqnik.in/blog'],
  [/https:\/\/careernest\.taqnik\.in\/career-roadmap\.html/g, 'https://careernest.taqnik.in/career-roadmap'],
  [/https:\/\/careernest\.taqnik\.in\/cover-letter-generator\.html/g, 'https://careernest.taqnik.in/cover-letter-generator'],
  [/https:\/\/careernest\.taqnik\.in\/form-index\.html/g, 'https://careernest.taqnik.in/form-index'],
  [/https:\/\/careernest\.taqnik\.in\/interview-prep\.html/g, 'https://careernest.taqnik.in/interview-prep'],
  [/https:\/\/careernest\.taqnik\.in\/login\.html/g, 'https://careernest.taqnik.in/login'],
  [/https:\/\/careernest\.taqnik\.in\/preview\.html/g, 'https://careernest.taqnik.in/preview'],
  [/https:\/\/careernest\.taqnik\.in\/pricing\.html/g, 'https://careernest.taqnik.in/pricing'],
  [/https:\/\/careernest\.taqnik\.in\/resume-example\.html\?role=/g, 'https://careernest.taqnik.in/resume-example?role='],
  [/https:\/\/careernest\.taqnik\.in\/resume-examples\.html/g, 'https://careernest.taqnik.in/resume-examples'],
  [/https:\/\/careernest\.taqnik\.in\/salary-benchmark\.html/g, 'https://careernest.taqnik.in/salary-benchmark'],
  [/https:\/\/careernest\.taqnik\.in\/signup\.html/g, 'https://careernest.taqnik.in/signup'],
  [/https:\/\/careernest\.taqnik\.in\/templates\.html/g, 'https://careernest.taqnik.in/templates'],
];

const internalLinkMap = [
  [/href="index\.html"/g, 'href="/"'],
  [/href="form-index\.html"/g, 'href="/form-index"'],
  [/href="ats-score-checker\.html"/g, 'href="/ats-score-checker"'],
  [/href="career-roadmap\.html"/g, 'href="/career-roadmap"'],
  [/href="interview-prep\.html"/g, 'href="/interview-prep"'],
  [/href="salary-benchmark\.html"/g, 'href="/salary-benchmark"'],
  [/href="pricing\.html"/g, 'href="/pricing"'],
  [/href="cover-letter-generator\.html"/g, 'href="/cover-letter-generator"'],
  [/href="templates\.html"/g, 'href="/templates"'],
  [/href="resume-examples\.html"/g, 'href="/resume-examples"'],
  [/href="blog\.html"/g, 'href="/blog"'],
  [/href="login\.html"/g, 'href="/login"'],
  [/href="signup\.html"/g, 'href="/signup"'],
  [/href="preview\.html"/g, 'href="/preview"'],
  [/href="growth-hub\.html"/g, 'href="/growth-hub"'],
  [/href="dashboard\.html"/g, 'href="/dashboard"'],
];

console.log('--- EXECUTING PHASE 1 LINK & CANONICAL MIGRATION ---');

files.forEach(file => {
  const filePath = path.join(clientDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Apply canonical and og replacements
  canonicalMap.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  // Apply internal anchor link replacements
  internalLinkMap.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  // Special case: blog card links in client/blog.html
  if (file === 'blog.html') {
    content = content.replace(/blog-post\.html\?id=\$\{encodeURIComponent\(post\.slug\)\}/g, '/blog-post?slug=${encodeURIComponent(post.slug)}');
  }

  // Special case: blog-post.html canonical and slug handling
  if (file === 'blog-post.html') {
    content = content.replace(
      /const slug = urlParams\.get\('id'\) \|\| urlParams\.get\('slug'\) \|\| 'how-to-beat-ats-in-2025';/g,
      "const slug = urlParams.get('slug') || urlParams.get('id') || 'how-to-beat-ats-in-2025';"
    );
    content = content.replace(
      /const canonicalUrl = `https:\/\/careernest\.taqnik\.in\/blog-post\.html\?id=\$\{encodeURIComponent\(post\.slug \|\| slug\)\}`;/g,
      "const canonicalUrl = `https://careernest.taqnik.in/blog-post?slug=${encodeURIComponent(post.slug || slug)}`;"
    );
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[UPDATED] ${file}`);
  } else {
    console.log(`[UNCHANGED] ${file}`);
  }
});

console.log('Phase 1 script execution complete.');
