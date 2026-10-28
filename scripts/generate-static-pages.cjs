const fs = require('fs');
const path = require('path');

// Ensure output directories exist
const blogDir = path.resolve(__dirname, '../client/blog');
const rolesDir = path.resolve(__dirname, '../client/resume-examples');

if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });
if (!fs.existsSync(rolesDir)) fs.mkdirSync(rolesDir, { recursive: true });

// Load BLOG_POSTS from client/blog-data.js
const blogDataCode = fs.readFileSync(path.resolve(__dirname, '../client/blog-data.js'), 'utf8');
const blogSandbox = {};
const evalBlog = new Function('sandbox', `${blogDataCode}; sandbox.BLOG_POSTS = BLOG_POSTS;`);
evalBlog(blogSandbox);
const BLOG_POSTS = blogSandbox.BLOG_POSTS;

// Load ROLES_DATABASE from client/roles-data.js
const rolesDataCode = fs.readFileSync(path.resolve(__dirname, '../client/roles-data.js'), 'utf8');
const rolesSandbox = {};
const evalRoles = new Function('sandbox', `${rolesDataCode}; sandbox.ROLES_DATABASE = ROLES_DATABASE;`);
evalRoles(rolesSandbox);
const ROLES_DATABASE = rolesSandbox.ROLES_DATABASE;

// Simple markdown to HTML parser for blog content
function markdownToHtml(md) {
  if (!md) return '';
  // If it already looks like HTML (has <h2 or <p>)
  if (md.trim().startsWith('<h2') || md.trim().startsWith('<div')) {
    return md;
  }

  let html = md;

  // Process tables
  html = html.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean);
    const ths = headers.map(h => `<th>${h}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map(row => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      return `<tr>${cells.map(c => `<td>${inlineFormat(c)}</td>`).join('')}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />');

  // Unordered list items (* or -)
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');

  // Wrap consecutive <li> into <ul>
  html = html.replace(/((?:<li>.*<\/li>\s*)+)/gim, '<ul>$1</ul>');

  // Inline format
  html = inlineFormat(html);

  // Paragraphs: split by double newlines and wrap non-block elements in <p>
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (b.startsWith('<h') || b.startsWith('<ul') || b.startsWith('<ol') || 
        b.startsWith('<table') || b.startsWith('<blockquote') || b.startsWith('<hr') || 
        b.startsWith('<div') || b.startsWith('<figure')) {
      return b;
    }
    return `<p>${b.replace(/\n/g, '<br />')}</p>`;
  }).filter(Boolean).join('\n\n');

  return html;
}

