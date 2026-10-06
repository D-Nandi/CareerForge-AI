import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'client',
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
      },
    },
  },
});
