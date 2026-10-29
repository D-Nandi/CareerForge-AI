#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerNest Internal Linking Opportunity Engine & Graph Registry
 * ═══════════════════════════════════════════════════════════════════════════════
 * Usage:
 *   node scripts/link-opportunity-engine.cjs --scan
 *   node scripts/link-opportunity-engine.cjs --check <ContentID | slug | keyword>
 *   node scripts/link-opportunity-engine.cjs --sync
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const registryPath = path.resolve(__dirname, '../docs/internal-linking-registry.json');
const blogDataPath = path.resolve(__dirname, '../client/blog-data.js');

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    console.error('Error: docs/internal-linking-registry.json not found. Run scripts/build-linking-registry.cjs first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

function loadBlogPosts() {
  const code = fs.readFileSync(blogDataPath, 'utf8');
  const sandbox = {};
  new Function('sandbox', `${code}; sandbox.BLOG_POSTS = BLOG_POSTS;`)(sandbox);
  return sandbox.BLOG_POSTS;
}

// Extract links from markdown content
function extractLinks(mdContent) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(mdContent)) !== null) {
    links.push({ anchor: match[1], url: match[2] });
  }
  return links;
}

// 1. SCAN COMMAND
function scanGraph() {
  const posts = loadBlogPosts();
  const slugs = Object.keys(posts);
  
  console.log('\n========================================================================');
  console.log(`📊 CareerNest Internal Linking Health Scan (${slugs.length} Published Articles)`);
  console.log('========================================================================\n');

  const matrix = {};
  const inbounds = {};
  const outbounds = {};

  slugs.forEach(s => {
    inbounds[s] = 0;
    outbounds[s] = 0;
    matrix[s] = {};
  });

  slugs.forEach(fromSlug => {
    const p = posts[fromSlug];
    const links = extractLinks(p.content);
    const blogLinks = links.filter(l => l.url.startsWith('/blog/'));
    
    outbounds[fromSlug] = blogLinks.length;

    blogLinks.forEach(l => {
      const toSlug = l.url.replace('/blog/', '').replace(/\/$/, '');
      if (matrix[fromSlug]) {
        matrix[fromSlug][toSlug] = (matrix[fromSlug][toSlug] || 0) + 1;
      }
      if (inbounds[toSlug] !== undefined) {
        inbounds[toSlug]++;
      }
    });
  });

  // Table summary
  console.log('| Article Slug | Outbound Blog Links | Inbound Blog Links | Status |');
  console.log('|---|:---:|:---:|---|');
  slugs.forEach(slug => {
    const outCount = outbounds[slug];
    const inCount = inbounds[slug];
    let health = '✅ Healthy';
    if (inCount === 0 && outCount === 0) health = '🔴 Orphaned';
    else if (inCount === 0) health = '⚠️ No Inbound';
    else if (outCount === 0) health = '⚠️ Dead-End (No Outbound)';
    else if (inCount + outCount < 4) health = '🟡 Sparse';

    console.log(`| ${slug} | ${outCount} | ${inCount} | ${health} |`);
  });

  const totalLinks = Object.values(outbounds).reduce((a, b) => a + b, 0);
  console.log(`\nTotal Blog-to-Blog Links: ${totalLinks}`);
  console.log(`Average Cluster Connectivity: ${(totalLinks / slugs.length).toFixed(1)} links/article\n`);
}

