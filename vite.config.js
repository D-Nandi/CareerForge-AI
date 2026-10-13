import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

function copyStaticAssetsPlugin() {
  return {
    name: 'copy-client-static-assets',
    closeBundle() {
      const srcDir = resolve(__dirname, 'client');
      const distDir = resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;

      const filesToCopy = [
        'theme.js',
        'main.js',
        'analytics.js',
        'blog-data.js',
        'roles-data.js',
        'pricing-script.js',
        'salary-benchmark-script.js',
        'preview-script.js',
        'pdf-renderer.js',
        'ai-enhance.js',
        'resume-import.js',
        'dashboard-script.js',
        'form-script.js',
        'favicon.ico',
        'favicon.png',
        'favicon-32x32.png',
        'favicon-192.png',
        'favicon.svg',
        'logo.png',
        'og-preview.png',
        'og-ats-checker.png',
        'og-templates.png',
        'og-resume-examples.png',
        'og-salary-benchmark.png',
        'og-cover-letter.png',
        'og-roadmap.png',
        'robots.txt',
        'sitemap.xml',
        'llms.txt',
        'llms-full.txt',
        'badge-ats-ready.svg',
      ];

      for (const file of filesToCopy) {
        const srcFile = path.join(srcDir, file);
        const distFile = path.join(distDir, file);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, distFile);
        }
      }

      // Also copy js/ directory if it exists
      const jsSrcDir = path.join(srcDir, 'js');
      const jsDistDir = path.join(distDir, 'js');
      if (fs.existsSync(jsSrcDir)) {
        if (!fs.existsSync(jsDistDir)) fs.mkdirSync(jsDistDir, { recursive: true });
        for (const item of fs.readdirSync(jsSrcDir)) {
          const itemSrc = path.join(jsSrcDir, item);
          if (fs.statSync(itemSrc).isFile()) {
            fs.copyFileSync(itemSrc, path.join(jsDistDir, item));
          }
        }
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // Target index.html to eliminate render-blocking CSS critical request chains
        const isIndexPage =
          !ctx.path ||
          ctx.path === '/' ||
          ctx.path === '/index.html' ||
          (ctx.filename && path.basename(ctx.filename) === 'index.html');

        if (isIndexPage && ctx && ctx.bundle) {
          let styleCssAsset = null;
          let styleCssHref = null;

          for (const [fileName, file] of Object.entries(ctx.bundle)) {
            if (fileName.endsWith('.css') && fileName.includes('style-')) {
              styleCssAsset = file;
              styleCssHref = `/${fileName}`;
              break;
            }
          }

          if (styleCssAsset && typeof styleCssAsset.source === 'string') {
            const inlineStyleTag = `<style id="critical-theme-style">\n${styleCssAsset.source}\n</style>`;
            const prefetchTag = `\n  <link rel="prefetch" href="${styleCssHref}" as="style">`;

            // Strip any render-blocking <link rel="stylesheet"> for the main style bundle
            html = html.replace(/<link rel="stylesheet"[^>]*href="[^"]*assets\/style-[^"]+\.css"[^>]*>/gi, '');
            // Strip any preload tags for the style bundle
            html = html.replace(/<link rel="preload"[^>]*href="[^"]*assets\/style-[^"]+\.css"[^>]*>/gi, '');

            // Insert inline style and background prefetch into <head>
            html = html.replace('</head>', `  ${inlineStyleTag}${prefetchTag}\n</head>`);
            return html;
          }
        }
        return html;
      }
    }
  };
}

function cleanUrlsDevPlugin() {
  return {
    name: 'clean-urls-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && !req.url.includes('.') && !req.url.startsWith('/api')) {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const pathname = urlObj.pathname.replace(/\/$/, '');
          if (pathname && pathname !== '') {
            const htmlFile = resolve(__dirname, 'client', `${pathname.slice(1)}.html`);
            if (fs.existsSync(htmlFile)) {
              req.url = pathname + '.html' + urlObj.search;
            }
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  root: 'client',
  plugins: [copyStaticAssetsPlugin(), cleanUrlsDevPlugin()],
  server: {
    port: 3000,
    open: '/preview.html',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: 'Backend API server is not running on port 5000. Please start it with: npm run dev or npm run dev:server'
              }));
            }
          });
        },
      },
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html'),
        preview: resolve(__dirname, 'client/preview.html'),
        form: resolve(__dirname, 'client/form-index.html'),
        ats: resolve(__dirname, 'client/ats-score-checker.html'),
        careerRoadmap: resolve(__dirname, 'client/career-roadmap.html'),
        coverLetter: resolve(__dirname, 'client/cover-letter-generator.html'),
        growthHub: resolve(__dirname, 'client/growth-hub.html'),
        interviewPrep: resolve(__dirname, 'client/interview-prep.html'),
        pricing: resolve(__dirname, 'client/pricing.html'),
        salaryBenchmark: resolve(__dirname, 'client/salary-benchmark.html'),
        templates: resolve(__dirname, 'client/templates.html'),
        blog: resolve(__dirname, 'client/blog.html'),
        blogPost: resolve(__dirname, 'client/blog-post.html'),
        adLanding: resolve(__dirname, 'client/ad-landing.html'),
        r: resolve(__dirname, 'client/r.html'),
        resumeExample: resolve(__dirname, 'client/resume-example.html'),
        resumeExamples: resolve(__dirname, 'client/resume-examples.html'),
        dashboard: resolve(__dirname, 'client/dashboard.html'),
        login: resolve(__dirname, 'client/login.html'),
        signup: resolve(__dirname, 'client/signup.html'),
        notFound: resolve(__dirname, 'client/404.html'),
        // Static Programmatic Blog Articles
        blogBeatAts: resolve(__dirname, 'client/blog/how-to-beat-ats-in-2025.html'),
        blogPowerVerbs: resolve(__dirname, 'client/blog/best-resume-power-verbs.html'),
        blogCoverLetterSecrets: resolve(__dirname, 'client/blog/cover-letter-secrets-2025.html'),
        blogResumeInfo: resolve(__dirname, 'client/blog/what-information-should-you-put-on-a-resume.html'),
        // Static Programmatic Resume Examples
        roleSoftwareEngineer: resolve(__dirname, 'client/resume-examples/software-engineer.html'),
        roleDataAnalyst: resolve(__dirname, 'client/resume-examples/data-analyst.html'),
        roleProductManager: resolve(__dirname, 'client/resume-examples/product-manager.html'),
        roleUiUxDesigner: resolve(__dirname, 'client/resume-examples/ui-ux-designer.html'),
        roleMarketingSpecialist: resolve(__dirname, 'client/resume-examples/digital-marketing-specialist.html'),
        roleFullStackDev: resolve(__dirname, 'client/resume-examples/full-stack-developer.html'),
      },
    },
  },
});
