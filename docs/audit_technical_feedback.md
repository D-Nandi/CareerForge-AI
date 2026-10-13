# Technical SEO & Infrastructure Audit Feedback

**Target Page:** `blog-post.html?id=what-information-should-you-put-on-a-resume`  
**Report Identifier:** `analysis-1791891989415-g0e4ag`  
**Audit Date:** 13 October 2026  
**Evaluated URL:** `http://127.0.0.1:5500/client/blog-post.html?id=what-information-should-you-put-on-a-resume`  
**Canonical Domain:** `https://careernest.taqnik.in`

---

## 1. Executive Summary & Score Breakdown

| Category | Audit Score | Target Benchmark | Status | Primary Root Cause |
|---|---|---|---|---|
| **Meta Tags** | **84 / 100** | 100 | ⚠️ Needs Fix | Title (83 chars) and Meta Description (198 chars) exceed search engine snippet limits. |
| **Technical** | **8 / 100** | ≥ 90 | ⚠️ Action Required | Local Five Server dev artifacts + client-side hydration gap + render-blocking assets. |
| **Performance** | **92 / 100** | ≥ 90 | ✅ Strong | Low TTFB (25ms), healthy FCP/LCP (372ms), CLS (0.0192). 4 render-blocking resources flagged. |
| **Accessibility** | **100 / 100** | 100 | ℹ️ Minor Tweaks | 8 touch targets smaller than 44×44px (theme toggle, share button, breadcrumbs). |
| **Spam / SERE Risk** | **45 / 100** (0.5001) | < 0.35 | ⚠️ Warning | High template-to-content ratio flag and client-side off-screen DOM text manipulation. |
| **Overall Score** | **70 / 100** | ≥ 90 | 🟡 Moderate | Remediable with on-page fixes and production environment deployment. |

---

## 2. Disambiguating Development Server Noise vs. True Production Issues

The audit report identified 14 discrete issues. Several of the most severe alerts (`Technical: 8/100`) are **artifacts of running the audit through a local development server (`Five Server` on port 5500)** rather than flaws in the production architecture.

### A. Non-Issues (Development Environment Artifacts)
1. **`HTTPS_MISSING` / `SSL_CERT_EXPIRED` / `SSL_CERT_HOST_MISMATCH`**:
   - *Audit finding:* Page served over plain HTTP `127.0.0.1:5500` with an expired SSL certificate for `sidebar.mine.organic`.
   - *Production Reality:* `https://careernest.taqnik.in` is terminated with Cloudflare / Vercel modern TLS 1.3 certificates. No action needed on localhost.
2. **`ROBOTS_TXT_NOT_FOUND` / `SITEMAP_NOT_FOUND`**:
   - *Audit finding:* Requests to `http://127.0.0.1:5500/robots.txt` and `/sitemap.xml` returned HTTP 404.
   - *Production Reality:* `backend/server.js` explicitly routes `/robots.txt` and `/sitemap.xml` with `Cache-Control: public, max-age=86400`, and static copies exist in `/client` and `/dist`.
3. **`HEADER_CACHE_CONTROL_MISSING` / `HEADER_COMPRESSION_MISSING`**:
   - *Audit finding:* Five Server does not compress responses or send cache directives.
   - *Production Reality:* `backend/server.js` implements `compression()` with 1KB threshold and Brotli/Gzip fallback.

### B. True Technical Defects Requiring Immediate Remediation
The following findings are directly embedded in the codebase and affect search indexing, web crawlers, and user experience.

---

## 3. High-Priority Technical Findings & Fixes

### Issue 1: Snippet Truncation in SERP (Meta Title & Description)
* **Code:** `META_TITLE_TOO_LONG` & `META_DESC_TOO_LONG`
* **Current State:**
  - Dynamic Title: `What Information Should You Put on a Resume? (2026 Guide) | CareerNest Career Guide` (**83 characters** — limit is 60).
  - Dynamic Meta Description: `In a job market defined by high-volume applications and automated screening, learn the 5 essential sections and strategic additions your resume needs in 2026 to pass ATS and stand out to recruiters.` (**198 characters** — limit is 160).
* **Impact:** Google truncates both the title and snippet on desktop and mobile SERPs with an ellipsis (`...`), degrading Click-Through Rate (CTR).
* **Resolution:**
  - **Optimized Title (54 chars):**  
    `What to Put on a Resume in 2026 (Guide) | CareerNest`
  - **Optimized Description (152 chars):**  
    `Learn the 5 essential resume sections, key additions, and ATS formatting rules needed to pass automated filters and impress recruiters in 2026.`

---

### Issue 2: Client-Side Rendering (CSR) Hydration Lag & Initial Head State
* **Root Cause:** When `blog-post.html` is initially delivered over the network, its raw HTML `<head>` contains:
  ```html
  <title id="postDocTitle">How to Beat ATS | CareerNest Career Guide</title>
  <meta id="postMetaDesc" name="description" content="Discover how modern AI ATS algorithms parse resumes..." />
  <link rel="canonical" id="postCanonical" href="https://careernest.taqnik.in/blog-post.html?slug=how-to-beat-ats-in-2025" />
  ```
  Only *after* JavaScript executes `renderPost()` does the title, description, and canonical URL update to the current post.
