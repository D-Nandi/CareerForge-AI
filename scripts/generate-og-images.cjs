const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const clientDir = path.resolve(__dirname, '../client');

const cards = [
  {
    fileName: 'og-ats-checker.png',
    badge: '✦ RECRUITER VERIFIED • 2026 EDITION',
    title: 'Test Your Resume Against Real ATS Parsers',
    desc: 'Uncover missing keywords, fix formatting traps, and optimize your resume for Workday, Taleo, and Greenhouse.',
    cardTitle: 'SCAN RESULTS',
    cardMetric: '96%',
    cardMetricLabel: 'ATS Match Score',
    cardDetails: [
      { label: 'Workday Compatibility', val: 'Passed (99%)', color: '#10b981' },
      { label: 'Greenhouse Tokenizer', val: 'Passed (98%)', color: '#10b981' },
      { label: 'Keyword Optimization', val: '24/26 Matched', color: '#6c5ce7' },
      { label: 'Layout Parseability', val: 'Zero Errors', color: '#10b981' }
    ]
  },
  {
    fileName: 'og-templates.png',
    badge: '✦ ATS-CERTIFIED • 100% FREE EXPORT',
    title: 'Professional Resume Templates That Pass ATS',
    desc: 'Battle-tested single-column and tech layouts engineered to pass corporate parsing algorithms with 99% accuracy.',
    cardTitle: 'FEATURED TEMPLATES',
    cardMetric: '99%',
    cardMetricLabel: 'Avg Parser Accuracy',
    cardDetails: [
      { label: 'Classic Executive', val: 'Finance & Corporate', color: '#6c5ce7' },
      { label: 'Modern Tech', val: 'Software & Data', color: '#10b981' },
      { label: 'Minimalist Serif', val: 'Design & Strategy', color: '#a78bfa' },
      { label: 'Format Standards', val: 'Vector PDF / DOCX', color: '#10b981' }
    ]
  },
  {
    fileName: 'og-resume-examples.png',
    badge: '✦ ROLE-SPECIFIC CAREER PLAYBOOKS',
    title: 'Resume Examples for Every Career Stage',
    desc: 'Field-tested bullet points, Google X-Y-Z formulas, and essential technical keywords for high-growth tech roles.',
    cardTitle: 'CURATED DIRECTORY',
    cardMetric: '25+',
    cardMetricLabel: 'Role Blueprints',
    cardDetails: [
      { label: 'Software Engineer', val: '$128k Avg Base', color: '#6c5ce7' },
      { label: 'Data Analyst', val: '$94k Avg Base', color: '#10b981' },
      { label: 'Product Manager', val: '$135k Avg Base', color: '#a78bfa' },
      { label: 'Full Stack Dev', val: '$122k Avg Base', color: '#10b981' }
    ]
  },
  {
    fileName: 'og-salary-benchmark.png',
    badge: '✦ COMPENSATION & CAREER INSIGHTS',
    title: 'Understand Your True Market Value',
    desc: 'Deconstruct CTC vs in-hand take-home pay, New Tax Regime deductions, and offer negotiation tactics in India.',
    cardTitle: 'COMPENSATION INDEX',
    cardMetric: '+15%',
    cardMetricLabel: 'Bengaluru Tech Premium',
    cardDetails: [
      { label: 'Tier-1 Product MNCs', val: '₹38L – ₹75L Base', color: '#6c5ce7' },
      { label: 'Series B/C Unicorns', val: '₹22L – ₹38L Base', color: '#10b981' },
      { label: 'EPF & Gratuity Model', val: 'CTC Deductions', color: '#f59e0b' },
      { label: 'Notice Period Leverage', val: 'Buyout Guide', color: '#10b981' }
    ]
  },
  {
    fileName: 'og-cover-letter.png',
    badge: '✦ AI CAREER WRITING ASSISTANT',
    title: 'Tailored AI Cover Letters in 2 Minutes',
    desc: 'The proven 3-paragraph formula that catches recruiters\' attention and aligns directly with job description keywords.',
    cardTitle: 'GENERATION ENGINE',
    cardMetric: '3-Part',
    cardMetricLabel: 'Conversion Formula',
    cardDetails: [
      { label: 'Paragraph 1', val: 'Hook & Value Prop', color: '#6c5ce7' },
      { label: 'Paragraph 2', val: 'Quantified Impact', color: '#10b981' },
      { label: 'Paragraph 3', val: 'Cultural Alignment', color: '#a78bfa' },
      { label: 'Tone Calibration', val: 'Confident / Exec', color: '#10b981' }
    ]
  },
  {
    fileName: 'og-roadmap.png',
    badge: '✦ CAREER TRANSITION ARCHITECTURE',
    title: 'AI-Powered Career & Skills Roadmap',
    desc: 'Generate a personalized 4-phase transition blueprint from your current role to your dream engineering target.',
    cardTitle: 'MILESTONE PHASES',
    cardMetric: '4-Phase',
    cardMetricLabel: 'Growth Plan',
    cardDetails: [
      { label: 'Phase 1: Foundations', val: 'Core Tech Mastery', color: '#6c5ce7' },
      { label: 'Phase 2: Deep Dives', val: 'Distributed Systems', color: '#10b981' },
      { label: 'Phase 3: Portfolio', val: 'Enterprise Projects', color: '#a78bfa' },
      { label: 'Phase 4: Interview', val: 'System Design Qs', color: '#10b981' }
    ]
  }
];