function inlineFormat(str) {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

// ─────────────────────────────────────────────────────────────
// 1. GENERATE STATIC BLOG PAGES
// ─────────────────────────────────────────────────────────────
for (const [slug, post] of Object.entries(BLOG_POSTS)) {
  const canonicalUrl = `https://careernest.taqnik.in/blog/${slug}`;
  const docTitle = post.title.includes('CareerNest') ? post.title : `${post.title} | CareerNest`;
  const metaDesc = post.summary || post.subtitle || '';
  const postHtmlContent = markdownToHtml(post.content);

  const schemaGraph = [
    {
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.summary || post.subtitle || '',
      "author": {
        "@type": "Person",
        "name": post.author,
        "jobTitle": post.authorRole || ''
      },
      "publisher": {
        "@type": "Organization",
        "name": "CareerNest",
        "url": "https://careernest.taqnik.in/"
      },
      "datePublished": post.date || '2026-10-13',
      "url": canonicalUrl
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://careernest.taqnik.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Career Resources",
          "item": "https://careernest.taqnik.in/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": canonicalUrl
        }
      ]
    }
  ];

  if (post.faqs && Array.isArray(post.faqs) && post.faqs.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      "mainEntity": post.faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    });
  }

  if (post.video) {
    schemaGraph.push({
      "@type": "VideoObject",
      "name": post.video.title,
      "description": post.video.description,
      "thumbnailUrl": post.video.thumbnailUrl,
      "uploadDate": post.video.uploadDate,
      "contentUrl": post.video.url,
      "embedUrl": post.video.embedUrl
    });
  }

  const avatarInitials = (post.author || 'A').split(' ').map(n => n[0]).join('').substring(0, 2);

  const html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Theme Color -->
  <meta name="theme-color" content="#f8f9fc" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0a0a0f" media="(prefers-color-scheme: dark)" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${docTitle.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="https://careernest.taqnik.in/og-preview.png" />
  <meta property="og:site_name" content="CareerNest" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${docTitle.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="https://careernest.taqnik.in/og-preview.png" />

  <!-- JSON-LD Structured Data: BlogPosting & BreadcrumbList -->
  <script type="application/ld+json">
  ${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2)}
  </script>

  <!-- Theme: Instant theme setter prevents flash -->
  <script>
    (function () { try { var s = localStorage.getItem('careernest-theme') || localStorage.getItem('careerforge-theme') || localStorage.getItem('resumatic-theme'); if (s === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) { } })();
  </script>

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" />
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
    media="print" onload="this.media='all'" />
  <noscript>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" />
  </noscript>
  <link rel="stylesheet" href="/tools-style.css" />

  <style>
    .theme-toggle {
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    #btnShareArticle {
      min-height: 44px;
      padding: 10px 18px;
      display: inline-flex;
      align-items: center;
    }

    .breadcrumbs ol li a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 4px;
    }

    .article-wrap {
      max-width: 820px;
      margin: 40px auto 100px;
      padding: 0 24px;
    }

    .article-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .article-cat-pill {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    .article-h1 {
      font-family: var(--font-head);
      font-size: clamp(2.2rem, 4.5vw, 3rem);
      font-weight: 800;
      line-height: 1.18;
      color: var(--text);
      margin-bottom: 16px;
    }

    .article-sub {
      font-size: 1.15rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .author-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .article-body {
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--text);
    }

    .article-body h2 {
      font-family: var(--font-head);
      font-size: 1.6rem;
      font-weight: 800;
      margin: 36px 0 16px;
      color: var(--text);
    }

    .article-body p {
      margin-bottom: 20px;
    }

    .article-body ul,
    .article-body ol {
      margin: 16px 0 24px 24px;
      line-height: 1.8;
    }

    .article-body li {
      margin-bottom: 8px;
    }

    .article-body h3 {
      font-family: var(--font-head);
      font-size: 1.25rem;
      font-weight: 700;
      margin: 28px 0 12px;
      color: var(--text);
    }

    .article-body hr {
      border: 0;
      height: 1px;
      background: var(--border);
      margin: 36px 0;
    }

    .article-body blockquote {
      border-left: 3px solid var(--accent);
      padding: 14px 20px;
      margin: 20px 0;
      color: var(--text);
      font-style: italic;
      background: rgba(108, 92, 231, 0.05);
      border-radius: 0 8px 8px 0;
    }

    .article-body a {
      color: var(--accent);
      text-decoration: underline;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .article-body a:hover {
      opacity: 0.85;
    }

    .article-body a.btn-primary,
    .article-body a.btn-primary:hover {
      color: #ffffff !important;
      text-decoration: none !important;
    }

    .article-body a.btn-ghost {
      color: var(--text) !important;
      text-decoration: none !important;
    }

    .article-body a.btn-ghost:hover {
      color: var(--accent) !important;
    }

    .article-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0 32px;
      font-size: 0.95rem;
      background: var(--card-bg, rgba(255, 255, 255, 0.02));
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: table;
    }

    .article-body th {
      background: rgba(108, 92, 231, 0.08);
      color: var(--text);
      font-weight: 700;
      padding: 14px 18px;
      text-align: left;
      border-bottom: 2px solid var(--border);
      font-family: var(--font-head);
    }

    .article-body td {
      padding: 12px 18px;
      border-bottom: 1px solid var(--border);
      color: var(--text-muted);
      line-height: 1.6;
      vertical-align: top;
    }

    .article-body tr:last-child td {
      border-bottom: none;
    }

    .article-body tr:hover td {
      background: rgba(108, 92, 231, 0.03);
    }

    .in-article-cta {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(16, 185, 129, 0.06));
      border: 1px solid rgba(108, 92, 231, 0.2);
      border-radius: 16px;
      padding: 28px;
      margin: 36px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 18px;
    }

    .video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border);
      margin: 28px 0;
      background: #000;
    }

    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .article-body figure {
      margin: 32px 0;
      text-align: center;
    }

    .article-body figure img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-card);
    }

    .article-body figcaption {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 10px;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .article-wrap {
        padding: 0 16px;
        margin: 24px auto 60px;
      }
      .article-h1 {
        font-size: clamp(1.75rem, 6vw, 2.3rem);
      }
      .article-sub {
        font-size: 1rem;
      }
      .article-body table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .article-body td,
      .article-body th {
        min-width: 130px;
      }
      .in-article-cta {
        padding: 20px 16px;
      }
    }
  </style>

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png?v=3" />
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png?v=3" />
  <link rel="icon" href="/favicon.ico?v=3" sizes="32x32" />
  <link rel="shortcut icon" href="/favicon.png?v=3" type="image/png" />
  <link rel="apple-touch-icon" href="/favicon.png?v=3" />
