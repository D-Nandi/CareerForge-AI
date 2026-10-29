const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = String.raw`C:\Users\debje\.gemini\antigravity\brain\52656dce-8684-455d-b55f-052614afe424\.user_uploaded\media_1793253244699_600c9a5d.xlsx`;
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets['Content Matrix'] || wb.Sheets['Production Tracker'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const topics = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && row.length > 3 && typeof row[0] === 'number') {
    topics.push({
      id: row[0],
      cluster: row[1] || '',
      funnel: row[2] || '',
      topic: row[3] || '',
      primaryKeyword: row[4] || '',
      intent: row[5] || '',
      format: row[6] || '',
      priority: row[7] || '',
      pillarPage: row[8] || '',
      productCTA: row[9] || '/resume-builder',
      relatedClusters: row[10] || '',
      suggestedSlug: row[11] || '',
      status: row[0] <= 7 ? 'Published' : 'Backlog'
    });
  }
}

console.log('Extracted', topics.length, 'topics from excel sheet');

// Ensure docs directory exists
const docsDir = path.resolve(__dirname, '../docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const registry = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString().split('T')[0],
  publishedSlugs: [
    "what-information-should-you-put-on-a-resume",
    "what-is-a-resume-and-what-is-it-used-for",
    "how-long-should-a-resume-be",
    "how-to-write-a-resume-for-2026",
    "what-is-the-best-resume-format",
    "how-to-write-a-resume-step-by-step",
    "how-to-write-a-resume-with-no-work-experience"
  ],
  productPages: [
    { url: "/resume-builder", name: "AI Resume Builder", triggers: ["resume builder", "ai resume", "build resume", "create resume"] },
    { url: "/ats-score-checker", name: "Free ATS Resume Checker", triggers: ["ats score", "ats checker", "ats friendly", "keyword scanner", "ats parse"] },
    { url: "/templates", name: "ATS Resume Templates", triggers: ["resume template", "templates", "formatting", "layout"] },
    { url: "/resume-examples", name: "Role-Specific Resume Examples", triggers: ["resume example", "sample resume", "software engineer resume", "fresher resume", "data analyst resume"] },
    { url: "/interview-prep", name: "AI Mock Interview Practice", triggers: ["interview", "interview prep", "mock interview", "behavioral questions", "star method"] },
    { url: "/career-roadmap", name: "AI Career Roadmap", triggers: ["career path", "career roadmap", "career transition", "skills gap", "tech career"] },
    { url: "/salary-benchmark", name: "Tech Salary Benchmark", triggers: ["salary", "compensation", "salary benchmark", "pay range"] }
  ],
  allTopics: topics
};

fs.writeFileSync(path.join(docsDir, 'internal-linking-registry.json'), JSON.stringify(registry, null, 2), 'utf8');
console.log('Created docs/internal-linking-registry.json successfully!');