function generateHtml(card) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background: #090a12;
      color: #f8f9fc;
      font-family: 'DM Sans', -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 70px;
    }
    
    /* Glowing ambient mesh orbs */
    .orb-1 {
      position: absolute;
      width: 600px;
      height: 600px;
      top: -200px;
      left: -150px;
      background: radial-gradient(circle, rgba(108, 92, 231, 0.35) 0%, rgba(108, 92, 231, 0) 70%);
      pointer-events: none;
    }
    .orb-2 {
      position: absolute;
      width: 650px;
      height: 650px;
      bottom: -220px;
      right: -100px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 70%);
      pointer-events: none;
    }

    /* Grid overlay */
    .grid-mesh {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    /* Top Brand Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-mark {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6c5ce7 0%, #a78bfa 100%);
      color: #ffffff;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 18px rgba(108, 92, 231, 0.4);
    }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .badge-top {
      background: rgba(108, 92, 231, 0.12);
      border: 1px solid rgba(108, 92, 231, 0.35);
      color: #c4b5fd;
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    /* Center Content Layout (2 cols) */
    .center-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 50px;
      position: relative;
      z-index: 2;
      margin: 20px 0;
    }
    .text-col {
      flex: 1.2;
    }
    .badge-pill {
      display: inline-block;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #10b981;
      margin-bottom: 14px;
    }
    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: 46px;
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    .hero-desc {
      font-size: 19px;
      line-height: 1.5;
      color: #94a3b8;
      max-width: 580px;
    }

    /* Right Preview Card */
    .card-preview {
      flex: 0.9;
      background: rgba(18, 20, 32, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 26px 28px;
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 14px;
    }
    .card-title-text {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .card-metric-block {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .card-metric-num {
      font-family: 'Syne', sans-serif;
      font-size: 38px;
      font-weight: 800;
      color: #10b981;
      line-height: 1;
    }
    .card-metric-label {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }
    .card-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .card-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .card-item-label {
      font-size: 14px;
      color: #cbd5e1;
      font-weight: 500;
    }
    .card-item-val {
      font-size: 14px;
      font-weight: 700;
    }

    /* Bottom Info Bar */
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 18px;
    }
    .domain-url {
      font-family: 'DM Sans', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #a78bfa;
    }
    .trust-bullets {
      font-size: 14px;
      color: #64748b;
      display: flex;
      gap: 20px;
    }
    .trust-bullets span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bullet-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
  </style>
</head>
<body>
  <div class="orb-1"></div>
  <div class="orb-2"></div>
  <div class="grid-mesh"></div>

  <!-- Header -->
  <div class="top-bar">
    <div class="brand">
      <div class="logo-mark">C</div>
      <div class="brand-name">CareerNest</div>
    </div>
    <div class="badge-top">Free AI Career Platform</div>
  </div>

  <!-- Main Content Row -->
  <div class="center-row">
    <div class="text-col">
      <div class="badge-pill">${card.badge}</div>
      <h1 class="hero-title">${card.title}</h1>
      <p class="hero-desc">${card.desc}</p>
    </div>

    <!-- Right Feature Card -->
    <div class="card-preview">
      <div class="card-head">
        <span class="card-title-text">${card.cardTitle}</span>
        <div class="card-metric-block">
          <span class="card-metric-num">${card.cardMetric}</span>
          <span class="card-metric-label">${card.cardMetricLabel}</span>
        </div>
      </div>
      <div class="card-list">
        ${card.cardDetails.map(d => `
          <div class="card-item">
            <span class="card-item-label">${d.label}</span>
            <span class="card-item-val" style="color: ${d.color};">${d.val}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="bottom-bar">
    <div class="domain-url">careernest.taqnik.in</div>
    <div class="trust-bullets">
      <span><span class="bullet-dot"></span> ATS Tested (Workday, Taleo, Greenhouse)</span>
      <span><span class="bullet-dot"></span> 100% Free Forever</span>
    </div>
  </div>
</body>
</html>`;
}

async function renderAll() {
  console.log('🚀 Launching headless browser to generate OG images...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=max']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  for (const card of cards) {
    const html = generateHtml(card);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 300));

    const outputPath = path.join(clientDir, card.fileName);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✅ Generated: client/${card.fileName}`);
  }

  await browser.close();
  console.log('🎉 All 6 custom 1200x630 Open Graph images created successfully!');
}

renderAll().catch(err => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});