</head>

<body>

  <div class="noise"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>

  <!-- HEADER -->
  <header class="tool-header">
    <div class="header-left">
      <a href="/" class="nav-logo" aria-label="CareerNest Homepage">
        <span class="logo-mark">C</span><span class="logo-text">areerNest</span>
      </a>
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/blog">Blog</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">${post.category || 'Article'}</li>
        </ol>
      </nav>
    </div>
    <div class="header-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
      <a href="/resume-builder" class="btn-primary">Create Your Resume →</a>
      <button class="hamburger drawer-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="tool-drawer">
      <div class="tool-drawer-theme">
        <div class="drawer-theme-meta">
          <span class="drawer-theme-label">Appearance</span>
          <span class="drawer-theme-hint">Switch light &amp; dark mode</span>
        </div>
        <button class="theme-toggle drawer-theme-btn" aria-label="Toggle theme">
          <span class="drawer-theme-icon">
            <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </span>
          <span class="drawer-theme-text-light">Dark Mode</span>
          <span class="drawer-theme-text-dark">Light Mode</span>
        </button>
      </div>
      <ul class="tool-drawer-links">
        <li><a href="/blog">← Back to All Articles <span>→</span></a></li>
        <li><a href="/templates">Resume Templates <span>→</span></a></li>
        <li><a href="/ats-score-checker">ATS Resume Checker <span>→</span></a></li>
        <li><a href="/career-roadmap">AI Career Roadmap <span>→</span></a></li>
        <li><a href="/interview-prep">Interview Prep Coach <span>→</span></a></li>
        <li><a href="/salary-benchmark">Salary Calculator <span>→</span></a></li>
        <li><a href="/pricing">Pricing Plans <span>→</span></a></li>
      </ul>
      <div class="tool-drawer-actions">
        <a href="/resume-builder" class="btn btn-primary btn-block">Create Your Resume Free</a>
      </div>
    </div>
  </header>


  <!-- ARTICLE CONTAINER -->
  <main class="article-wrap">
    <header class="article-header">
      <span class="article-cat-pill">${post.category || 'ATS Secrets'}</span>
      <h1 class="article-h1">${post.title}</h1>
      <p class="article-sub">${post.subtitle || post.summary || ''}</p>

      <div class="author-bar">
        <div class="author-info">
          <div class="author-avatar">${avatarInitials}</div>
          <div>
            <strong style="display:block; font-size:0.92rem; color:var(--text);">${post.authorRole ? `${post.author} (${post.authorRole})` : post.author}</strong>
            <span style="font-size:0.78rem; color:var(--text-muted);">${post.date || ''} • ${post.readTime || ''}</span>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button id="btnShareArticle" class="btn-ghost" style="font-size:0.8rem;">📢 Share</button>
        </div>
      </div>
    </header>

    <!-- PRE-RENDERED STATIC ARTICLE CONTENT -->
    <article class="article-body">
      ${postHtmlContent}
    </article>

    <!-- IN-ARTICLE CONVERSION CTA -->
    <div class="in-article-cta">
      <div>
        <h3 style="font-family:var(--font-head); font-size:1.25rem; font-weight:800; color:var(--text);">Check Your
          Resume's ATS Score Now</h3>
        <p style="font-size:0.88rem; color:var(--text-muted); margin-top:4px;">Scan your resume for free and spot
          missing keywords before recruiters do.</p>
      </div>
      <a href="/ats-score-checker" class="btn-primary" style="padding:10px 22px;">Scan Resume Free →</a>
    </div>

    <!-- BACK TO BLOG -->
    <div style="text-align:center; margin-top:40px;">
      <a href="/blog" class="btn-ghost" style="padding:10px 20px;">← Back to All Articles</a>
    </div>
  </main>

  <script src="/theme.js" defer></script>
  <script>
    const btnShare = document.getElementById('btnShareArticle');
    if (btnShare) {
      btnShare.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: document.title,
              text: document.querySelector('meta[name="description"]')?.content || '',
              url: window.location.href,
            });
          } catch (e) {}
        } else {
          navigator.clipboard.writeText(window.location.href);
          btnShare.textContent = '✅ Copied Link!';
          setTimeout(() => { btnShare.textContent = '📢 Share'; }, 2000);
        }
      });
    }
  </script>
