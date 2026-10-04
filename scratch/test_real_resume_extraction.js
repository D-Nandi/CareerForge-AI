const fs = require('fs');
const vm = require('vm');

const sampleResumeWithSublabels = `
Debjeet Nandi
debjeet@example.com | +91 9876543210 | Purulia, West Bengal | linkedin.com/in/debjeet

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

// Let's modify parseResume to avoid false-positive section breaks
let code = fs.readFileSync('resume-import.js', 'utf8');

// Replace the skills regex in sectionHeaders
code = code.replace(
  /\{ key: 'skills', regex: [^}]+ \}/,
  `{ key: 'skills', regex: /^(?:technical\\s+|core\\s+|professional\\s+|key\\s+)?(?:skills|competencies)(?:\\s*(?:&|\\/|\\+)\\s*[\\w\\s]+)?$|^(?:skills\\s*(?:&|\\/|and)\\s*(?:tools|technologies|proficiencies))$/i }`
);

const sandbox = {};
const fullParserCode = code.match(/function parseResume\([\s\S]*?\n  function dedup[\s\S]*?\n  \}/);
vm.runInNewContext(fullParserCode[0] + '\nthis.parseResume = parseResume;', sandbox);

const parsed = sandbox.parseResume(sampleResumeWithSublabels);
console.log('Total Projects Extracted:', parsed.projects.length);
parsed.projects.forEach((p, i) => {
  console.log(`  Project ${i + 1}: [${p.name}]`);
  console.log(`    Desc: ${p.description.substring(0, 70)}...`);
});