* **Impact:** 
  - Web crawlers with tight render budgets or crawlers that parse raw HTML (like X/Twitter, LinkedIn scrapers, and certain AI search bots) index the **fallback article metadata** instead of the requested article.
  - The audit report flagged `CANONICAL_DIFFERENT` and `initialHtml` vs `renderHtml` divergence.
* **Resolution:**
  - Set generic, crawler-safe initial fallback metadata or implement lightweight static pre-rendering in Vite / Express route handler (`/api/blog/:slug` server-rendered HTML template).
  - Ensure the client script checks both `?id=` and `?slug=` parameters and sets standard canonicals consistently using `?slug=`.

---

### Issue 3: Canonical URL Parameter Inconsistency (`?slug=` vs `?id=`)
* **Current State:**
  - `sitemap.xml` lists: `https://careernest.taqnik.in/blog-post.html?slug=what-information-should-you-put-on-a-resume`
  - `blog.html` links: `<a href="blog-post.html?id=what-information-should-you-put-on-a-resume">`
  - `renderPost()` dynamically sets: `https://careernest.taqnik.in/blog-post.html?id=...`
* **Impact:** Search engines see two conflicting URL structures (`?id=` vs `?slug=`) for the same resource, splitting PageRank signals and creating canonical mismatches.
* **Resolution:** Standardize universally on `?slug=` across `blog.html`, `blog-post.html`, `sitemap.xml`, and schema structured data.

---

### Issue 4: Render-Blocking Resources in Critical Path
* **Code:** `RENDER_BLOCKING` (4 resources flagged)
* **Offending Resources:**
  1. `https://cdn.jsdelivr.net/npm/marked/marked.min.js` (synchronous script in `<head>`)
  2. `tools-style.css` (entire tools stylesheet loaded in `<head>`)
  3. `https://fonts.googleapis.com/css2?family=Syne...`
  4. `blog-data.js`
* **Impact:** First Contentful Paint (FCP) and Largest Contentful Paint (LCP) are delayed while the browser waits to download and execute `marked.min.js` before painting the DOM.
* **Resolution:**
  - Move `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js">` to the bottom of the `<body>` before the inline script, or add `defer`.
  - Add Subresource Integrity (SRI) hash to `marked.min.js`:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js" integrity="sha384-..." crossorigin="anonymous" defer></script>
    ```
  - Add missing `dns-prefetch` and `preconnect` hints for `cdn.jsdelivr.net`.

---

### Issue 5: Touch Target Sizing (Accessibility & Mobile Usability)
* **Code:** `SMALL_TOUCH_TARGETS` (8 interactive targets < 44×44px)
* **Offending Elements:**
  - `#themeToggle`: `40×40px` (Needs `min-width: 44px; min-height: 44px;`)
  - `#btnShareArticle`: `89×35px` (Height is 35px; increase vertical padding to meet 44px height)
  - Breadcrumbs navigation links (`Home`, `Blog`): `37×18px` and `27×18px`
  - In-content mailto anchor: `firstname.lastname@email.com` (height `22px`)
* **Resolution:**
  - Expand touch hit-areas using CSS `padding` or `min-height: 44px; display: inline-flex; align-items: center;`.
  - For inline links and breadcrumbs, add invisible hit area expansion using `::after` pseudoelements or padding.

---

### Issue 6: Unused CSS Overhead (`tools-style.css`)
* **Audit finding:** `60% unused selectors` (128 selectors analyzed, 51 used).
* **Root Cause:** `tools-style.css` was designed for interactive form tools (range sliders, tone selectors, form field groups, live scoring widgets). Loading it on pure editorial blog posts introduces unnecessary stylesheet bytes.
* **Resolution:** Create a lean, dedicated `blog.css` (or inline critical blog styles) containing only navbar, article typography, markdown tables, and CTA blocks.

---

## 4. Priority Action Matrix

| Priority | Task | File(s) | Impact |
|---|---|---|---|
| **P0** | Trim title to 54 chars and meta description to 152 chars | `client/blog-data.js`, `scripts/seed-blog.cjs` | Fixes Google SERP snippet truncation. |
| **P0** | Standardize canonical and internal links to `?slug=` | `client/blog.html`, `client/blog-post.html` | Unifies canonical signals and prevents 301/split rank. |
| **P1** | Add `defer` and SRI to `marked.min.js`; add `dns-prefetch` for CDN | `client/blog-post.html` | Eliminates critical render-blocking script. |
| **P1** | Increase touch targets for `#themeToggle` and `#btnShareArticle` to ≥ 44px | `client/blog-post.html`, `client/tools-style.css` | Fixes Mobile Accessibility audit flags. |
| **P2** | Extract email link to non-interactive styling or formatted code block | `client/blog-data.js` | Removes noisy external mailto link and small touch target. |
| **P2** | Prune `tools-style.css` dependencies on blog article views | `client/blog-post.html` | Cuts unused CSS payload by 60%. |

---
*Report prepared for CareerForge AI Engineering Team.*
