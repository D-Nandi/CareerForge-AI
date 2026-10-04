const fs = require('fs');
const vm = require('vm');

// --- TEST 1: ATS Score Checker (Capped at 100, max 20 contacts) ---
console.log('--- TEST 1: ATS Structure Scoring ---');
const atsHtml = fs.readFileSync('ats-score-checker.html', 'utf8');
const atsCalcMatch = atsHtml.match(/function validateSectionStructure\(text\)\s*\{[\s\S]*?\n        \}/);
const atsSandbox = {};
vm.runInNewContext(atsCalcMatch[0], atsSandbox);

const maxResumeText = `
John Doe
john@example.com | +1 234 567 8900 | linkedin.com/in/johndoe | github.com/johndoe
Work Experience
Senior Software Engineer (2020 - Present)
Architected microservices.
Education
B.Tech in Computer Science from State University
Technical Skills
JavaScript, TypeScript, Python, React, Docker, AWS (Expert)
`;

const atsResult = atsSandbox.validateSectionStructure(maxResumeText);
console.log('Total Score:', atsResult.totalScore);
console.log('Contact Score:', atsResult.contact.score);
console.log('Experience Score:', atsResult.experience.score);
console.log('Education Score:', atsResult.education.score);
console.log('Skills Score:', atsResult.skills.score);

if (atsResult.totalScore <= 100 && atsResult.contact.score <= 20) {
  console.log('PASS: ATS Structure Score accurately computed and capped at 100% (contact <= 20)!');
} else {
  console.error('FAIL: ATS Score exceeded 100% or contact score exceeded 20!');
}

// --- TEST 2: Multi-Project Extraction ---
console.log('\n--- TEST 2: Multi-Project Extraction ---');
const importContent = fs.readFileSync('resume-import.js', 'utf8');
const parseExpMatch = importContent.match(/function parseExperienceAndProjects[\s\S]*?\n  \}/);
const importSandbox = {};
vm.runInNewContext(parseExpMatch[0], importSandbox);

const sampleProjectLines = [
  '1. E-Commerce Microservices Platform | Node.js, Docker, MongoDB',
  'Engineered event-driven checkout flow with RabbitMQ and Stripe integration.',
  'Reduced order placement latency by 35% across 50,000 daily transactions.',
  '2. AI Resume Screening Engine (Python, FastAPI, BERT)',
  'Implemented NLP model parsing resumes and ranking candidate match scores with 92% accuracy.',
  'Deployed on AWS ECS with auto-scaling based on queue depth.',
  '3. Real-Time Collaborative Whiteboard - WebSockets & Canvas API',
  'Built low-latency multi-user whiteboard supporting vector drawing, sticky notes, and export to PDF.',
  'Handled up to 100 concurrent collaborators per room without frame drops.',
  '4. Portfolio Analytics Dashboard: Next.js, Tailwind, PostgreSQL',
  'Visualized real-time crypto and stock performance metrics with interactive Chart.js charts.'
];

const parsed = importSandbox.parseExperienceAndProjects([], sampleProjectLines);
console.log('Extracted Projects Count:', parsed.projects.length);
parsed.projects.forEach((p, idx) => {
  console.log(`  Project ${idx + 1}: [${p.name}] - ${p.description.substring(0, 50)}...`);
});

if (parsed.projects.length === 4) {
  console.log('PASS: Successfully extracted all 4 distinct projects!');
} else {
  console.error(`FAIL: Expected 4 projects, got ${parsed.projects.length}`);
}

// --- TEST 3: Education Parser Sanitization ---
console.log('\n--- TEST 3: Education Info Sanitization ---');
const eduMatch = importContent.match(/function parseEducation[\s\S]*?\n  \}/);
const eduSandbox = {};
vm.runInNewContext(eduMatch[0], eduSandbox);

const sampleEduLines = [
  'B.Tech in Computer Science and Engineering',
  'Techno India College of Technology (2018 - 2022)',
  'CGPA: 8.92 / 10.0 with First Class Distinction',
  'Technical Skills: React, Node.js, JavaScript, Python, MongoDB',
  'Key Competencies: Full Stack Development, Cloud Computing'
];

const edus = eduSandbox.parseEducation(sampleEduLines);
console.log('Degree:', edus[0]?.degree);
console.log('Institution:', edus[0]?.institution);
console.log('Info:', edus[0]?.info);

if (edus.length === 1 && edus[0]?.institution.includes('Techno India') && !edus[0]?.info.includes('Technical Skills') && !edus[0]?.info.includes('React') && edus[0]?.info.includes('CGPA: 8.92')) {
  console.log('PASS: Academic info preserved without skills leaking into education.info!');
} else {
  console.error('FAIL: Education extraction or sanitization mismatch:', edus);
}

// --- TEST 4: Preview DOM & Modal Structure ---
console.log('\n--- TEST 4: Preview DOM & Modal Structure ---');
const previewHtml = fs.readFileSync('preview.html', 'utf8');
const splitScreenIdx = previewHtml.indexOf('class="split-screen"');
const panelPreviewIdx = previewHtml.indexOf('id="previewPanel"');
const endSplitScreenIdx = previewHtml.indexOf('<!-- end split-screen -->');
const viralModalIdx = previewHtml.indexOf('id="viralModal"');
const toolbarIdx = previewHtml.indexOf('id="textSelectionToolbar"');

console.log('split-screen pos:', splitScreenIdx);
console.log('panel-preview pos:', panelPreviewIdx);
console.log('end split-screen pos:', endSplitScreenIdx);
console.log('viralModal pos:', viralModalIdx);
console.log('toolbar pos:', toolbarIdx);

if (endSplitScreenIdx > panelPreviewIdx && viralModalIdx > endSplitScreenIdx) {
  console.log('PASS: split-screen properly closed before modal overlay!');
} else {
  console.error('FAIL: viralModal is still trapped inside split-screen');
}

// --- TEST 5: Modal & Toolbar CSS ---
console.log('\n--- TEST 5: Modal & Toolbar CSS ---');
const previewCss = fs.readFileSync('preview-style.css', 'utf8');
const vmZIndex = previewCss.match(/\.viral-modal-overlay\s*\{[^}]*z-index:\s*(\d+)/);
console.log('viral-modal-overlay z-index:', vmZIndex ? vmZIndex[1] : 'not found');
if (vmZIndex && parseInt(vmZIndex[1]) >= 99999) {
  console.log('PASS: viral-modal-overlay has top z-index (99999)');
} else {
  console.error('FAIL: viral-modal-overlay z-index is too low');
}

const tbFixed = previewCss.includes('.text-selection-toolbar {\n  position: fixed;');
if (tbFixed) {
  console.log('PASS: text-selection-toolbar has position: fixed for accurate viewport positioning');
} else {
  console.error('FAIL: text-selection-toolbar does not have position: fixed');
}
