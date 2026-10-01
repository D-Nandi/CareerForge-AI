const fs = require('fs');
const vm = require('vm');

const resumeWithUnnumberedProjects = `
Debjeet Nandi
debjeet@example.com | +91 9876543210 | Purulia, West Bengal

EDUCATION
B.Tech in Computer Science and Engineering
Techno India College of Technology (2018 - 2022)
CGPA: 8.92

PROJECTS
TIEM EventSphere
Technologies:
• React.js, Node.js, Express, MongoDB, Tailwind CSS
• Developed full-stack event registration platform handling 500+ participants.

CareerForge AI
Tools:
• Next.js, FastAPI, Python, Google Gemini AI, PostgreSQL
• Engineered ATS score evaluation engine analyzing resume syntax.

HealthPulse
Tech Stack:
• React Native, Firebase, WebRTC, Node.js
• Built real-time video consultation feature.

CloudMetrics
Technologies:
• Golang, Docker, Prometheus, Grafana, AWS ECS
• Designed telemetry pipeline processing 25,000 metrics/sec.

SKILLS
React, Node.js, Express, MongoDB, Python, JavaScript, Docker, AWS, Git
`;

let code = fs.readFileSync('resume-import.js', 'utf8');

// 1. Refine skills section header regex
code = code.replace(
  /\{ key: 'skills', regex: [^}]+ \}/,
  `{ key: 'skills', regex: /^(?:technical\\s+|core\\s+|professional\\s+|key\\s+)?(?:skills|competencies)(?:\\s*(?:&|\\/|\\+)\\s*[\\w\\s]+)?$|^(?:skills\\s*(?:&|\\/|and)\\s*(?:tools|technologies|proficiencies))$/i }`
);

// 2. Multi-section support in getSectionLines
code = code.replace(
  /function getSectionLines\(key\) \{[\s\S]*?\n    \}/,
  `function getSectionLines(key) {
      var matchingBounds = bounds.filter(function(x) { return x.key === key; });
      if (!matchingBounds.length) return [];
      var result = [];
      matchingBounds.forEach(function(b) {
        var nextB = bounds.find(function(x) { return x.idx > b.idx; });
        var end = nextB ? nextB.idx : lines.length;
        result = result.concat(lines.slice(b.idx + 1, end));
      });
      return result;
    }`
);

// 3. Support nextIsBulletOrMeta in Case D
code = code.replace(
  /var nextIsBullet = [^;]+;[\s\S]*?if \(nextIsBullet \|\| !curProject \|\| nextLine\.length > 55\) \{/,
  `var nextIsBulletOrMeta = /^[•\\-*▪◦➤]/.test(nextLine) || actionVerbsRe.test(nextLine.replace(/^[•\\-*▪◦➤]\\s*/, '')) || nonProjectLabels.test(nextLine);
            if (nextIsBulletOrMeta || !curProject || nextLine.length > 55) {`
);

const sandbox = {};
const fullParserCode = code.match(/function parseResume\([\s\S]*?\n  function dedup[\s\S]*?\n  \}/);
vm.runInNewContext(fullParserCode[0] + '\nthis.parseResume = parseResume;', sandbox);

const parsed = sandbox.parseResume(resumeWithUnnumberedProjects);
console.log('Unnumbered Projects Extracted:', parsed.projects.length);
parsed.projects.forEach((p, i) => {
  console.log(`  Project ${i + 1}: [${p.name}]`);
});