// 2. CHECK COMMAND FOR NEW / TARGET TOPIC
function checkOpportunity(query) {
  const registry = loadRegistry();
  const posts = loadBlogPosts();
  const publishedSlugs = Object.keys(posts);

  // Find target in registry or create temp object
  let target = null;
  const numId = parseInt(query, 10);
  if (!isNaN(numId)) {
    target = registry.allTopics.find(t => t.id === numId);
  } else {
    target = registry.allTopics.find(t => 
      t.suggestedSlug === query || 
      t.topic.toLowerCase().includes(query.toLowerCase()) ||
      t.primaryKeyword.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (!target) {
    target = {
      id: "CUSTOM",
      topic: query,
      cluster: "Custom Topic",
      funnel: "TOFU/MOFU",
      primaryKeyword: query,
      suggestedSlug: query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      productCTA: "/resume-builder"
    };
  }

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`🔍 Linking Analysis for New Blog Post: [ID:${target.id}] "${target.topic}"`);
  console.log(`   Cluster: ${target.cluster} | Funnel: ${target.funnel} | Keyword: "${target.primaryKeyword}"`);
  console.log(`   Slug: /blog/${target.suggestedSlug}`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  // Check cannibalization against published posts
  const conflict = Object.entries(posts).find(([slug, p]) => 
    slug === target.suggestedSlug || p.title.toLowerCase().includes(target.primaryKeyword.toLowerCase())
  );
  if (conflict && conflict[0] !== target.suggestedSlug) {
    console.log(`⚠️ CANNIBALIZATION WARNING: Keyword "${target.primaryKeyword}" matches published post "${conflict[0]}". Ensure distinct user intent!\n`);
  }

  // OUTBOUND OPPORTUNITIES (Pages this new article should link TO)
  console.log('────────────────────────────────────────────────────────────────────────');
  console.log('1️⃣  OUTBOUND LINK OPPORTUNITIES (Links to put INSIDE the new article):');
  console.log('────────────────────────────────────────────────────────────────────────');
  console.log('| Target Page | Type | Suggested Anchor Text | Context / Where to Place |');
  console.log('|---|---|---|---|');

  publishedSlugs.forEach(slug => {
    const p = posts[slug];
    let anchor = p.title.replace(' | CareerNest', '').replace(/\(.*?\)/g, '').trim().toLowerCase();
    let context = 'Reference foundational principles in background or body';

    if (slug === 'what-is-a-resume-and-what-is-it-used-for') {
      anchor = 'what a resume is and why it matters';
      context = 'In introduction or definitions section';
    } else if (slug === 'what-information-should-you-put-on-a-resume') {
      anchor = 'essential resume sections';
      context = 'When detailing document structure or sections';
    } else if (slug === 'how-long-should-a-resume-be') {
      anchor = 'how long a resume should be';
      context = 'When discussing page limits, whitespace, or layout';
    } else if (slug === 'how-to-write-a-resume-for-2026') {
      anchor = 'what makes a good resume in 2026';
      context = 'In ATS standards or modern recruiter scanning section';
    } else if (slug === 'what-is-the-best-resume-format') {
      anchor = 'choosing the best resume format';
      context = 'When explaining layout choice (chronological vs hybrid)';
    } else if (slug === 'how-to-write-a-resume-step-by-step') {
      anchor = 'how to write resume bullet points';
      context = 'When discussing achievement formulas or metrics';
    } else if (slug === 'how-to-write-a-resume-with-no-work-experience') {
      anchor = 'writing a resume with no work experience';
      context = 'In entry-level, student, or career transition subsections';
    }

    console.log(`| /blog/${slug} | Blog | "${anchor}" | ${context} |`);
  });

  // Product CTA recommendations
  console.log(`| ${target.productCTA || '/resume-builder'} | Product | "AI Resume Builder" | Primary conversion CTA button + in-article box |`);
  console.log(`| /ats-score-checker | Tool | "Free ATS Resume Checker" | In ATS parsing / keyword density verification section |`);
  console.log(`| /resume-examples | Hub | "real-world resume examples" | In practical examples or role-specific section |`);
  console.log(`| /templates | Hub | "ATS-friendly resume templates" | In design/formatting recommendations |`);
  console.log(`| /interview-prep | Tool | "AI mock interview practice" | In next steps / post-application advice |`);

  // INBOUND OPPORTUNITIES (Existing published articles that should link TO this new article)
  console.log('\n────────────────────────────────────────────────────────────────────────');
  console.log('2️⃣  INBOUND LINK OPPORTUNITIES (Edit existing articles to link BACK to this new post):');
  console.log('────────────────────────────────────────────────────────────────────────');
  console.log('| Existing Published Article | Suggested Anchor Text | Exact Section to Insert Link |');
  console.log('|---|---|---|');

  publishedSlugs.forEach(slug => {
    let anchor = `[${target.topic.toLowerCase()}](/blog/${target.suggestedSlug})`;
    let targetSection = 'Related topics or FAQ section';

    if (target.id === 8 || target.primaryKeyword.includes('bullet')) {
      if (slug === 'what-information-should-you-put-on-a-resume') {
        anchor = `[how to write resume bullet points that show impact](/blog/${target.suggestedSlug})`;
        targetSection = 'Section 3: Work Experience / Google X-Y-Z formula';
      } else if (slug === 'how-long-should-a-resume-be') {
        anchor = `[writing high-impact resume bullet points](/blog/${target.suggestedSlug})`;
        targetSection = 'Strategies for Condensing Content';
      } else if (slug === 'what-is-the-best-resume-format') {
        anchor = `[crafting quantified resume bullets](/blog/${target.suggestedSlug})`;
        targetSection = 'Drafting a Resume With No Experience';
      }
    } else if (target.primaryKeyword.includes('format')) {
      anchor = `[best resume format guide](/blog/${target.suggestedSlug})`;
      targetSection = 'Formatting & Layout sections';
    } else {
      anchor = `[${target.topic}](/blog/${target.suggestedSlug})`;
      targetSection = 'In-body contextual recommendation or FAQ';
    }

    console.log(`| /blog/${slug} | "${anchor}" | ${targetSection} |`);
  });

  console.log('\n========================================================================\n');
}

// 3. SYNC COMMAND
function syncRegistry() {
  const registry = loadRegistry();
  const posts = loadBlogPosts();
  const slugs = Object.keys(posts);

  registry.publishedSlugs = slugs;
  registry.lastUpdated = new Date().toISOString().split('T')[0];

  const graph = {};
  slugs.forEach(s => {
    const links = extractLinks(posts[s].content);
    graph[s] = {
      title: posts[s].title,
      outboundBlog: links.filter(l => l.url.startsWith('/blog/')).map(l => l.url),
      outboundProduct: links.filter(l => !l.url.startsWith('/blog/')).map(l => l.url)
    };
  });
  registry.activeGraph = graph;

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
  console.log(`✅ Synced ${slugs.length} published articles and active link graph into docs/internal-linking-registry.json`);
}

// CLI ARGUMENTS
const args = process.argv.slice(2);
const command = args[0];

if (command === '--scan') {
  scanGraph();
} else if (command === '--check') {
  const query = args[1];
  if (!query) {
    console.log('Usage: node scripts/link-opportunity-engine.cjs --check <ID|slug|keyword>');
    process.exit(1);
  }
  checkOpportunity(query);
} else if (command === '--sync') {
  syncRegistry();
} else {
  console.log('CareerNest Link Opportunity Engine');
  console.log('Commands:');
  console.log('  --scan              Audit published blog link graph');
  console.log('  --check <ID|slug>   Get Inbound & Outbound linking plan for a new post');
  console.log('  --sync              Sync live blog data into docs/internal-linking-registry.json');
}