</body>

</html>`;

  const filePath = path.join(blogDir, `${slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Generated: client/blog/${slug}.html`);
}

// ─────────────────────────────────────────────────────────────
// 2. GENERATE STATIC RESUME EXAMPLES PAGES
// ─────────────────────────────────────────────────────────────
for (const [slug, role] of Object.entries(ROLES_DATABASE)) {
  const canonicalUrl = `https://careernest.taqnik.in/resume-examples/${slug}`;
  const docTitle = `${role.title} Resume Example | CareerNest`;
  const metaDesc = `Real ${role.title} resume example. High-impact bullet points, essential ATS keywords (${role.keywords.slice(0, 4).join(', ')}), and instant customization in CareerNest builder.`;

  const schemaGraph = [
    {
      "@type": "CollectionPage",
      "name": `${role.title} Resume Example`,
      "url": canonicalUrl,
      "description": role.description,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://careernest.taqnik.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Resume Examples",
          "item": "https://careernest.taqnik.in/resume-examples"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": role.title,
          "item": canonicalUrl
        }
      ]
    }
  ];

  if (role.faqs && Array.isArray(role.faqs) && role.faqs.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      "mainEntity": role.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    });
  }

  // Pre-render resume paper experience bullets
  let expHtml = '';
  role.experience.forEach(item => {
    expHtml += `
      <div class="res-item">
        <div class="res-item-title">
          <span>${item.role} — ${item.company}</span>
          <span style="font-weight: 500; font-size: 0.82rem; color: #64748b;">${item.period}</span>
        </div>
        <ul class="res-bullets">
          ${item.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `;
  });

  // Pre-render FAQs
  let faqsHtml = '';
  role.faqs.forEach(f => {
    faqsHtml += `
      <div>
        <strong style="font-size: 0.92rem; color: var(--text);">${f.q}</strong>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">${f.a}</p>
      </div>
    `;
  });

  // Keywords chips
  const kwHtml = role.keywords.map(k => `<span class="chip chip-match" style="font-size:0.75rem;">✓ ${k}</span>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}" />
  <meta name="keywords" content="${role.keywords.join(', ')}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Theme Color -->
  <meta name="theme-color" content="#f8f9fc" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0a0a0f" media="(prefers-color-scheme: dark)" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${docTitle.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="https://careernest.taqnik.in/og-preview.png" />
  <meta property="og:site_name" content="CareerNest" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${docTitle.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="https://careernest.taqnik.in/og-preview.png" />

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2)}
  </script>

  <!-- Theme: Instant theme setter prevents flash -->
  <script>
    (function () { try { var s = localStorage.getItem('careernest-theme') || localStorage.getItem('careerforge-theme') || localStorage.getItem('resumatic-theme'); if (s === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) { } })();
  </script>

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" />
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
    media="print" onload="this.media='all'" />
  <noscript>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" />
  </noscript>
  <link rel="stylesheet" href="/tools-style.css" />

  <style>
    .resume-paper {
      background: #ffffff;
      color: #1a1d26;
      border-radius: 12px;
      padding: 40px;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border);
      font-family: 'DM Sans', sans-serif;
    }

    .res-name {
      font-family: var(--font-head);
      font-size: 1.8rem;
      font-weight: 800;
      color: #111827;
    }

    .res-meta {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 4px;
    }

    .res-section {
      margin-top: 24px;
    }

    .res-head {
      font-family: var(--font-head);
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #4f46e5;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }

    .res-item {
      margin-bottom: 14px;
    }

    .res-item-title {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 0.95rem;
      color: #1e293b;
    }

    .res-bullets {
      margin-top: 6px;
      padding-left: 18px;
      font-size: 0.88rem;
      color: #334155;
      line-height: 1.6;
    }

    .res-bullets li {
      margin-bottom: 4px;
    }
  </style>

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png?v=3" />
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png?v=3" />
  <link rel="icon" href="/favicon.ico?v=3" sizes="32x32" />
  <link rel="shortcut icon" href="/favicon.png?v=3" type="image/png" />
  <link rel="apple-touch-icon" href="/favicon.png?v=3" />
</head>

<body>

  <div class="noise"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>

  <!-- HEADER -->
  <header class="tool-header">
    <div class="header-left">
      <a href="/" class="nav-logo" aria-label="CareerNest Homepage">
        <span class="logo-mark">C</span><span class="logo-text">areerNest</span>
      </a>
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/resume-examples">Examples</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">${role.title}</li>
        </ol>
      </nav>
    </div>
    <div class="header-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
      <a href="/resume-builder?prefill=${role.slug}" class="btn-primary">Customize This Resume →</a>
      <button class="hamburger drawer-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="tool-drawer">
      <div class="tool-drawer-theme">
        <div class="drawer-theme-meta">
          <span class="drawer-theme-label">Appearance</span>
          <span class="drawer-theme-hint">Switch light &amp; dark mode</span>
        </div>
        <button class="theme-toggle drawer-theme-btn" aria-label="Toggle theme">
          <span class="drawer-theme-icon">
            <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </span>
          <span class="drawer-theme-text-light">Dark Mode</span>
          <span class="drawer-theme-text-dark">Light Mode</span>
        </button>
      </div>
      <ul class="tool-drawer-links">
        <li><a href="/resume-examples">← All Resume Examples <span>→</span></a></li>
        <li><a href="/templates">Resume Templates <span>→</span></a></li>
        <li><a href="/ats-score-checker">ATS Resume Checker <span>→</span></a></li>
        <li><a href="/career-roadmap">AI Career Roadmap <span>→</span></a></li>
        <li><a href="/interview-prep">Interview Prep Coach <span>→</span></a></li>
        <li><a href="/salary-benchmark">Salary Calculator <span>→</span></a></li>
        <li><a href="/pricing">Pricing Plans <span>→</span></a></li>
      </ul>
      <div class="tool-drawer-actions">
        <a href="/resume-builder?prefill=${role.slug}" class="btn btn-primary btn-block">Customize in Builder →</a>
      </div>
    </div>
  </header>


  <!-- HERO -->
  <section class="tool-hero">
    <div class="tool-badge">
      <span class="badge-dot"></span> ATS Score: ${role.atsScore}
    </div>
    <h1>${role.title} Resume <em>Example &amp; Guide</em></h1>
    <p>${role.description}</p>
  </section>

  <!-- MAIN WORKSPACE -->
  <main class="tool-workspace">
    <!-- LEFT: RESUME DOCUMENT PREVIEW -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h2 style="font-family: var(--font-head); font-size: 1.2rem; font-weight: 700;">Live Resume Preview</h2>
        <button id="btnCopyBullets" class="btn-ghost" style="font-size: 0.8rem;">📋 Copy All Bullets</button>
      </div>

      <div class="resume-paper" id="resumePreviewPaper">
        <div class="res-name">Alex Morgan</div>
        <div class="res-meta">${role.title} | alex.morgan@email.com | (555) 019-2834 | San Francisco, CA</div>
        
        <div class="res-section">
          <div class="res-head">Professional Summary</div>
          <p style="font-size: 0.88rem; line-height: 1.6; color: #334155;">${role.summary}</p>
        </div>

        <div class="res-section">
          <div class="res-head">Work Experience</div>
          ${expHtml}
        </div>

        <div class="res-section">
          <div class="res-head">Skills &amp; Technologies</div>
          <p style="font-size: 0.88rem; line-height: 1.6; color: #334155;">${role.skills}</p>
        </div>

        <div class="res-section">
          <div class="res-head">Education</div>
          <p style="font-size: 0.88rem; line-height: 1.6; color: #334155;">${role.education}</p>
        </div>
      </div>
    </div>

    <!-- RIGHT: ATS STATS & FAQ -->
    <div>
      <!-- QUICK STATS CARD -->
      <div class="tool-card" style="margin-bottom: 24px;">
        <div class="card-title">
          <h2>📊 Role Benchmarks</h2>
          <span class="badge-tag">2025 Data</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
          <div class="metric-card">
            <div class="metric-title">Average Salary</div>
            <div class="metric-val">${role.avgSalary}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">ATS Pass Rate</div>
            <div class="metric-val" style="color: var(--green);">${role.atsScore}</div>
          </div>
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 700; color: var(--text);">Required ATS Keywords</label>
          <div class="keyword-chips" style="margin-top: 8px;">
            ${kwHtml}
          </div>
        </div>

        <a href="/resume-builder?prefill=${role.slug}" class="btn-primary"
          style="width: 100%; justify-content: center; margin-top: 22px; padding: 14px; font-size: 0.95rem;">
          🚀 Customize In Resume Builder
        </a>
      </div>

      <!-- FAQ CARD -->
      <div class="tool-card">
        <div class="card-title">
          <h2>💡 Frequently Asked Questions</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${faqsHtml}
        </div>
      </div>
    </div>
  </main>

  <script src="/theme.js" defer></script>
  <script>
    document.getElementById('btnCopyBullets').addEventListener('click', () => {
      const bullets = ${JSON.stringify(role.experience.flatMap(e => e.bullets))};
      navigator.clipboard.writeText('• ' + bullets.join('\\n• ')).then(() => {
        const btn = document.getElementById('btnCopyBullets');
        btn.innerText = '✅ Bullets Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy All Bullets'; }, 2000);
      });
    });
  </script>
</body>

</html>`;

  const filePath = path.join(rolesDir, `${slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Generated: client/resume-examples/${slug}.html`);
}

console.log('✅ All static programmatic pages generated successfully!');
