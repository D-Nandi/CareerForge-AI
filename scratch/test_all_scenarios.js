const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('resume-import.js', 'utf8');
const sandbox = {};
const fullParserCode = code.match(/function parseResume\([\s\S]*?\n  function dedup[\s\S]*?\n  \}/);
vm.runInNewContext(fullParserCode[0] + '\nthis.parseResume = parseResume;', sandbox);

// Scenario 1: Resume with sublabels like "Technologies:", "Tools:", "Tech Stack:"
const resume1 = `
Debjeet Nandi
debjeet@example.com | +91 9876543210 | Purulia, West Bengal

EDUCATION
B.Tech in Computer Science and Engineering
Techno India College of Technology (2018 - 2022)
CGPA: 8.92

PROJECTS
1. TIEM EventSphere - College Event Management Portal
Technologies:
• React.js, Node.js, Express, MongoDB, Tailwind CSS
• Developed full-stack event registration platform handling 500+ participants.
• Implemented QR code check-in and automated email confirmations.

2. CareerForge AI - Intelligent Resume Builder & ATS Scanner
Tools:
• Next.js, FastAPI, Python, Google Gemini AI, PostgreSQL
• Engineered ATS score evaluation engine analyzing resume syntax and keyword density.
• Designed live drag-and-drop template editor with PDF export.

3. HealthPulse - Telemedicine & Appointment Scheduling System
Tech Stack:
• React Native, Firebase, WebRTC, Node.js
• Built real-time video consultation feature with low-latency WebRTC streams.
• Integrated Stripe payments for doctor consultation fee transactions.

4. CloudMetrics - Distributed Infrastructure Monitoring Dashboard
Technologies:
• Golang, Docker, Prometheus, Grafana, AWS ECS
• Designed telemetry pipeline processing 25,000 metrics/sec across 40 container nodes.
• Visualized server health, p99 request latency, and memory spikes.

SKILLS
React, Node.js, Express, MongoDB, Python, JavaScript, Docker, AWS, Git
`;

// Scenario 2: Unnumbered standalone project titles
const resume2 = `
Debjeet Nandi
debjeet@example.com

PROJECTS
TIEM EventSphere
Technologies:
• React.js, Node.js, Express, MongoDB
• Developed full-stack event registration platform.

CareerForge AI
Tools:
• Next.js, FastAPI, Python, Google Gemini AI
• Engineered ATS score evaluation engine.

HealthPulse
Tech Stack:
• React Native, Firebase, WebRTC
• Built real-time video consultation feature.

CloudMetrics
Technologies:
• Golang, Docker, Prometheus, Grafana
• Designed telemetry pipeline processing metrics.

SKILLS
React, Node.js, Python, AWS
`;

// Scenario 3: Projects under Experience & Projects header
const resume3 = `
Debjeet Nandi
debjeet@example.com

EXPERIENCE & PROJECTS
Frontend Developer - TechCorp (2022 - Present)
• Developed responsive web applications using React.

PROJECTS
1. Smart ATS Scanner
• Engineered keyword matching algorithm.
2. CodeReview Bot
• Built GitHub PR automation bot with Node.js.
3. Portfolio Creator
• Created drag and drop website builder.
4. E-Commerce Cart API
• Developed high-speed caching with Redis.

SKILLS
JavaScript, React, Node.js, Express, MongoDB
`;

const res1 = sandbox.parseResume(resume1);
console.log('--- SCENARIO 1 (Sublabels: Technologies/Tools) ---');
console.log('Projects count:', res1.projects.length);
res1.projects.forEach((p, i) => console.log(`  [${i+1}] ${p.name}`));

const res2 = sandbox.parseResume(resume2);
console.log('\n--- SCENARIO 2 (Unnumbered Standalone Titles) ---');
console.log('Projects count:', res2.projects.length);
res2.projects.forEach((p, i) => console.log(`  [${i+1}] ${p.name}`));

const res3 = sandbox.parseResume(resume3);
console.log('\n--- SCENARIO 3 (Nested in Experience Section) ---');
console.log('Work count:', res3.experience.length, 'Projects count:', res3.projects.length);
res3.projects.forEach((p, i) => console.log(`  [${i+1}] ${p.name}`));

const allPassed = res1.projects.length === 4 && res2.projects.length === 4 && res3.projects.length === 4;
console.log('\nALL SCENARIOS PASSED (4/4 on each):', allPassed);
process.exit(allPassed ? 0 : 1);
