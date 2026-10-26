const fs = require('fs');
const path = require('path');

const clientDir = path.resolve(__dirname, '../client');
let totalErrors = 0;

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allHtmlFiles = getAllHtmlFiles(clientDir);

console.log(`\n🔍 AUDITING ${allHtmlFiles.length} HTML FILES IN CLIENT DIRECTORY...`);

// 1. Audit Canonicals & OG URLs
console.log('\n--- 1. CANONICAL & OG:URL CHECKS ---');
for (const f of allHtmlFiles) {
  const rel = path.relative(clientDir, f).replace(/\\/g, '/');
  const content = fs.readFileSync(f, 'utf8');

  // Skip 404, r.html, ad-landing if they deliberately omit or have special rules
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (canonicalMatch) {
    const url = canonicalMatch[1];
    if (url.endsWith('.html')) {
      console.error(`❌ [${rel}] Canonical ends with .html: ${url}`);
      totalErrors++;
    }
  } else if (!rel.includes('404') && !rel.includes('r.html') && !rel.includes('ad-landing')) {
    console.warn(`⚠️ [${rel}] Missing canonical tag`);
  }

  const ogUrlMatch = content.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (ogUrlMatch) {
    const ogUrl = ogUrlMatch[1];
    if (ogUrl.endsWith('.html')) {
      console.error(`❌ [${rel}] og:url ends with .html: ${ogUrl}`);
      totalErrors++;
    }
  }
}

// 2. Audit Thin Pages & H2 counts
console.log('\n--- 2. H2 COUNT & WORD COUNT CHECKS ON EXPANDED PAGES ---');
const targetPages = [
  'templates.html',
  'resume-examples.html',
  'salary-benchmark.html',
  'cover-letter-generator.html'
];

for (const target of targetPages) {
  const filePath = path.join(clientDir, target);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const h2Matches = content.match(/<h2[^>]*>/gi) || [];
    // Extract rough visible words (stripping tags, scripts, styles)
    const textOnly = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = textOnly.split(' ').length;
    console.log(`✅ [${target}] H2s: ${h2Matches.length} | Est. Words: ${wordCount}`);
    if (h2Matches.length < 3) {
      console.error(`❌ [${target}] Expected at least 3 H2 tags, found ${h2Matches.length}`);
      totalErrors++;
    }
  }
}

// 3. Audit Static Generated Pages
console.log('\n--- 3. STATIC PROGRAMMATIC PAGES EXISTENCE ---');
const expectedStaticPages = [
  'blog/what-information-should-you-put-on-a-resume.html',
  'blog/what-is-a-resume-and-what-is-it-used-for.html',
  'resume-examples/software-engineer.html',
  'resume-examples/data-analyst.html',
  'resume-examples/product-manager.html',
  'resume-examples/ui-ux-designer.html',
  'resume-examples/digital-marketing-specialist.html',
  'resume-examples/full-stack-developer.html',
];

for (const sp of expectedStaticPages) {
  const p = path.join(clientDir, sp);
  if (fs.existsSync(p)) {
    console.log(`✅ Found static page: ${sp}`);
  } else {
    console.error(`❌ Missing static page: ${sp}`);
    totalErrors++;
  }
}

// 4. Audit Sitemap XML
console.log('\n--- 4. SITEMAP.XML INTEGRITY ---');
const sitemapContent = fs.readFileSync(path.join(clientDir, 'sitemap.xml'), 'utf8');
const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Total URLs in sitemap: ${locMatches.length}`);

let htmlInSitemap = 0;
for (const loc of locMatches) {
  if (loc.endsWith('.html')) {
    console.error(`❌ Sitemap contains .html URL: ${loc}`);
    htmlInSitemap++;
    totalErrors++;
  }
}
if (htmlInSitemap === 0) {
  console.log('✅ All sitemap URLs are clean and extensionless!');
}

console.log(`\n=============================================`);
if (totalErrors === 0) {
  console.log('🎉 AUDIT VERIFICATION PASSED WITH 0 ERRORS!');
} else {
  console.error(`💥 AUDIT VERIFICATION FAILED WITH ${totalErrors} ERRORS!`);
  process.exit(1);
}
console.log(`=============================================\n`);
