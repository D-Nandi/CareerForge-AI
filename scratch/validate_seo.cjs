const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

console.log('=== TECHNICAL SEO VALIDATION SUITE ===\n');

let issuesCount = 0;

// 1. Check all HTML files for Title, Description, Canonical, OG, Twitter, H1, JSON-LD
const sitemapContent = fs.readFileSync(path.join(clientDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemapContent.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(m => m[1].trim());

const robotsContent = fs.readFileSync(path.join(clientDir, 'robots.txt'), 'utf8');

files.forEach(f => {
  const content = fs.readFileSync(path.join(clientDir, f), 'utf8');

  // Title
  const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    console.error(`❌ [${f}] Missing <title>`);
    issuesCount++;
  }

  // Meta description
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
  if (!descMatch || !descMatch[1].trim()) {
    console.error(`❌ [${f}] Missing meta description`);
    issuesCount++;
  }

  // Robots
  const robotsMatch = content.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([\s\S]*?)["']/i);
  const isNoIndex = robotsMatch && robotsMatch[1].includes('noindex');

  // Canonical
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["']/i);
  if (!isNoIndex && !canonicalMatch) {
    console.error(`❌ [${f}] Indexable page missing <link rel="canonical">`);
    issuesCount++;
  }

  if (canonicalMatch) {
    const canonical = canonicalMatch[1];
    if (!canonical.startsWith('https://resumatic.ai')) {
      console.error(`❌ [${f}] Canonical URL does not use primary domain: ${canonical}`);
      issuesCount++;
    }
    // Check if canonical uses trailing slash for .html file
    if (f !== 'index.html' && canonical.endsWith('/')) {
      console.error(`❌ [${f}] Canonical URL has trailing slash instead of matching file path: ${canonical}`);
      issuesCount++;
    }
  }

  // H1
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length === 0) {
    console.error(`❌ [${f}] Missing <h1> tag`);
    issuesCount++;
  } else if (h1Matches.length > 1) {
    console.warn(`⚠️ [${f}] Multiple <h1> tags (${h1Matches.length})`);
  }

  // JSON-LD validation
  const jsonLdMatches = [...content.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  jsonLdMatches.forEach((m, idx) => {
    try {
      JSON.parse(m[1]);
    } catch (err) {
      console.error(`❌ [${f}] Invalid JSON-LD schema #${idx + 1}: ${err.message}`);
      issuesCount++;
    }
  });

  // Sitemap consistency
  if (canonicalMatch && !isNoIndex) {
    const canonical = canonicalMatch[1];
    // Check if present in sitemap (index.html or the canonical itself)
    if (!sitemapUrls.includes(canonical) && f !== 'resume-example.html' && f !== 'blog-post.html') {
      console.error(`❌ [${f}] Canonical URL ${canonical} missing from sitemap.xml!`);
      issuesCount++;
    }
  }

  // Verify noindex pages are NOT in sitemap
  if (isNoIndex && canonicalMatch) {
    const canonical = canonicalMatch[1];
    if (sitemapUrls.includes(canonical)) {
      console.error(`❌ [${f}] Noindex page ${canonical} found in sitemap.xml!`);
      issuesCount++;
    }
  }
});

// Check sitemap URLs
console.log(`\nSitemap URLs count: ${sitemapUrls.length}`);
sitemapUrls.forEach(url => {
  if (!url.startsWith('https://resumatic.ai/')) {
    console.error(`❌ Sitemap URL has incorrect domain: ${url}`);
    issuesCount++;
  }
});

// Check robots.txt references sitemap
if (!robotsContent.includes('Sitemap: https://resumatic.ai/sitemap.xml')) {
  console.error(`❌ robots.txt does not contain valid Sitemap directive`);
  issuesCount++;
}

console.log(`\nValidation complete with ${issuesCount} issues found.`);
