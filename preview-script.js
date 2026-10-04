﻿﻿// ══════════════════════════════════════════════════════
//  RESUMATIC — Preview Script
//  Handles: live data binding, template switching,
//           experience/education blocks, divider drag,
//           print/download, cover letter generation
// ══════════════════════════════════════════════════════

// ── STATE ──
const state = {
  personal: { firstName:'', lastName:'', title:'', email:'', phone:'', location:'', linkedin:'', summary:'' },
  experience: [],
  projects: [],
  education: [],
  skills: { tech:[], soft:[], languages:[] },
  langProficiency: [], // [{name, overall, speaking, reading, writing}]
};

let expCount = 0;
let eduCount = 0;
let activeTemplate = 'classic';

// ══════════════════════════════════════════════════════
//  TEMPLATE SWITCHER
// ══════════════════════════════════════════════════════
const tplButtons   = document.querySelectorAll('.tpl-btn');
const tplSheets    = document.querySelectorAll('.resume-sheet');
const tplNameLabel = document.getElementById('activeTemplateName');

tplButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tpl = btn.dataset.template;
    if (tpl === activeTemplate) return;
    switchTemplate(tpl);
  });
});

function switchTemplate(tpl) {
  const current  = document.getElementById(`tpl-${activeTemplate}`);
  const next     = document.getElementById(`tpl-${tpl}`);

  current.classList.add('leaving');
  current.classList.remove('active-template');

  next.style.display = 'block';
  next.classList.add('entering');

  void next.offsetWidth;

  requestAnimationFrame(() => {
    next.classList.remove('entering');
    next.classList.add('active-template');
  });

  setTimeout(() => {
    current.classList.remove('leaving');
    current.style.display = '';
  }, 380);

  tplButtons.forEach(b => b.classList.toggle('active', b.dataset.template === tpl));
  tplNameLabel.textContent = tpl.charAt(0).toUpperCase() + tpl.slice(1);
  activeTemplate = tpl;
  renderAll();
}

// ══════════════════════════════════════════════════════
//  PERSONAL INFO: live bind
// ══════════════════════════════════════════════════════
const personalBindings = {
  p_firstName : renderAll,
  p_lastName  : renderAll,
  p_title     : renderAll,
  p_email     : renderAll,
  p_phone     : renderAll,
  p_location  : renderAll,
  p_linkedin  : renderAll,
  p_summary   : renderAll,
  p_techSkills: renderAll,
  p_softSkills: renderAll,
  p_languages : renderAll,
};

Object.entries(personalBindings).forEach(([id, fn]) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => { syncPersonal(); fn(); });
});

function syncPersonal() {
  state.personal.firstName = val('p_firstName');
  state.personal.lastName  = val('p_lastName');
  state.personal.title     = val('p_title');
  state.personal.email     = val('p_email');
  state.personal.phone     = val('p_phone');
  state.personal.location  = val('p_location');
  state.personal.linkedin  = val('p_linkedin');
  state.personal.summary   = val('p_summary');

  const raw = (key, id) => { const r = val(id); return r ? r.split(',').map(s=>s.trim()).filter(Boolean) : []; };
  state.skills.tech      = raw('tech', 'p_techSkills');
  state.skills.soft      = raw('soft', 'p_softSkills');
  // Convert structured language proficiency data to display strings
  state.skills.languages = (state.langProficiency || []).map(lp => {
    if (!lp || !lp.name) return null;
    var parts = [];
    if (lp.overall) parts.push(lp.overall);
    var subSkills = [];
    if (lp.speaking) subSkills.push('Speaking: ' + lp.speaking);
    if (lp.reading)  subSkills.push('Reading: ' + lp.reading);
    if (lp.writing)  subSkills.push('Writing: ' + lp.writing);
    if (subSkills.length) {
      parts.push(subSkills.join(', '));
    }
    return parts.length ? lp.name + ' (' + parts.join(' - ') + ')' : lp.name;
  }).filter(Boolean);
}

// ══════════════════════════════════════════════════════
//  RENDER ALL — dispatches to active template
// ══════════════════════════════════════════════════════
function renderAll() {
  syncPersonal();
  if (activeTemplate === 'classic')   renderClassic();
  if (activeTemplate === 'modern')    renderModern();
  if (activeTemplate === 'minimal')   renderMinimal();
  if (typeof makeResumeEditable === 'function') makeResumeEditable();
  if (typeof updateSkillEnhancerUI === 'function') updateSkillEnhancerUI();
  updateLiveATSReadiness();
  if (typeof checkPageOverflow === 'function') checkPageOverflow();
}

// ══════════════════════════════════════════════════════
//  LIVE ATS READINESS EVALUATOR (Synchronized with ATS Checker)
// ══════════════════════════════════════════════════════
function updateLiveATSReadiness() {
  const badge = document.getElementById('arwScoreBadge');
  if (!badge) return;

  const p = state.personal || {};
  const expText = (state.experience || []).map(e => `${e.role || ''} ${e.company || ''} ${e.startDate || ''} ${e.endDate || ''} ${e.description || ''}`).join(' ');
  const projText = (state.projects || []).map(pr => `${pr.name || pr.title || ''} ${pr.description || ''}`).join(' ');
  const eduText = (state.education || []).map(ed => `${ed.degree || ''} ${ed.institution || ''} ${ed.details || ''}`).join(' ');
  const rawTech = (state.skills && state.skills.tech) || [];
  const rawSoft = (state.skills && state.skills.soft) || [];
  const rawLang = (state.skills && state.skills.languages) || [];
  const skillsText = [...rawTech, ...rawSoft, ...rawLang].join(' ');

  const fullResumeText = `${p.firstName || ''} ${p.lastName || ''} ${p.title || ''} ${p.email || ''} ${p.phone || ''} ${p.location || ''} ${p.linkedin || ''} ${p.summary || ''} ${expText} ${projText} ${eduText} ${skillsText}`;
  const fullLower = fullResumeText.toLowerCase();

  const clJobDescEl = document.getElementById('cl_jobDescription');
  const targetJD = clJobDescEl ? clJobDescEl.value.trim() : '';

  // 1. Structure score (0-100) — checks verified fields, sections, dates & proficiency levels
  let structScore = 0;
  if (p.email && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(p.email)) structScore += 15;
  if (p.phone && /\d{7,}/.test(p.phone.replace(/\D/g, ''))) structScore += 5;
  if (p.linkedin && /linkedin\.com|github\.com|[a-z0-9-]+\.(io|dev|com|me)/i.test(p.linkedin)) structScore += 5;

  const hasExpDates = (state.experience || []).some(e => e.role && (e.startDate || e.endDate));
  if (state.experience && state.experience.length > 0 && hasExpDates) structScore += 35;
  else if (state.experience && state.experience.length > 0) structScore += 25;

  const hasEduSchool = (state.education || []).some(ed => ed.degree && ed.institution);
  if (state.education && state.education.length > 0 && hasEduSchool) structScore += 20;
  else if (state.education && state.education.length > 0) structScore += 14;

  if (rawTech.length >= 4) structScore += 10;
  else if (rawTech.length >= 2) structScore += 6;

  // Skill proficiency level bonus (Expert, Advanced, Intermediate, Proficient)
  const ratedSkillsCount = rawTech.filter(s => /\((expert|advanced|intermediate|proficient|beginner|senior|lead)\)/i.test(s)).length;
  if (ratedSkillsCount >= 3) {
    structScore += 10; // Bonus for explicit depth
  } else if (ratedSkillsCount >= 1) {
    structScore += 5;
  }
  structScore = Math.min(100, structScore);

  // 2. Metrics / Impact score (0-100)
  const metricMatches = fullResumeText.match(/\b\d+(\.\d+)?\s*%|\b\d{1,3}(,\d{3})*(\.\d+)?\s*([kKmMbB]|\+)?\s*(users|clients|customers|requests|queries|downloads|records|visits|subscribers|transactions|accounts|events|sessions|endpoints|pipelines)\b|[\$\€\£\₹]\s*\d{1,3}(,\d{3})*(\.\d+)?\s*([kKmMbB]|million|thousand)?\b|\b\d+(\.\d+)?\s*(ms|milliseconds|seconds|sec|x|fold|fps)\b|\b(reduced|increased|improved|boosted|cut|saved|scaled|optimized|delivered|grew)\s+(by\s+)?(\d+(\.\d+)?\s*(hours|hrs|days|weeks|percent)?)/gi) || [];

  const ACTION_VERBS = [
    'accelerated', 'achieved', 'administered', 'analyzed', 'architected', 'automated',
    'benchmarked', 'built', 'championed', 'collaborated', 'conceptualized', 'coordinated',
    'decreased', 'delivered', 'deployed', 'designed', 'developed', 'devised', 'directed',
    'engineered', 'established', 'executed', 'expanded', 'expedited', 'formulated',
    'generated', 'implemented', 'improved', 'increased', 'initiated', 'innovated',
    'integrated', 'launched', 'led', 'managed', 'maximized', 'mentored', 'minimized',
    'modernized', 'optimized', 'orchestrated', 'overhauled', 'pioneered', 'reduced',
    'refactored', 'resolved', 'restructured', 'revamped', 'scaled', 'simplified',
    'spearheaded', 'standardized', 'streamlined', 'strengthened', 'supervised',
    'surpassed', 'systematized', 'transformed', 'upgraded', 'yielded'
  ];
  let actionVerbCount = 0;
  ACTION_VERBS.forEach(v => {
    if (new RegExp('\\b' + v + '\\b', 'i').test(fullResumeText)) actionVerbCount++;
  });
  const impactScore = Math.min(100, Math.round((metricMatches.length * 18) + (actionVerbCount * 8)));

  // 3. Readability (Flesch-Kincaid & word budget)
  const words = fullResumeText.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const totalWords = words.length;
  let readabilityScore = 65;
  if (totalWords >= 350 && totalWords <= 850) {
    readabilityScore = 95;
  } else if (totalWords >= 220 && totalWords < 350) {
    readabilityScore = 82;
  } else if (totalWords >= 120 && totalWords < 220) {
    readabilityScore = 72;
  } else if (totalWords > 850 && totalWords <= 1200) {
    readabilityScore = 80;
  } else if (totalWords > 1200) {
    readabilityScore = 60;
  } else {
    readabilityScore = 45;
  }

  // 4. Keyword score with Domain Benchmarks & Synonyms
  let keywordScore = 70;
  if (targetJD && targetJD.length > 25) {
    const rawJD = targetJD.toLowerCase().match(/\b[a-z0-9#\+\.\/\-]{2,}\b/g) || [];
    const stopWords = new Set(['the','and','with','for','that','this','from','are','will','have','our','your','role','responsibilities','experience','looking','seeking','skills','required','qualifications']);
    const jdKeywords = [...new Set(rawJD.filter(w => !stopWords.has(w) && !/^\d+$/.test(w)))];
    if (jdKeywords.length > 0) {
      let matchedCount = 0;
      jdKeywords.forEach(kw => {
        if (fullLower.includes(kw)) matchedCount++;
      });
      keywordScore = Math.min(100, Math.max(25, Math.round((matchedCount / jdKeywords.length) * 100)));
    }
  } else {
    // Role domain benchmark
    const DOMAIN_BENCHMARKS = {
      fullstack: ['javascript', 'typescript', 'react', 'node.js', 'sql', 'mongodb', 'api', 'docker', 'git', 'html', 'css', 'rest', 'aws', 'communication', 'leadership'],
      frontend: ['javascript', 'typescript', 'react', 'html', 'css', 'redux', 'vue', 'webpack', 'tailwind', 'next.js', 'responsive', 'rest', 'git', 'collaboration', 'problem solving'],
      backend: ['node.js', 'python', 'java', 'express', 'sql', 'postgresql', 'mongodb', 'docker', 'api', 'microservices', 'redis', 'aws', 'git', 'system design', 'problem solving'],
      devops: ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd', 'linux', 'python', 'bash', 'ansible', 'jenkins', 'cloud', 'git', 'monitoring', 'incident management', 'troubleshooting'],
      data: ['python', 'sql', 'pandas', 'machine learning', 'numpy', 'tableau', 'spark', 'r', 'statistics', 'etl', 'visualization', 'git', 'analytical skills', 'critical thinking']
    };

    let domain = 'fullstack';
    const titleLower = (p.title || '').toLowerCase();
    if (/devops|sre|infrastructure|kubernetes/i.test(titleLower + ' ' + fullLower)) domain = 'devops';
    else if (/data\s*scientist|data\s*analyst|machine\s*learning|ai/i.test(titleLower + ' ' + fullLower)) domain = 'data';
    else if (/frontend|ui|ux|react|web\s*developer/i.test(titleLower) && !/node|express|backend/i.test(titleLower)) domain = 'frontend';
    else if (/backend|api|server|golang/i.test(titleLower)) domain = 'backend';

    const benchmark = DOMAIN_BENCHMARKS[domain] || DOMAIN_BENCHMARKS.fullstack;
    let matched = 0;
    benchmark.forEach(b => {
      const bEsc = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('(^|[^a-zA-Z0-9])' + bEsc + '([^a-zA-Z0-9]|$)', 'i').test(fullResumeText)) {
        matched++;
      }
    });

    const matchRatio = matched / benchmark.length;
    keywordScore = Math.min(100, Math.max(30, Math.round(matchRatio * 100)));
    // Bonus for having proficiency levels attached to skills
    if (ratedSkillsCount >= 3) keywordScore = Math.min(100, keywordScore + 10);
  }

  // Composite ATS Score
  const overallScore = Math.round(
    (keywordScore * 0.35) +
    (readabilityScore * 0.25) +
    (impactScore * 0.20) +
    (structScore * 0.20)
  );

  // UI updates
  badge.textContent = `${overallScore}%`;
  const fill = document.getElementById('arwProgressFill');
  if (fill) {
    fill.style.width = `${overallScore}%`;
    if (overallScore >= 85) {
      fill.style.background = '#10b981';
      badge.style.color = '#10b981';
      badge.style.background = 'rgba(16, 185, 129, 0.12)';
      badge.style.borderColor = 'rgba(16, 185, 129, 0.25)';
    } else if (overallScore >= 65) {
      fill.style.background = '#f59e0b';
      badge.style.color = '#f59e0b';
      badge.style.background = 'rgba(245, 158, 11, 0.12)';
      badge.style.borderColor = 'rgba(245, 158, 11, 0.25)';
    } else {
      fill.style.background = '#ef4444';
      badge.style.color = '#ef4444';
      badge.style.background = 'rgba(239, 68, 68, 0.12)';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.25)';
    }
  }

  const sub = document.getElementById('arwSubtitle');
  if (sub) {
    if (overallScore >= 85) sub.textContent = 'ATS High Pass Rate';
    else if (overallScore >= 65) sub.textContent = 'Moderate ATS Match';
    else sub.textContent = 'Action Required';
  }

  const kwEl = document.getElementById('arwKeywords');
  if (kwEl) kwEl.textContent = `${keywordScore}%`;
  const rdEl = document.getElementById('arwReadability');
  if (rdEl) rdEl.textContent = `${readabilityScore}%`;
  const impEl = document.getElementById('arwImpact');
  if (impEl) impEl.textContent = `${impactScore}%`;
  const stEl = document.getElementById('arwStructure');
  if (stEl) stEl.textContent = `${structScore}%`;

  // Actionable tip in ATS meter
  const tipEl = document.getElementById('arwActionTip');
  if (tipEl) {
    tipEl.style.display = 'block';
    if (ratedSkillsCount < 3 && rawTech.length > 0) {
      tipEl.innerHTML = `⚡ <b>ATS Tip:</b> Use the <b>Skill Enhancer</b> below to add proficiency levels (Expert, Advanced) for +15% ATS boost!`;
    } else if (metricMatches.length < 2) {
      tipEl.innerHTML = `⚡ <b>ATS Tip:</b> Add 2+ metrics with numbers or % (e.g. <i>"scaled to 50k users", "cut latency by 40%"</i>) to raise impact.`;
    } else if (totalWords < 320) {
      tipEl.innerHTML = `⚡ <b>ATS Tip:</b> Add more achievement bullet points in Experience to hit the optimal ATS word count (350+ words).`;
    } else if (overallScore >= 85) {
      tipEl.innerHTML = `✓ <b>ATS Ready:</b> Resume structure &amp; keyword depth match top hiring algorithms.`;
    } else {
      tipEl.innerHTML = `⚡ <b>ATS Tip:</b> Review missing skills or metrics to boost candidate callback rate.`;
    }
  }
}

// ══════════════════════════════════════════════════════
//  TEMPLATE: CLASSIC
// ══════════════════════════════════════════════════════
function renderClassic() {
  const p = state.personal;
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');

  setTextEmpty('cl_name', full, 'Your Name', 'personal.name');
  setTextEmpty('cl_title', p.title, 'Professional Title', 'personal.title');

  const contactFields = [
    { key: 'email', val: p.email, icon: '' },
    { key: 'phone', val: p.phone, icon: '' },
    { key: 'location', val: p.location, icon: '' },
    { key: 'linkedin', val: p.linkedin, icon: '' },
  ];
  const el = document.getElementById('cl_contact');
  if (el) {
    el.innerHTML = contactFields
      .filter(f => f.val)
      .map(f => `<span class="cl-contact-item" data-canva-editable="true" data-edit-path="personal.${f.key}">${esc(f.val)}</span>`)
      .join('');
  }

  const sum = document.getElementById('cl_summary');
  if (sum) {
    if (document.activeElement !== sum) sum.textContent = p.summary || 'Your professional summary will appear here.';
    sum.setAttribute('data-canva-editable', 'true');
    sum.dataset.editPath = 'personal.summary';
  }

  renderClassicExperience();
  renderClassicProjects();
  renderClassicEducation();

  renderSkillTags('cl_techSkills', state.skills.tech, 'cl-skill-tag');
  renderSkillTags('cl_softSkills', state.skills.soft, 'cl-skill-tag');
  renderSkillTags('cl_languages',  state.skills.languages, 'cl-skill-tag');
}

function renderClassicExperience() {
  const c = document.getElementById('cl_experience');
  if (!c) return;
  const entries = state.experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="cl-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map((e, ei) => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title" data-canva-editable="true" data-edit-path="experience.${ei}.role">${safeRenderRichText(e.role) || '—'}</span>
        <span class="cl-entry-date" data-canva-editable="true" data-edit-path="experience.${ei}.dates">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="cl-entry-sub" data-canva-editable="true" data-edit-path="experience.${ei}.company">${safeRenderRichText(e.company)}</div>
      ${e.description ? `<div class="cl-entry-desc" data-canva-editable="true" data-edit-path="experience.${ei}.description">${safeRenderRichText(e.description)}</div>` : ''}
    </div>`).join('');
}

function renderClassicProjects() {
  const c = document.getElementById('cl_projects');
  const sec = document.getElementById('clProjectsSection');
  if (!c) return;
  const entries = (state.projects || []).filter(p => p.name || p.title);
  if (sec) sec.style.display = entries.length ? 'block' : 'none';
  if (!entries.length) { c.innerHTML = ''; return; }
  c.innerHTML = entries.map((p, pi) => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title" data-canva-editable="true" data-edit-path="projects.${pi}.name">${safeRenderRichText(p.name || p.title) || '—'}</span>
        ${p.startDate ? `<span class="cl-entry-date" data-canva-editable="true" data-edit-path="projects.${pi}.startDate">${safeRenderRichText(p.startDate)}</span>` : ''}
      </div>
      <div class="cl-entry-sub" data-canva-editable="true" data-edit-path="projects.${pi}.type">${[safeRenderRichText(p.type || 'Personal Project'), p.link ? `<a href="${esc(p.link)}" target="_blank" style="color:inherit;text-decoration:underline;">Link ↗</a>` : ''].filter(Boolean).join(' • ')}</div>
      ${p.description ? `<div class="cl-entry-desc" data-canva-editable="true" data-edit-path="projects.${pi}.description">${safeRenderRichText(p.description)}</div>` : ''}
    </div>`).join('');
}

function renderClassicEducation() {
  const c = document.getElementById('cl_education');
  if (!c) return;
  const entries = state.education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="cl-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map((e, di) => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title" data-canva-editable="true" data-edit-path="education.${di}.degree">${safeRenderRichText(e.degree) || '—'}</span>
        <span class="cl-entry-date" data-canva-editable="true" data-edit-path="education.${di}.dates">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="cl-entry-sub" data-canva-editable="true" data-edit-path="education.${di}.institution">${safeRenderRichText(e.institution)}</div>
      ${e.details ? `<div class="cl-entry-desc" data-canva-editable="true" data-edit-path="education.${di}.details">${safeRenderRichText(e.details)}</div>` : ''}
    </div>`).join('');
}

// ══════════════════════════════════════════════════════
//  TEMPLATE: MODERN
// ══════════════════════════════════════════════════════
function renderModern() {
  const p = state.personal;
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');

  const initials = [p.firstName, p.lastName]
    .filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?';
  const avi = document.getElementById('mo_initials');
  if (avi) avi.textContent = initials;

  setTextEmpty('mo_name', full, 'Your Name', 'personal.name');
  setTextEmpty('mo_title', p.title, 'Professional Title', 'personal.title');
  setTextEmpty('mo_main_name', full, 'Your Name', 'personal.name');
  setTextEmpty('mo_main_title', p.title, 'Professional Title', 'personal.title');

  const contactFields = [
    { key: 'email', val: p.email,    icon: '✉' },
    { key: 'phone', val: p.phone,    icon: '☎' },
    { key: 'location', val: p.location, icon: '⌖' },
    { key: 'linkedin', val: p.linkedin, icon: '⇗' },
  ];
  const mc = document.getElementById('mo_contact');
  if (mc) {
    mc.innerHTML = contactFields
      .filter(f => f.val)
      .map(f => `<div class="mo-contact-item" data-canva-editable="true" data-edit-path="personal.${f.key}"><span class="mo-contact-icon">${f.icon}</span>${esc(f.val)}</div>`)
      .join('') || '<div class="mo-contact-item" style="color:rgba(196,181,253,0.4);font-style:italic">No contact info</div>';
  }

  const sum = document.getElementById('mo_summary');
  if (sum) {
    if (document.activeElement !== sum) sum.textContent = p.summary || 'Your professional summary will appear here.';
    sum.setAttribute('data-canva-editable', 'true');
    sum.dataset.editPath = 'personal.summary';
  }

  renderSkillTags('mo_techSkills', state.skills.tech, 'mo-tag');
  renderSkillTags('mo_softSkills', state.skills.soft, 'mo-tag');
  renderSkillTags('mo_languages',  state.skills.languages, 'mo-tag');

  renderModernExperience();
  renderModernProjects();
  renderModernEducation();
}

function renderModernExperience() {
  const c = document.getElementById('mo_experience');
  if (!c) return;
  const entries = state.experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="mo-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map((e, ei) => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title" data-canva-editable="true" data-edit-path="experience.${ei}.role">${safeRenderRichText(e.role) || '—'}</span>
        ${[e.startDate, e.endDate].filter(Boolean).length ? `<span class="mo-entry-date" data-canva-editable="true" data-edit-path="experience.${ei}.dates">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>` : ''}
      </div>
      <div class="mo-entry-sub" data-canva-editable="true" data-edit-path="experience.${ei}.company">${safeRenderRichText(e.company)}</div>
      ${e.description ? `<div class="mo-entry-desc" data-canva-editable="true" data-edit-path="experience.${ei}.description">${safeRenderRichText(e.description)}</div>` : ''}
    </div>`).join('');
}

function renderModernProjects() {
  const c = document.getElementById('mo_projects');
  const sec = document.getElementById('moProjectsSection');
  if (!c) return;
  const entries = (state.projects || []).filter(p => p.name || p.title);
  if (sec) sec.style.display = entries.length ? 'block' : 'none';
  if (!entries.length) { c.innerHTML = ''; return; }
  c.innerHTML = entries.map((p, pi) => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title" data-canva-editable="true" data-edit-path="projects.${pi}.name">${safeRenderRichText(p.name || p.title) || '—'}</span>
        ${p.startDate ? `<span class="mo-entry-date" data-canva-editable="true" data-edit-path="projects.${pi}.startDate">${safeRenderRichText(p.startDate)}</span>` : ''}
      </div>
      <div class="mo-entry-sub" data-canva-editable="true" data-edit-path="projects.${pi}.type">${[safeRenderRichText(p.type || 'Personal Project'), p.link ? `<a href="${esc(p.link)}" target="_blank" style="color:var(--accent2);text-decoration:none;">Link ↗</a>` : ''].filter(Boolean).join(' • ')}</div>
      ${p.description ? `<div class="mo-entry-desc" data-canva-editable="true" data-edit-path="projects.${pi}.description">${safeRenderRichText(p.description)}</div>` : ''}
    </div>`).join('');
}

function renderModernEducation() {
  const c = document.getElementById('mo_education');
  if (!c) return;
  const entries = state.education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="mo-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map((e, di) => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title" data-canva-editable="true" data-edit-path="education.${di}.degree">${safeRenderRichText(e.degree) || '—'}</span>
        ${[e.startYear, e.endYear].filter(Boolean).length ? `<span class="mo-entry-date" data-canva-editable="true" data-edit-path="education.${di}.dates">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>` : ''}
      </div>
      <div class="mo-entry-sub" data-canva-editable="true" data-edit-path="education.${di}.institution">${safeRenderRichText(e.institution)}</div>
      ${e.details ? `<div class="mo-entry-desc" data-canva-editable="true" data-edit-path="education.${di}.details">${safeRenderRichText(e.details)}</div>` : ''}
    </div>`).join('');
}

// ══════════════════════════════════════════════════════
//  TEMPLATE: MINIMAL
// ══════════════════════════════════════════════════════
function renderMinimal() {
  const p = state.personal;
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');

  setTextEmpty('mn_name', full, 'Your Name', 'personal.name');
  setTextEmpty('mn_title', p.title, 'Professional Title', 'personal.title');

  const contactFields = [
    { key: 'email', val: p.email },
    { key: 'phone', val: p.phone },
    { key: 'location', val: p.location },
    { key: 'linkedin', val: p.linkedin },
  ].filter(f => f.val);
  const mc = document.getElementById('mn_contact');
  if (mc) {
    mc.innerHTML = contactFields
      .map(f => `<span class="mn-contact-item" data-canva-editable="true" data-edit-path="personal.${f.key}">${esc(f.val)}</span>`)
      .join('') || '';
  }

  const sum = document.getElementById('mn_summary');
  if (sum) {
    if (document.activeElement !== sum) {
      if (p.summary && /<(span|b|i|u|strong|em)\b/i.test(p.summary)) {
        sum.innerHTML = p.summary;
      } else {
        sum.textContent = p.summary || 'Your professional summary will appear here.';
      }
    }
    sum.setAttribute('data-canva-editable', 'true');
    sum.dataset.editPath = 'personal.summary';
  }

  renderSkillTags('mn_techSkills', state.skills.tech, 'mn-tag');
  renderSkillTags('mn_softSkills', state.skills.soft, 'mn-tag');
  renderSkillTags('mn_languages',  state.skills.languages, 'mn-tag');

  renderMinimalExperience();
  renderMinimalProjects();
  renderMinimalEducation();
}

function renderMinimalExperience() {
  const c = document.getElementById('mn_experience');
  if (!c) return;
  const entries = state.experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="mn-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map((e, ei) => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title" data-canva-editable="true" data-edit-path="experience.${ei}.role">${safeRenderRichText(e.role) || '—'}</span>
        <span class="mn-entry-date" data-canva-editable="true" data-edit-path="experience.${ei}.dates">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="mn-entry-sub" data-canva-editable="true" data-edit-path="experience.${ei}.company">${safeRenderRichText(e.company)}</div>
      ${e.description ? `<div class="mn-entry-desc" data-canva-editable="true" data-edit-path="experience.${ei}.description">${safeRenderRichText(e.description)}</div>` : ''}
    </div>`).join('');
}

function renderMinimalProjects() {
  const c = document.getElementById('mn_projects');
  const sec = document.getElementById('mnProjectsSection');
  if (!c) return;
  const entries = (state.projects || []).filter(p => p.name || p.title);
  if (sec) sec.style.display = entries.length ? 'grid' : 'none';
  if (!entries.length) { c.innerHTML = ''; return; }
  c.innerHTML = entries.map((p, pi) => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title" data-canva-editable="true" data-edit-path="projects.${pi}.name">${safeRenderRichText(p.name || p.title) || '—'}</span>
        ${p.startDate ? `<span class="mn-entry-date" data-canva-editable="true" data-edit-path="projects.${pi}.startDate">${safeRenderRichText(p.startDate)}</span>` : ''}
      </div>
      <div class="mn-entry-sub" data-canva-editable="true" data-edit-path="projects.${pi}.type">${[safeRenderRichText(p.type || 'Personal Project'), p.link ? `<a href="${esc(p.link)}" target="_blank" style="color:#475569;text-decoration:underline;">Link ↗</a>` : ''].filter(Boolean).join(' • ')}</div>
      ${p.description ? `<div class="mn-entry-desc" data-canva-editable="true" data-edit-path="projects.${pi}.description">${safeRenderRichText(p.description)}</div>` : ''}
    </div>`).join('');
}

function renderMinimalEducation() {
  const c = document.getElementById('mn_education');
  if (!c) return;
  const entries = state.education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="mn-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map((e, di) => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title" data-canva-editable="true" data-edit-path="education.${di}.degree">${safeRenderRichText(e.degree) || '—'}</span>
        <span class="mn-entry-date" data-canva-editable="true" data-edit-path="education.${di}.dates">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="mn-entry-sub" data-canva-editable="true" data-edit-path="education.${di}.institution">${safeRenderRichText(e.institution)}</div>
      ${e.details ? `<div class="mn-entry-desc" data-canva-editable="true" data-edit-path="education.${di}.details">${safeRenderRichText(e.details)}</div>` : ''}
    </div>`).join('');
}

// ══════════════════════════════════════════════════════
//  EXPERIENCE BLOCKS
// ══════════════════════════════════════════════════════
document.getElementById('addExp').addEventListener('click', () => addExpBlock());

function addExpBlock(data = {}) {
  expCount++;
  const id  = `exp_${expCount}`;
  const div = document.createElement('div');
  div.className = 'entry-block';
  div.id = id;
  div.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-num">Experience ${expCount}</span>
      <button class="btn-remove" onclick="removeBlock('${id}','experience')">×</button>
    </div>
    <div class="form-row">
      <div class="field-group">
        <label>Job Title</label>
        <input type="text" data-key="role" placeholder="Frontend Developer" value="${esc(data.role||'')}" />
      </div>
      <div class="field-group">
        <label>Company</label>
        <input type="text" data-key="company" placeholder="Google" value="${esc(data.company||'')}" />
      </div>
    </div>
    <div class="form-row">
      <div class="field-group">
        <label>Start Date</label>
        <input type="text" data-key="startDate" placeholder="Jan 2022" value="${esc(data.startDate||'')}" />
      </div>
      <div class="field-group">
        <label>End Date</label>
        <input type="text" data-key="endDate" placeholder="Present" value="${esc(data.endDate||'')}" />
      </div>
    </div>
    <div class="field-group">
      <label>Description</label>
      <textarea data-key="description" rows="2" placeholder="Key responsibilities and achievements...">${esc(data.description||'')}</textarea>
    </div>`;

  const entry = { _id: id, role: data.role||'', company: data.company||'', startDate: data.startDate||'', endDate: data.endDate||'', description: data.description||'' };
  state.experience.push(entry);
  document.getElementById('expFields').appendChild(div);
  div.querySelectorAll('input,textarea').forEach(el => {
    el.addEventListener('input', () => { syncBlock(id, 'experience', div); renderAll(); });
  });
}

// ══════════════════════════════════════════════════════
//  EDUCATION BLOCKS
// ══════════════════════════════════════════════════════
document.getElementById('addEdu').addEventListener('click', () => addEduBlock());

function addEduBlock(data = {}) {
  eduCount++;
  const id  = `edu_${eduCount}`;
  const div = document.createElement('div');
  div.className = 'entry-block';
  div.id = id;
  div.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-num">Education ${eduCount}</span>
      <button class="btn-remove" onclick="removeBlock('${id}','education')">×</button>
    </div>
    <div class="form-row">
      <div class="field-group">
        <label>Degree</label>
        <input type="text" data-key="degree" placeholder="B.Tech Computer Science" value="${esc(data.degree||'')}" />
      </div>
      <div class="field-group">
        <label>Institution</label>
        <input type="text" data-key="institution" placeholder="IIT Delhi" value="${esc(data.institution||'')}" />
      </div>
    </div>
    <div class="form-row">
      <div class="field-group">
        <label>Start Year</label>
        <input type="text" data-key="startYear" placeholder="2019" value="${esc(data.startYear||'')}" />
      </div>
      <div class="field-group">
        <label>End Year</label>
        <input type="text" data-key="endYear" placeholder="2023" value="${esc(data.endYear||'')}" />
      </div>
    </div>
    <div class="field-group">
      <label>Details</label>
      <input type="text" data-key="details" placeholder="GPA, honors, relevant coursework..." value="${esc(data.details || data.info||'')}" />
    </div>`;

  const entry = { _id: id, degree: data.degree||'', institution: data.institution||'', startYear: data.startYear||'', endYear: data.endYear||'', details: data.details || data.info||'' };
  state.education.push(entry);
  document.getElementById('eduFields').appendChild(div);
  div.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', () => { syncBlock(id, 'education', div); renderAll(); });
  });
}

// ══════════════════════════════════════════════════
//  PROJECT BLOCKS
// ══════════════════════════════════════════════════
let projCount = 0;
const btnAddProj = document.getElementById('addProj');
if (btnAddProj) btnAddProj.addEventListener('click', () => addProjBlock());

function addProjBlock(data = {}) {
  projCount++;
  const id  = `proj_${projCount}`;
  const div = document.createElement('div');
  div.className = 'entry-block';
  div.id = id;
  div.innerHTML = `
    <div class="entry-block-header">
      <span class="entry-block-num">Project ${projCount}</span>
      <button class="btn-remove" onclick="removeBlock('${id}','project')">×</button>
    </div>
    <div class="form-row">
      <div class="field-group">
        <label>Project Name</label>
        <input type="text" data-key="name" placeholder="TIEM EventSphere" value="${esc(data.name || data.title || '')}" />
      </div>
      <div class="field-group">
        <label>Type / Role</label>
        <input type="text" data-key="type" placeholder="Personal Project" value="${esc(data.type || '')}" />
      </div>
    </div>
    <div class="form-row">
      <div class="field-group">
        <label>Project Link</label>
        <input type="text" data-key="link" placeholder="https://github.com/..." value="${esc(data.link || '')}" />
      </div>
      <div class="field-group">
        <label>Date</label>
        <input type="text" data-key="startDate" placeholder="2023 – Present" value="${esc(data.startDate || '')}" />
      </div>
    </div>
    <div class="field-group">
      <label>Description</label>
      <textarea data-key="description" rows="2" placeholder="Key technologies and accomplishments...">${esc(data.description || '')}</textarea>
    </div>`;

  const entry = {
    _id: id,
    name: data.name || data.title || '',
    type: data.type || '',
    link: data.link || '',
    startDate: data.startDate || '',
    description: data.description || ''
  };
  if (!state.projects) state.projects = [];
  state.projects.push(entry);
  const pFields = document.getElementById('projFields');
  if (pFields) pFields.appendChild(div);
  div.querySelectorAll('input,textarea').forEach(el => {
    el.addEventListener('input', () => { syncBlock(id, 'project', div); renderAll(); });
  });
}

// ── SYNC BLOCK ──
function syncBlock(id, type, div) {
  let arr;
  if (type === 'experience') arr = state.experience;
  else if (type === 'project') arr = state.projects;
  else arr = state.education;

  const item = arr.find(e => e._id === id);
  if (!item) return;
  div.querySelectorAll('[data-key]').forEach(el => {
    item[el.dataset.key] = el.value.trim();
  });
}

function removeBlock(id, type) {
  const el = document.getElementById(id);
  if (el) el.remove();
  if (type === 'experience') {
    state.experience = state.experience.filter(e => e._id !== id);
  } else if (type === 'project') {
    state.projects = state.projects.filter(e => e._id !== id);
  } else {
    state.education = state.education.filter(e => e._id !== id);
  }
  renderAll();
}

// ══════════════════════════════════════════════════════
//  RESIZABLE DIVIDER
// ══════════════════════════════════════════════════════
const divider   = document.getElementById('divider');
const formPanel = document.getElementById('formPanel');
let isDragging  = false;

divider.addEventListener('mousedown', () => {
  isDragging = true;
  divider.classList.add('dragging');
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const container = document.querySelector('.split-screen');
  const rect = container.getBoundingClientRect();
  const newWidth = e.clientX - rect.left;
  const clamped = Math.min(Math.max(newWidth, 260), rect.width - 300);
  formPanel.style.width = clamped + 'px';
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  divider.classList.remove('dragging');
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
});

// ══════════════════════════════════════════════════════
//  HEADER BUTTONS
// ══════════════════════════════════════════════════════
document.getElementById('btnBack').addEventListener('click', () => {
  window.location.href = 'form-index.html';
});

// ── PDF DOWNLOAD ──
const btnDownload   = document.getElementById('btnDownload');
const pdfOverlay    = document.getElementById('pdfOverlay');
const pdfOverlaySub = document.getElementById('pdfOverlaySub');
const pdfProgressFill = document.getElementById('pdfProgressFill');

btnDownload.addEventListener('click', downloadPDF);

async function downloadPDF() {
  if (btnDownload.disabled) return;

  const sheet = document.getElementById(`tpl-${activeTemplate}`);
  if (!sheet) return;

  setDownloadLoading(true);
  showOverlay('Preparing resume…', 5);

  try {
    await delay(120);
    setOverlaySub('Building ATS-compatible vector PDF…', 35);
    await delay(100);

    let pdf;
    if (typeof renderPDFFromState === 'function') {
      pdf = renderPDFFromState(state, activeTemplate);
    } else {
      throw new Error('PDF text renderer not available');
    }

    setOverlaySub('Finalizing document…', 75);
    await delay(80);

    setOverlaySub('Saving file…', 92);
    await delay(80);

    const name = [
      document.getElementById('p_firstName')?.value.trim(),
      document.getElementById('p_lastName')?.value.trim()
    ].filter(Boolean).join('_') || 'Resume';

    const templateLabel = activeTemplate.charAt(0).toUpperCase() + activeTemplate.slice(1);
    pdf.save(`${name}_Resume_${templateLabel}.pdf`);

    setOverlaySub('Done! ✓', 100);
    await delay(600);

    setDownloadSuccess();

    // Trigger Viral Share & Referral Modal
    setTimeout(() => {
      openViralModal();
    }, 400);

  } catch (err) {
    console.error('PDF export error:', err);
    setOverlaySub('Something went wrong. Try again.', 0);
    await delay(1800);
    setDownloadLoading(false);
  } finally {
    hideOverlay();
  }
}

function setDownloadLoading(on) {
  btnDownload.disabled = on;
  btnDownload.classList.toggle('loading', on);
  btnDownload.classList.remove('success');
  if (on) {
    btnDownload.querySelector('.btn-download-label').textContent = 'Generating…';
  } else {
    btnDownload.querySelector('.btn-download-label').textContent = 'Download PDF';
  }
}

function setDownloadSuccess() {
  btnDownload.disabled = false;
  btnDownload.classList.remove('loading');
  btnDownload.classList.add('success');
  btnDownload.querySelector('.btn-download-label').textContent = 'Downloaded ✓';
  setTimeout(() => {
    btnDownload.classList.remove('success');
    btnDownload.querySelector('.btn-download-label').textContent = 'Download PDF';
  }, 2800);
}

function showOverlay(msg, progress) {
  pdfOverlay.classList.add('visible');
  pdfOverlay.setAttribute('aria-hidden', 'false');
  setOverlaySub(msg, progress);
}

function setOverlaySub(msg, progress) {
  pdfOverlaySub.textContent = msg;
  pdfProgressFill.style.width = progress + '%';
}

function hideOverlay() {
  pdfOverlay.classList.remove('visible');
  pdfOverlay.setAttribute('aria-hidden', 'true');
  pdfProgressFill.style.width = '0%';
  setDownloadLoading(false);
}

function getTemplateBackground(tpl) {
  if (tpl === 'classic') return '#ffffff';
  if (tpl === 'modern')  return '#ffffff';
  if (tpl === 'minimal') return '#faf9f7';
  return '#ffffff';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ══════════════════════════════════════════════════════
//  COVER LETTER GENERATION
// ══════════════════════════════════════════════════════
const btnGenerateCL   = document.getElementById('btnGenerateCL');
const clOutput        = document.getElementById('coverLetterOutput');
const clTargetRole    = document.getElementById('cl_targetRole');
const clJobDesc       = document.getElementById('cl_jobDescription');
const clTone          = document.getElementById('cl_tone');
const btnCopyCL       = document.getElementById('btnCopyCL');

if (btnGenerateCL) {
  btnGenerateCL.addEventListener('click', generateCoverLetter);
}

if (clJobDesc) {
  clJobDesc.addEventListener('input', () => { updateLiveATSReadiness(); });
}

if (btnCopyCL) {
  btnCopyCL.addEventListener('click', () => {
    const text = clOutput?.innerText || '';
    if (!text || clOutput.classList.contains('placeholder')) return;
    navigator.clipboard.writeText(text).then(() => {
      btnCopyCL.textContent = 'Copied ✓';
      setTimeout(() => { btnCopyCL.textContent = 'Copy'; }, 2000);
    });
  });
}

async function generateCoverLetter() {
  if (!btnGenerateCL || btnGenerateCL.disabled) return;

  const targetRole    = clTargetRole?.value.trim()  || '';
  const jobDescription = clJobDesc?.value.trim()    || '';

  if (!targetRole || !jobDescription) {
    showCLError('Please fill in both Target Role and Job Description.');
    return;
  }

  syncPersonal();

  const payload = {
    personal: {
      firstName : state.personal.firstName,
      lastName  : state.personal.lastName,
      jobTitle  : state.personal.title,       // backend expects 'jobTitle'
      summary   : state.personal.summary,
    },
    experience  : state.experience,
    education   : state.education,
    skills      : state.skills,
    jobDescription: {
      targetRole,
      jobDescription,
    },
    tone: clTone?.value || 'professional',
  };

  setCLLoading(true);
  clearCLError();

  try {
    let coverLetterText = '';
    
    // Try primary backend endpoint on port 5000 or relative path
    try {
      const apiUrl = (window.location.port === '5000') ? '/api/generate' : 'http://localhost:5000/api/generate';
      const res = await fetch(apiUrl, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      });

      if (res.ok) {
        const raw = await res.text();
        if (raw && raw.trim()) {
          const data = JSON.parse(raw);
          if (data && data.success && data.coverLetter) {
            coverLetterText = data.coverLetter;
          }
        }
      }
    } catch (networkErr) {
      console.warn('Backend server on port 5000 not reachable, using generative fallback:', networkErr);
    }

    // Client fallback synthesis if backend is offline or static server returned 405
    if (!coverLetterText) {
      const name = [payload.personal?.firstName, payload.personal?.lastName].filter(Boolean).join(' ') || 'Job Applicant';
      const role = payload.jobDescription?.targetRole || payload.personal?.jobTitle || 'Target Role';
      const expStr = (payload.experience || []).map(e => `${e.role} at ${e.company} (${e.description || ''})`).join('; ');
      const techStr = (payload.skills?.tech || []).join(', ');
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      let intro = `I am writing to express my strong enthusiasm for the ${role} opening. With proven experience across ${techStr || 'scalable technologies and product execution'}, I am eager to contribute immediately to your team.`;
      let body = expStr 
        ? `Throughout my career, I have focused on driving measurable outcomes: ${expStr}. My background has prepared me to tackle complex challenges and collaborate effectively across cross-functional teams.`
        : `My professional background combines technical problem solving, structured execution, and strategic communication. I take deep ownership in translating complex goals into high-quality deliverables.`;
      let closing = `I would welcome the opportunity to discuss how my skill set aligns with the upcoming goals of your team. Thank you for your time and consideration.\n\nSincerely,\n${name}`;

      coverLetterText = `${today}\n\nDear Hiring Team,\n\n${intro}\n\n${body}\n\n${closing}`;
    }

    showCLResult(coverLetterText);

  } catch (err) {
    console.error('Cover letter generation error:', err);
    showCLError(err.message || 'Something went wrong. Make sure the backend server is running.');
  } finally {
    setCLLoading(false);
  }
}

function setCLLoading(on) {
  if (!btnGenerateCL) return;
  btnGenerateCL.disabled = on;
  btnGenerateCL.classList.toggle('loading', on);
  btnGenerateCL.textContent = on ? 'Generating…' : 'Generate Cover Letter';
}

function showCLResult(text) {
  if (!clOutput) return;
  clOutput.classList.remove('placeholder', 'error');
  clOutput.classList.add('result');
  clOutput.innerText = text;
  if (btnCopyCL) btnCopyCL.style.display = 'inline-flex';
}

function showCLError(msg) {
  if (!clOutput) return;
  clOutput.classList.remove('placeholder', 'result');
  clOutput.classList.add('error');
  clOutput.innerText = msg;
  if (btnCopyCL) btnCopyCL.style.display = 'none';
}

function clearCLError() {
  if (!clOutput) return;
  clOutput.classList.remove('error');
  if (!clOutput.classList.contains('result')) {
    clOutput.classList.add('placeholder');
    clOutput.innerText = 'Your generated cover letter will appear here…';
    if (btnCopyCL) btnCopyCL.style.display = 'none';
  }
}

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function esc(str) {
  if (!str) return '';
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function parseSkill(str) {
  if (!str) return { name: '', level: '' };
  const trimmed = str.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (parenMatch) return { name: parenMatch[1].trim(), level: parenMatch[2].trim() };
  const dashMatch = trimmed.match(/^(.+?)\s*[-:]\s*(beginner|intermediate|advanced|expert|proficient|senior|lead|mid|entry)$/i);
  if (dashMatch) return { name: dashMatch[1].trim(), level: dashMatch[2].trim() };
  return { name: trimmed, level: '' };
}

function safeRenderRichText(str) {
  if (!str) return '';
  if (/<(span|b|i|u|strong|em)\b[^>]*>/i.test(str)) {
    return str;
  }
  return esc(str);
}

function setTextEmpty(id, value, placeholder, editPath) {
  const el = document.getElementById(id);
  if (!el) return;
  if (document.activeElement !== el) {
    if (value && /<(span|b|i|u|strong|em)\b/i.test(value)) {
      el.innerHTML = value;
    } else {
      el.textContent = value || placeholder;
    }
  }
  el.classList.toggle('empty', !value);
  el.setAttribute('data-canva-editable', 'true');
  if (editPath) el.dataset.editPath = editPath;
}

const JUNK_SKILL_RE = /^(?:technical(?:\s+skills?)?|soft(?:\s+skills?)?|core(?:\s+skills?)?|skills?|technologies|tools|languages?|spoken\s+languages?|programming\s+languages?|intermediate|\(?intermediate\)?|\(?proficient\)?|\(?expert\)?|\(?advanced\)?|\(?beginner\)?|foundations?|competencies)$/i;

// Returns array of {name, level, full} objects - preserving original strings
function cleanSkillListObjects(tags) {
  if (!tags || !tags.length) return [];
  const seen = new Set();
  const cleaned = [];

  tags.forEach(t => {
    if (!t) return;
    let s = String(t).trim();
    const parsed = parseSkill(s);
    let base = (parsed && parsed.name ? parsed.name : s).trim();
    base = base.replace(/^[\(\[\{]+|[\)\]\}]+$/g, '').trim();
    if (!base || base.length < 2) return;
    if (JUNK_SKILL_RE.test(base)) return;

    const lower = base.toLowerCase();
    if (seen.has(lower)) return;
    seen.add(lower);
    cleaned.push({ name: base, level: parsed.level || '', full: s });
  });

  return cleaned;
}

// Legacy: returns array of base names (for backwards compat)
function cleanSkillList(tags) {
  return cleanSkillListObjects(tags).map(o => o.full || o.name);
}

function renderSkillTags(containerId, tags, tagClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const items = cleanSkillListObjects(tags);
  if (!items.length) {
    el.innerHTML = '<span style="font-size:11px;opacity:0.35;font-style:italic">Not specified</span>';
    return;
  }
  const typeKey = containerId.toLowerCase().includes('soft') ? 'soft' : containerId.toLowerCase().includes('lang') ? 'languages' : 'tech';
  el.innerHTML = items.map(({ name, level, full }, idx) => {
    const levelBadge = level ? `<span class="skill-level-badge">${esc(level)}</span>` : '';
    return `<span class="${tagClass}" data-canva-editable="true" data-edit-type="skill" data-skill-type="${typeKey}" data-skill-idx="${idx}" title="${esc(full || name)}"><span class="skill-name">${esc(name)}</span>${levelBadge}</span>`;
  }).join('');
}

// ══════════════════════════════════════════════════════
//  LOAD FROM localStorage (data handoff from form page)
// ══════════════════════════════════════════════════════
const DEFAULT_SAMPLE_RESUME = {
  personal: {
    firstName: 'Alex',
    lastName: 'Carter',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.carter@example.com',
    phone: '+1 (555) 382-9102',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexcarter',
    summary: 'Innovative Full Stack Engineer with 5+ years of experience architecting high-throughput cloud applications, microservices, and interactive web products. Proven track record of scaling platforms to 2M+ active users and reducing p99 latency by 35%.'
  },
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Stripe',
      startDate: 'Jan 2022',
      endDate: 'Present',
      description: 'Architected and deployed high-throughput payment microservices handling 15M daily transactions with 99.99% uptime. Spearheaded migration to event-driven worker pools, cutting checkout latency by 35%.'
    },
    {
      role: 'Full Stack Developer',
      company: 'CloudFlow Tech',
      startDate: 'Mar 2020',
      endDate: 'Dec 2021',
      description: 'Engineered responsive client dashboards with React and Node.js serving 200,000 monthly active users. Designed automated CI/CD deployment pipelines on AWS reducing deploy cycle times by 50%.'
    }
  ],
  projects: [
    {
      name: 'AI Document Intelligence Suite',
      type: 'Production App',
      link: 'https://github.com/alexcarter/doc-ai',
      startDate: '2023',
      endDate: '2024',
      description: 'Engineered multimodal document parsing pipeline extracting tabular data from complex financial PDFs with 96% accuracy.'
    },
    {
      name: 'Real-Time Collaborative Whiteboard',
      type: 'Open Source',
      link: 'https://github.com/alexcarter/canvas-collab',
      startDate: '2022',
      endDate: '2023',
      description: 'Built low-latency vector canvas supporting 100+ concurrent collaborators with operational transformation conflict resolution.'
    }
  ],
  education: [
    {
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      startYear: '2016',
      endYear: '2020',
      details: 'GPA: 3.88 / 4.0 with First Class Honors. Dean\'s Honors List (4 consecutive years).'
    }
  ],
  skills: {
    tech: ['React (Expert)', 'Node.js (Expert)', 'TypeScript (Advanced)', 'Python (Advanced)', 'Docker (Advanced)', 'AWS (Advanced)', 'PostgreSQL (Advanced)', 'GraphQL (Intermediate)'],
    soft: ['System Architecture', 'Technical Leadership', 'Agile & Scrum', 'Cross-functional Collaboration'],
    languages: ['English (Native)', 'Spanish (Conversational)']
  }
};

function loadFromStorage() {
  let saved;
  try {
    const raw = localStorage.getItem('resumatic_state');
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  const isEssentiallyEmpty = !saved || (
    (!saved.experience || saved.experience.length === 0) &&
    (!saved.education || saved.education.length === 0) &&
    (!saved.skills?.tech || saved.skills.tech.length === 0) &&
    (!saved.personal?.email)
  );

  if (isEssentiallyEmpty) {
    saved = DEFAULT_SAMPLE_RESUME;
  }

  // ── Personal fields ──
  // form-script uses 'jobTitle'; preview uses 'p_title'
  const p = saved.personal || {};
  const fieldMap = {
    firstName : 'p_firstName',
    lastName  : 'p_lastName',
    jobTitle  : 'p_title',
    email     : 'p_email',
    phone     : 'p_phone',
    location  : 'p_location',
    linkedin  : 'p_linkedin',
    summary   : 'p_summary',
  };
  Object.entries(fieldMap).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el && p[key]) el.value = p[key].replace(/<[^>]+>/g, '');
  });

  // ── Skills (comma-join arrays into the text inputs) ──
  const sk = saved.skills || {};
  const skillMap = { tech: 'p_techSkills', soft: 'p_softSkills' };
  Object.entries(skillMap).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el && sk[key] && sk[key].length) {
      const cleanList = cleanSkillList(sk[key]);
      el.value = cleanList.join(', ');
      if (state.skills) state.skills[key] = cleanList;
    }
  });

  // -- Language Proficiency (structured data or migrate from legacy) --
  const savedLang = saved.langProficiency;
  const legacyLang = sk.languages;
  if (savedLang && savedLang.length) {
    state.langProficiency = savedLang;
  } else if (legacyLang && legacyLang.length) {
    state.langProficiency = legacyLang.map(function(raw) {
      var m = (raw || '').match(/^(.+?)\s*\(([^)]+)\)$/);
      return m ? { name: m[1].trim(), overall: m[2].trim(), speaking: '', reading: '', writing: '' } : { name: raw.trim(), overall: '', speaking: '', reading: '', writing: '' };
    });
  }
  setTimeout(function() { if (typeof renderLangProficiencyWidget === 'function') renderLangProficiencyWidget(); }, 50);

  // ── Experience blocks ──
  (saved.experience || []).forEach(e => addExpBlock(e));

  // ── Project blocks ──
  (saved.projects || []).forEach(p => addProjBlock(p));

  // ── Education blocks ──
  (saved.education || []).forEach(e => addEduBlock(e));
}

// ══════════════════════════════════════════════════════
//  VIRAL POST-DOWNLOAD MODAL & SHARE HANDLERS
// ══════════════════════════════════════════════════════
const viralModal        = document.getElementById('viralModal');
const btnCloseViralModal= document.getElementById('btnCloseViralModal');
const btnSendBackup     = document.getElementById('btnSendBackup');
const backupEmailInput  = document.getElementById('backupEmailInput');
const backupFeedback    = document.getElementById('backupFeedback');
const btnCopyShareLink  = document.getElementById('btnCopyShareLink');
const shareableLinkInput= document.getElementById('shareableLinkInput');
const btnShareLinkedIn  = document.getElementById('btnShareLinkedIn');
const btnShareTwitter   = document.getElementById('btnShareTwitter');
const btnCopyRefCode    = document.getElementById('btnCopyRefCode');
const referralCodeInput = document.getElementById('referralCodeInput');

function openViralModal() {
  if (!viralModal) return;
  
  // Update shareable link with user's name if available
  const fName = document.getElementById('p_firstName')?.value.trim() || 'user';
  const lName = document.getElementById('p_lastName')?.value.trim() || '';
  const slug = `${fName}-${lName}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  if (shareableLinkInput) {
    shareableLinkInput.value = `${window.location.origin}/r.html?id=${slug}`;
  }
  if (referralCodeInput) {
    referralCodeInput.value = `https://resumatic.ai/?ref=${fName.toUpperCase()}_PRO`;
  }

  viralModal.classList.add('visible');
  viralModal.setAttribute('aria-hidden', 'false');
}

function closeViralModal() {
  if (!viralModal) return;
  viralModal.classList.remove('visible');
  viralModal.setAttribute('aria-hidden', 'true');
}

if (btnCloseViralModal) btnCloseViralModal.addEventListener('click', closeViralModal);

// Close on backdrop click
if (viralModal) {
  viralModal.addEventListener('click', (e) => {
    if (e.target === viralModal) closeViralModal();
  });
}

// Email Backup Handler
if (btnSendBackup) {
  btnSendBackup.addEventListener('click', () => {
    const email = backupEmailInput?.value.trim();
    if (!email || !/@/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    btnSendBackup.disabled = true;
    btnSendBackup.textContent = 'Sending…';
    
    setTimeout(() => {
      // Save to localStorage for demo
      try {
        localStorage.setItem('resumatic_lead_email', email);
      } catch(e) {}
      
      btnSendBackup.textContent = 'Sent ✓';
      if (backupFeedback) {
        backupFeedback.style.display = 'block';
        backupFeedback.textContent = `✅ Backup and 2025 Interview Guide sent to ${email}!`;
      }
    }, 600);
  });
}

// Copy Share Link
if (btnCopyShareLink) {
  btnCopyShareLink.addEventListener('click', () => {
    const link = shareableLinkInput?.value || window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      btnCopyShareLink.textContent = 'Copied ✓';
      setTimeout(() => { btnCopyShareLink.textContent = 'Copy'; }, 2000);
    });
  });
}

// Share on LinkedIn
if (btnShareLinkedIn) {
  btnShareLinkedIn.addEventListener('click', () => {
    const shareUrl = encodeURIComponent('https://resumatic.ai');
    const text = encodeURIComponent("Just revamped my resume with @Resumatic AI! Check out their ATS-certified builder and generate tailored cover letters in seconds:");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
  });
}

// Share on Twitter/X
if (btnShareTwitter) {
  btnShareTwitter.addEventListener('click', () => {
    const text = encodeURIComponent("Just built my ATS-optimized resume in under 2 minutes with @ResumaticAI! 🔥 Generate tailored resumes and cover letters for free:");
    const url = encodeURIComponent('https://resumatic.ai');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  });
}

// Copy Referral Code
if (btnCopyRefCode) {
  btnCopyRefCode.addEventListener('click', () => {
    const refLink = referralCodeInput?.value || 'https://resumatic.ai/?ref=PRO_INVITE';
    navigator.clipboard.writeText(refLink).then(() => {
      btnCopyRefCode.textContent = 'Invite Copied ✓';
      setTimeout(() => { btnCopyRefCode.textContent = 'Copy Invite'; }, 2000);
    });
  });
}



function makeResumeEditable() {
  const sheets = document.querySelectorAll('.resume-sheet');
  sheets.forEach(sheet => {
    sheet.setAttribute('contenteditable', 'false');
  });

  const editables = document.querySelectorAll('#previewPanel [data-canva-editable="true"]');
  editables.forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
  });

  // Make all section titles directly editable like Canva
  document.querySelectorAll('#previewPanel .cl-section-title, #previewPanel .mo-section-title, #previewPanel .mn-section-title').forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('data-canva-editable', 'true');
  });
}

function initCanvaLiveEditor() {
  const previewPanel = document.getElementById('previewPanel');
  if (!previewPanel) return;

  makeResumeEditable();

  // Prevent newlines in single-line items like name, title, contact, date, skills
  previewPanel.addEventListener('keydown', (e) => {
    const target = e.target.closest('[data-canva-editable="true"]');
    if (!target) return;
    const isMultiLine = target.classList.contains('cl-summary') || 
                        target.classList.contains('mo-summary') || 
                        target.classList.contains('mn-summary') || 
                        target.classList.contains('cl-entry-desc') || 
                        target.classList.contains('mo-entry-desc') || 
                        target.classList.contains('mn-entry-desc');
    if (e.key === 'Enter' && !isMultiLine) {
      e.preventDefault();
      target.blur();
    }
  });

  // Handle direct typing in the preview
  previewPanel.addEventListener('input', (e) => {
    const target = e.target.closest('[data-canva-editable="true"]');
    if (!target) return;

    const path = target.dataset.editPath;
    const text = target.innerText.trim();

    if (target.dataset.editType === 'skill') {
      const type = target.dataset.skillType || 'tech';
      const idx = parseInt(target.dataset.skillIdx, 10);
      if (state.skills[type] && !isNaN(idx)) {
        state.skills[type][idx] = text;
        const inputId = type === 'tech' ? 'p_techSkills' : type === 'soft' ? 'p_softSkills' : 'p_languages';
        const inp = document.getElementById(inputId);
        if (inp) inp.value = state.skills[type].join(', ');
      }
    } else if (path) {
      handlePathUpdate(path, text, target);
    }

    try {
      localStorage.setItem('resumatic_state', JSON.stringify(state));
    } catch(err) {}

    updateLiveATSReadiness();
  });

  previewPanel.addEventListener('blur', (e) => {
    const target = e.target.closest('[data-canva-editable="true"]');
    if (!target) return;
    updateSkillEnhancerUI();
  }, true);
}

function handlePathUpdate(path, text, target) {
  const parts = path.split('.');
  if (parts[0] === 'personal') {
    const key = parts[1];
    if (key === 'name') {
      const cleanText = text.replace(/<[^>]+>/g, '').trim();
      const nameParts = cleanText.split(/\s+/).filter(Boolean);
      state.personal.firstName = nameParts[0] || '';
      state.personal.lastName = nameParts.slice(1).join(' ') || '';
      const fnInp = document.getElementById('p_firstName');
      const lnInp = document.getElementById('p_lastName');
      if (fnInp) fnInp.value = state.personal.firstName;
      if (lnInp) lnInp.value = state.personal.lastName;

      ['cl_name', 'mo_name', 'mo_main_name', 'mn_name'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== target) {
          if (/<(span|b|i|u|strong|em)\b/i.test(text)) {
            el.innerHTML = text;
          } else {
            el.textContent = text || 'Your Name';
          }
        }
      });
      const avi = document.getElementById('mo_initials');
      if (avi) avi.textContent = [state.personal.firstName, state.personal.lastName].filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?';
    } else if (key === 'title') {
      state.personal.title = text;
      const tInp = document.getElementById('p_title');
      if (tInp) tInp.value = text;
      ['cl_title', 'mo_title', 'mo_main_title', 'mn_title'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== target) el.textContent = text || 'Professional Title';
      });
    } else if (key === 'summary') {
      state.personal.summary = text;
      const sInp = document.getElementById('p_summary');
      if (sInp) sInp.value = text;
      ['cl_summary', 'mo_summary', 'mn_summary'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== target) el.textContent = text || 'Your professional summary will appear here.';
      });
    } else {
      state.personal[key] = text;
      const cInp = document.getElementById(`p_${key}`);
      if (cInp) cInp.value = text;
    }
  } else if (parts[0] === 'experience') {
    const idx = parseInt(parts[1], 10);
    const field = parts[2];
    if (state.experience[idx]) {
      if (field === 'dates') {
        const dparts = text.split(/[–—-]/).map(s => s.trim());
        state.experience[idx].startDate = dparts[0] || '';
        state.experience[idx].endDate = dparts[1] || '';
      } else {
        state.experience[idx][field] = text;
      }
      const block = document.querySelectorAll('#expFields .entry-block')[idx];
      if (block) {
        if (field === 'role') block.querySelector('[data-key="role"]')?.setAttribute('value', text);
        if (field === 'company') block.querySelector('[data-key="company"]')?.setAttribute('value', text);
        if (field === 'description') {
          const ta = block.querySelector('[data-key="description"]');
          if (ta) ta.value = text;
        }
      }
    }
  } else if (parts[0] === 'projects') {
    const idx = parseInt(parts[1], 10);
    const field = parts[2];
    if (state.projects[idx]) {
      state.projects[idx][field] = text;
      const block = document.querySelectorAll('#projFields .entry-block')[idx];
      if (block) {
        if (field === 'name') block.querySelector('[data-key="name"]')?.setAttribute('value', text);
        if (field === 'description') {
          const ta = block.querySelector('[data-key="description"]');
          if (ta) ta.value = text;
        }
      }
    }
  } else if (parts[0] === 'education') {
    const idx = parseInt(parts[1], 10);
    const field = parts[2];
    if (state.education[idx]) {
      if (field === 'dates') {
        const dparts = text.split(/[–—-]/).map(s => s.trim());
        state.education[idx].startYear = dparts[0] || '';
        state.education[idx].endYear = dparts[1] || '';
      } else {
        state.education[idx][field] = text;
      }
      const block = document.querySelectorAll('#eduFields .entry-block')[idx];
      if (block) {
        if (field === 'degree') block.querySelector('[data-key="degree"]')?.setAttribute('value', text);
        if (field === 'institution') block.querySelector('[data-key="institution"]')?.setAttribute('value', text);
      }
    }
  }
}

// ══════════════════════════════════════════════════════
// LANGUAGE PROFICIENCY WIDGET CONTROLLER
// ==============================================
const LANG_OVERALL_LEVELS  = ['Native', 'Proficient', 'Workable', 'Beginner'];
const LANG_SKILL_LEVELS    = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];

function renderLangProficiencyWidget() {
  var container = document.getElementById('langProfContainer');
  if (!container) return;
  var langs = state.langProficiency || [];
  if (!langs.length) {
    container.innerHTML = '<div class="lpw-empty">No languages added. Click \u201C+ Add Language\u201D below.</div>';
    return;
  }
  function overallOpts(cur) {
    return LANG_OVERALL_LEVELS.map(function(l) {
      return '<option value="' + l + '"' + (cur === l ? ' selected' : '') + '>' + l + '</option>';
    }).join('');
  }
  function skillOpts(cur) {
    return [''].concat(LANG_SKILL_LEVELS).map(function(l) {
      return '<option value="' + l + '"' + (cur === l ? ' selected' : '') + '>' + (l || '\u2014 Not set') + '</option>';
    }).join('');
  }
  container.innerHTML = langs.map(function(lp, i) {
    return '<div class="lpw-row" data-lpidx="' + i + '">' +
      '<div class="lpw-lang-name">' +
        '<input type="text" class="lpw-name-input" placeholder="Language (e.g. Hindi)" value="' + esc(lp.name || '') + '" oninput="updateLangField(' + i + ',\'name\',this.value)" />' +
        '<button type="button" class="lpw-remove-btn" onclick="removeLang(' + i + ')" title="Remove">\u00D7</button>' +
      '</div>' +
      '<div class="lpw-levels">' +
        '<div class="lpw-field"><label class="lpw-label">Overall</label>' +
          '<select class="lpw-select lpw-select-overall" onchange="updateLangField(' + i + ',\'overall\',this.value)">' +
            '<option value="">\u2014 Level</option>' + overallOpts(lp.overall) +
          '</select></div>' +
        '<div class="lpw-field"><label class="lpw-label">Speaking</label>' +
          '<select class="lpw-select" onchange="updateLangField(' + i + ',\'speaking\',this.value)">' + skillOpts(lp.speaking) + '</select></div>' +
        '<div class="lpw-field"><label class="lpw-label">Reading</label>' +
          '<select class="lpw-select" onchange="updateLangField(' + i + ',\'reading\',this.value)">' + skillOpts(lp.reading) + '</select></div>' +
        '<div class="lpw-field"><label class="lpw-label">Writing</label>' +
          '<select class="lpw-select" onchange="updateLangField(' + i + ',\'writing\',this.value)">' + skillOpts(lp.writing) + '</select></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

window.updateLangField = function(idx, field, value) {
  if (!state.langProficiency[idx]) return;
  state.langProficiency[idx][field] = value;
  renderAll();
  try { localStorage.setItem('resumatic_state', JSON.stringify(state)); } catch(e) {}
};

window.removeLang = function(idx) {
  state.langProficiency.splice(idx, 1);
  renderLangProficiencyWidget();
  renderAll();
  try { localStorage.setItem('resumatic_state', JSON.stringify(state)); } catch(e) {}
};

window.addLanguage = function() {
  state.langProficiency.push({ name: '', overall: '', speaking: '', reading: '', writing: '' });
  renderLangProficiencyWidget();
  var container = document.getElementById('langProfContainer');
  if (container) {
    var inputs = container.querySelectorAll('.lpw-name-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }
  try { localStorage.setItem('resumatic_state', JSON.stringify(state)); } catch(e) {}
};

// PAGE OVERFLOW DETECTOR
// ==============================================
var _pageOverflowThrottle = null;
function checkPageOverflow() {
  if (_pageOverflowThrottle) clearTimeout(_pageOverflowThrottle);
  _pageOverflowThrottle = setTimeout(_doCheckPageOverflow, 400);
}
function _doCheckPageOverflow() {
  var A4_HEIGHT = 1050;
  var WARN_HEIGHT = 950;
  var banner = document.getElementById('pageOverflowBanner');
  if (!banner) return;
  var sheet = document.querySelector('.resume-sheet.active-template');
  if (!sheet) { banner.style.display = 'none'; return; }
  var h = sheet.scrollHeight;
  if (h > A4_HEIGHT) {
    var pct = Math.round((h / A4_HEIGHT - 1) * 100);
    banner.className = 'page-overflow-banner pob-danger';
    banner.style.display = 'flex';
    banner.innerHTML = '<span class="pob-icon">\uD83D\uDCC4</span><div class="pob-content"><strong>Resume spills onto page 2 (+' + pct + '%)</strong> \u2014 Recruiters strongly prefer 1-page resumes. Try shorter bullets, fewer projects, or smaller font size in Editor Canvas. <button class="pob-tips-btn" onclick="document.getElementById(\'singlePageTipsModal\').classList.add(\'visible\')">Quick Tips \u2192</button></div><button class="pob-close" onclick="this.parentElement.style.display=\'none\'">\u00D7</button>';
  } else if (h > WARN_HEIGHT) {
    banner.className = 'page-overflow-banner pob-warn';
    banner.style.display = 'flex';
    banner.innerHTML = '<span class="pob-icon">\u26A0\uFE0F</span><div class="pob-content"><strong>Approaching 1-page limit</strong> \u2014 ' + (A4_HEIGHT - h) + 'px remaining. Keep content focused for a clean single-page resume. <button class="pob-tips-btn" onclick="document.getElementById(\'singlePageTipsModal\').classList.add(\'visible\')">Tips \u2192</button></div><button class="pob-close" onclick="this.parentElement.style.display=\'none\'">\u00D7</button>';
  } else {
    banner.style.display = 'none';
  }
}

//  SKILL PROFICIENCY ENHANCER CONTROLLER
// ══════════════════════════════════════════════════════
function initSkillEnhancer() {
  const btnAuto = document.getElementById('btnAutoProficiency');
  if (btnAuto) {
    btnAuto.addEventListener('click', autoAssignAllProficiencies);
  }
  updateSkillEnhancerUI();
}

function updateSkillEnhancerUI() {
  const container = document.getElementById('sebSkillChips');
  if (!container) return;
  const input = document.getElementById('p_techSkills');
  if (input && input.value.trim()) {
    state.skills.tech = input.value.split(',').map(s => s.trim()).filter(Boolean);
  }
  const techSkills = state.skills.tech || [];
  if (!techSkills.length) {
    container.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Add technical skills above to configure proficiencies.</span>`;
    return;
  }

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  // Normalize legacy levels (e.g. 'Proficient' => 'Intermediate')
  const normLevel = (lvl) => {
    if (!lvl) return '';
    const l = lvl.toLowerCase();
    if (l === 'proficient') return 'Intermediate';
    if (l === 'senior' || l === 'lead') return 'Expert';
    if (l === 'mid') return 'Intermediate';
    if (l === 'entry') return 'Beginner';
    return levels.find(lv => lv.toLowerCase() === l) || '';
  };
  container.innerHTML = techSkills.map((raw, idx) => {
    const { name, level } = parseSkill(raw);
    const currLevel = normLevel(level);
    return `
      <div class="seb-chip">
        <span style="font-weight:600;">${esc(name)}</span>
        <select onchange="changeSkillProficiency(${idx}, this.value)">
          <option value="" ${!currLevel ? 'selected' : ''}>+ Level</option>
          ${levels.map(lvl => `<option value="${lvl}" ${currLevel === lvl ? 'selected' : ''}>${lvl}</option>`).join('')}
        </select>
      </div>`;
  }).join('');
}

window.changeSkillProficiency = function(idx, newLevel) {
  const input = document.getElementById('p_techSkills');
  if (input && input.value.trim()) {
    state.skills.tech = input.value.split(',').map(s => s.trim()).filter(Boolean);
  }
  const raw = state.skills.tech[idx];
  if (!raw) return;
  const { name } = parseSkill(raw);
  const updated = newLevel ? `${name} (${newLevel})` : name;
  state.skills.tech[idx] = updated;
  if (input) input.value = state.skills.tech.join(', ');

  renderAll();
  updateSkillEnhancerUI();
  try { localStorage.setItem('resumatic_state', JSON.stringify(state)); } catch(e) {}
};

function autoAssignAllProficiencies() {
  const input = document.getElementById('p_techSkills');
  if (input && input.value.trim()) {
    state.skills.tech = input.value.split(',').map(s => s.trim()).filter(Boolean);
  }
  const techSkills = state.skills.tech || [];
  if (!techSkills.length) {
    alert('Please enter some technical skills first.');
    return;
  }
  // Smart level assignment using only standard dropdown-compatible levels
  // Skills that already have a valid standard level are preserved
  const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const smartLevels = ['Expert', 'Expert', 'Advanced', 'Advanced', 'Intermediate'];
  const assigned = techSkills.map((raw, idx) => {
    const { name, level } = parseSkill(raw);
    const hasValidLevel = level && validLevels.includes(level.toLowerCase());
    if (hasValidLevel) return raw; // Already has a valid standard level — keep it
    // Assign a smart level based on position in the skill list
    const assignedLevel = smartLevels[idx] || 'Intermediate';
    return `${name} (${assignedLevel})`;
  });
  state.skills.tech = assigned;
  if (input) input.value = assigned.join(', ');

  renderAll();
  updateSkillEnhancerUI();
  try { localStorage.setItem('resumatic_state', JSON.stringify(state)); } catch(e) {}
}

// ══════════════════════════════════════════════════
//  DEDICATED EDITOR CANVAS & ELEMENT SELECTION ENGINE
//  Dual Selection: Character-Level Text Highlighting + Element-Level Selection
// ══════════════════════════════════════════════════
let currentViewMode = 'preview'; // 'preview' | 'editor'
let activeSelectedElement = null; // Currently clicked DOM element on canvas
let activeSelectedEntry = null;   // Currently focused entry block (e.g. project or experience item)
let savedSelectionRange = null;   // Saved DOM Range for highlighted text

// ── 1. VIEW MODE SWITCHER (Preview vs Editor Canvas) ──
function initViewModeSwitcher() {
  const btnPrev = document.getElementById('btnModePreview');
  const btnEdit = document.getElementById('btnModeEditor');
  const splitScreen = document.querySelector('.split-screen');
  const editorHeader = document.getElementById('editorCanvasHeader');

  function setMode(mode) {
    currentViewMode = mode;
    if (mode === 'editor') {
      if (splitScreen) splitScreen.classList.add('mode-editor-active');
      if (btnEdit) { btnEdit.classList.add('active'); btnEdit.setAttribute('aria-selected', 'true'); }
      if (btnPrev) { btnPrev.classList.remove('active'); btnPrev.setAttribute('aria-selected', 'false'); }
      if (editorHeader) editorHeader.style.display = 'flex';
      makeResumeEditable();
      updateTargetBadge('Click any element or text to edit');
    } else {
      if (splitScreen) splitScreen.classList.remove('mode-editor-active');
      if (btnPrev) { btnPrev.classList.add('active'); btnPrev.setAttribute('aria-selected', 'true'); }
      if (btnEdit) { btnEdit.classList.remove('active'); btnEdit.setAttribute('aria-selected', 'false'); }
      if (editorHeader) editorHeader.style.display = 'none';
      clearElementSelection();
    }
  }

  if (btnPrev) btnPrev.addEventListener('click', () => setMode('preview'));
  if (btnEdit) btnEdit.addEventListener('click', () => setMode('editor'));
}

// ── 2. ELEMENT SELECTION & TARGET BADGE ──
function clearElementSelection() {
  if (activeSelectedElement) {
    activeSelectedElement.classList.remove('editor-element-selected');
    activeSelectedElement = null;
  }
  if (activeSelectedEntry) {
    activeSelectedEntry.classList.remove('editor-entry-selected');
    activeSelectedEntry = null;
  }
  const delBtn = document.getElementById('echDeleteElemBtn');
  if (delBtn) delBtn.style.display = 'none';
  updateTargetBadge('Click any text or element to edit');
}

function selectElement(el) {
  if (!el) return;
  if (activeSelectedElement && activeSelectedElement !== el) {
    activeSelectedElement.classList.remove('editor-element-selected');
  }
  activeSelectedElement = el;
  el.classList.add('editor-element-selected');

  // Check if inside an entry card (e.g. .cl-entry, .mo-entry)
  const entryCard = el.closest('.cl-entry, .mo-entry, .mn-entry');
  if (activeSelectedEntry && activeSelectedEntry !== entryCard) {
    activeSelectedEntry.classList.remove('editor-entry-selected');
  }
  activeSelectedEntry = entryCard;
  if (entryCard) {
    entryCard.classList.add('editor-entry-selected');
  }

  // Show/Hide Delete Button
  const delBtn = document.getElementById('echDeleteElemBtn');
  if (delBtn) {
    delBtn.style.display = (entryCard || el.classList.contains('cl-skill-tag') || el.classList.contains('mo-tag') || el.classList.contains('mn-tag')) ? 'inline-flex' : 'none';
  }

  // Compute description for badge
  const label = getElementFriendlyLabel(el);
  updateTargetBadge(label);

  // Sync toolbar controls to match element's computed styles
  syncToolbarToElement(el);
}

function getElementFriendlyLabel(el) {
  if (el.classList.contains('cl-name') || el.classList.contains('mo-name') || el.classList.contains('mn-name') || (el.id && el.id.includes('name'))) {
    return '👤 Full Name';
  }
  if (el.classList.contains('cl-title') || el.classList.contains('mo-title') || el.classList.contains('mn-title') || (el.id && el.id.includes('title'))) {
    return '💼 Professional Title';
  }
  if (el.classList.contains('cl-section-title') || el.classList.contains('mo-section-title') || el.classList.contains('mn-section-title')) {
    return `🏷️ Section: ${el.innerText.trim() || 'Header'}`;
  }
  if (el.classList.contains('cl-summary') || el.classList.contains('mo-summary') || el.classList.contains('mn-summary')) {
    return '📝 Professional Summary';
  }
  if (el.dataset.editPath && el.dataset.editPath.startsWith('projects.')) {
    return `🚀 Project: ${el.innerText.trim().substring(0, 25) || 'Item'}`;
  }
  if (el.dataset.editPath && el.dataset.editPath.startsWith('experience.')) {
    return `💼 Work Experience: ${el.innerText.trim().substring(0, 25) || 'Role'}`;
  }
  if (el.dataset.editPath && el.dataset.editPath.startsWith('education.')) {
    return `🎓 Education: ${el.innerText.trim().substring(0, 25) || 'Degree'}`;
  }
  if (el.classList.contains('cl-skill-tag') || el.classList.contains('mo-tag') || el.classList.contains('mn-tag')) {
    return `⚡ Skill: ${el.innerText.trim()}`;
  }
  if (el.classList.contains('cl-entry-desc') || el.classList.contains('mo-entry-desc')) {
    return '📄 Bullet Description';
  }
  return `Target: ${el.innerText.trim().substring(0, 28) || 'Selected Element'}`;
}

function updateTargetBadge(text) {
  const badgeText = document.getElementById('echTargetText');
  if (badgeText) badgeText.textContent = text;
}

function syncToolbarToElement(el) {
  try {
    const computed = window.getComputedStyle(el);
    const ffSelect = document.getElementById('echFontFamily');
    const fsSelect = document.getElementById('echFontSize');
    const clrInput = document.getElementById('echCustomColorPicker');

    if (fsSelect && computed.fontSize) {
      const px = Math.round(parseFloat(computed.fontSize)) + 'px';
      const hasOpt = Array.from(fsSelect.options).some(o => o.value === px);
      if (hasOpt) fsSelect.value = px;
    }
    if (clrInput && computed.color) {
      const rgb = computed.color;
      const hex = rgbToHex(rgb);
      if (hex) clrInput.value = hex;
    }
  } catch(e) {}
}

function rgbToHex(rgb) {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return null;
  return '#' + ((1 << 24) + (parseInt(m[0]) << 16) + (parseInt(m[1]) << 8) + parseInt(m[2])).toString(16).slice(1);
}

// ── 3. ELEMENT SELECTION LISTENERS ──
function initElementSelectionEngine() {
  const previewPanel = document.getElementById('previewPanel');
  if (!previewPanel) return;

  previewPanel.addEventListener('click', (e) => {
    if (currentViewMode !== 'editor') return;

    const editable = e.target.closest('[data-canva-editable="true"], .cl-section-title, .mo-section-title, .mn-section-title, .cl-skill-tag, .mo-tag, .mn-tag, .cl-entry, .mo-entry, .mn-entry');
    if (editable) {
      selectElement(editable);
    } else if (!e.target.closest('#editorCanvasHeader, #textSelectionToolbar')) {
      clearElementSelection();
    }
  });

  // Track text highlight within preview
  document.addEventListener('selectionchange', () => {
    if (currentViewMode !== 'editor') return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (previewPanel && previewPanel.contains(range.commonAncestorContainer)) {
        savedSelectionRange = range.cloneRange();
        const str = sel.toString().trim();
        if (str) {
          updateTargetBadge(`🔤 Text: "${str.length > 20 ? str.substring(0, 18) + '…' : str}"`);
        }
      }
    }
  });

  // Keyboard Shortcuts in Editor Canvas
  document.addEventListener('keydown', (e) => {
    if (currentViewMode !== 'editor') return;

    if (e.key === 'Escape') {
      clearElementSelection();
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        applyFormatting('fontWeight');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        applyFormatting('fontStyle');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        applyFormatting('textDecoration');
      }
    }
  });
}

// ── 4. UNIVERSAL FORMATTING ENGINE ──
function applyFormatting(property, value) {
  const sel = window.getSelection();
  const previewPanel = document.getElementById('previewPanel');

  // Check if text range is highlighted inside the resume sheet
  if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (previewPanel && previewPanel.contains(range.commonAncestorContainer)) {
      if (property === 'fontWeight' || property === 'fontStyle' || property === 'textDecoration') {
        const cmdMap = { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline' };
        try { document.execCommand(cmdMap[property], false, null); } catch(err){}
      } else {
        applyInlineStyle(property, value);
      }
      triggerResumeContentChanged();
      return;
    }
  }

  // If no text range is highlighted, format the currently selected ELEMENT:
  if (activeSelectedElement) {
    if (property === 'fontFamily') {
      activeSelectedElement.style.fontFamily = value;
    } else if (property === 'fontSize') {
      activeSelectedElement.style.fontSize = value;
    } else if (property === 'color') {
      activeSelectedElement.style.color = value;
    } else if (property === 'fontWeight') {
      const isBold = activeSelectedElement.style.fontWeight === 'bold' || parseInt(activeSelectedElement.style.fontWeight) >= 700;
      activeSelectedElement.style.fontWeight = isBold ? 'normal' : 'bold';
    } else if (property === 'fontStyle') {
      activeSelectedElement.style.fontStyle = (activeSelectedElement.style.fontStyle === 'italic') ? 'normal' : 'italic';
    } else if (property === 'textDecoration') {
      const hasUnderline = activeSelectedElement.style.textDecoration && activeSelectedElement.style.textDecoration.includes('underline');
      activeSelectedElement.style.textDecoration = hasUnderline ? 'none' : 'underline';
    }
    triggerResumeContentChanged();
  }
}

// ── 5. DEDICATED EDITOR HEADER INITIALIZATION ──
function initDedicatedEditorHeader() {
  const ech = document.getElementById('editorCanvasHeader');
  if (!ech) return;

  // Prevent mousedown on header tools from deselecting text
  ech.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'SELECT' && e.target.type !== 'color') {
      e.preventDefault();
    }
  });

  // Font Family
  const echFontFamily = document.getElementById('echFontFamily');
  if (echFontFamily) {
    echFontFamily.addEventListener('change', () => {
      const val = echFontFamily.value;
      if (val) applyFormatting('fontFamily', val);
      echFontFamily.value = '';
    });
  }

  // Font Size Stepper
  const echFontSize = document.getElementById('echFontSize');
  if (echFontSize) {
    echFontSize.addEventListener('change', () => {
      const val = echFontSize.value;
      if (val) applyFormatting('fontSize', val);
      echFontSize.value = '';
    });
  }

  const echSizeDec = document.getElementById('echSizeDec');
  const echSizeInc = document.getElementById('echSizeInc');
  if (echSizeDec) {
    echSizeDec.addEventListener('click', (e) => {
      e.preventDefault();
      adjustActiveFontSize(-1);
    });
  }
  if (echSizeInc) {
    echSizeInc.addEventListener('click', (e) => {
      e.preventDefault();
      adjustActiveFontSize(1);
    });
  }

  function adjustActiveFontSize(delta) {
    let currentPx = 14;
    if (activeSelectedElement) {
      currentPx = parseInt(window.getComputedStyle(activeSelectedElement).fontSize, 10) || 14;
    }
    const nextPx = Math.max(8, Math.min(48, currentPx + delta)) + 'px';
    applyFormatting('fontSize', nextPx);
  }

  // Formatting Buttons
  const btnB = document.getElementById('echBtnBold');
  const btnI = document.getElementById('echBtnItalic');
  const btnU = document.getElementById('echBtnUnderline');
  const btnBullet = document.getElementById('echBtnBullet');

  if (btnB) btnB.addEventListener('click', (e) => { e.preventDefault(); applyFormatting('fontWeight'); });
  if (btnI) btnI.addEventListener('click', (e) => { e.preventDefault(); applyFormatting('fontStyle'); });
  if (btnU) btnU.addEventListener('click', (e) => { e.preventDefault(); applyFormatting('textDecoration'); });
  if (btnBullet) {
    btnBullet.addEventListener('click', (e) => {
      e.preventDefault();
      insertBulletPoint();
    });
  }

  // Colors
  const swatches = ech.querySelectorAll('.ech-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      e.preventDefault();
      const color = swatch.dataset.color;
      if (color) applyFormatting('color', color);
    });
  });

  const customColor = document.getElementById('echCustomColorPicker');
  if (customColor) {
    customColor.addEventListener('input', () => applyFormatting('color', customColor.value));
    customColor.addEventListener('change', () => applyFormatting('color', customColor.value));
  }

  // Text Alignment
  const aLeft = document.getElementById('echAlignLeft');
  const aCenter = document.getElementById('echAlignCenter');
  const aRight = document.getElementById('echAlignRight');

  if (aLeft) aLeft.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('left'); });
  if (aCenter) aCenter.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('center'); });
  if (aRight) aRight.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('right'); });

  // Add / Delete Actions
  const addProj = document.getElementById('echAddProjectBtn');
  const addExp = document.getElementById('echAddExpBtn');
  const addEdu = document.getElementById('echAddEduBtn');
  const addSkill = document.getElementById('echAddSkillBtn');
  const delBtn = document.getElementById('echDeleteElemBtn');
  const resetBtn = document.getElementById('echResetFormatting');

  if (addProj) addProj.addEventListener('click', (e) => { e.preventDefault(); addProjectEntry(); });
  if (addExp) addExp.addEventListener('click', (e) => { e.preventDefault(); addExperienceEntry(); });
  if (addEdu) addEdu.addEventListener('click', (e) => { e.preventDefault(); addEducationEntry(); });
  if (addSkill) addSkill.addEventListener('click', (e) => { e.preventDefault(); addSkillTag(); });
  if (delBtn) delBtn.addEventListener('click', (e) => { e.preventDefault(); deleteSelectedElementOrEntry(); });
  if (resetBtn) resetBtn.addEventListener('click', (e) => { e.preventDefault(); clearSelectionFormatting(); });

  // Canvas Zoom
  initCanvasZoom();
}

function insertBulletPoint() {
  if (activeSelectedElement) {
    activeSelectedElement.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const bulletNode = document.createTextNode('• ');
      range.insertNode(bulletNode);
      range.setStartAfter(bulletNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      activeSelectedElement.innerHTML = (activeSelectedElement.innerHTML ? activeSelectedElement.innerHTML + '<br>' : '') + '• ';
    }
    triggerResumeContentChanged();
  }
}

function addProjectEntry() {
  state.projects = state.projects || [];
  state.projects.push({
    name: 'New Project Name',
    type: 'Personal Project',
    link: '',
    startDate: '2024',
    endDate: 'Present',
    description: '• Implemented core architecture and optimized performance.\n• Designed responsive user interface with modern frameworks.'
  });
  renderAll();
  setTimeout(() => {
    const newItems = document.querySelectorAll('#previewPanel [data-edit-path^="projects."]');
    if (newItems.length) {
      const last = newItems[newItems.length - 1];
      selectElement(last);
      last.focus();
    }
  }, 60);
}

function addExperienceEntry() {
  state.experience = state.experience || [];
  state.experience.push({
    role: 'Software Engineer',
    company: 'Company Name',
    startDate: '2023',
    endDate: 'Present',
    description: '• Developed scalable web solutions and collaborated with cross-functional teams.\n• Streamlined deployments and reduced p99 latency.'
  });
  renderAll();
  setTimeout(() => {
    const newItems = document.querySelectorAll('#previewPanel [data-edit-path^="experience."]');
    if (newItems.length) {
      const last = newItems[newItems.length - 1];
      selectElement(last);
      last.focus();
    }
  }, 60);
}

function addEducationEntry() {
  state.education = state.education || [];
  state.education.push({
    degree: 'B.Tech in Computer Science',
    institution: 'University / Institute Name',
    startYear: '2020',
    endYear: '2024',
    info: 'CGPA: 8.5 / 10.0'
  });
  renderAll();
  setTimeout(() => {
    const newItems = document.querySelectorAll('#previewPanel [data-edit-path^="education."]');
    if (newItems.length) {
      const last = newItems[newItems.length - 1];
      selectElement(last);
      last.focus();
    }
  }, 60);
}

function addSkillTag() {
  const skill = prompt('Enter new skill name:', 'TypeScript');
  if (skill && skill.trim()) {
    state.skills = state.skills || { tech: [], soft: [], languages: [] };
    state.skills.tech = state.skills.tech || [];
    state.skills.tech.push(skill.trim());
    renderAll();
  }
}

function deleteSelectedElementOrEntry() {
  const target = activeSelectedElement || activeSelectedEntry;
  if (!target) return;

  // 1. Skill Tag deletion
  if (target.dataset.editType === 'skill') {
    const type = target.dataset.skillType || 'tech';
    const idx = parseInt(target.dataset.skillIdx, 10);
    if (state.skills && state.skills[type] && !isNaN(idx)) {
      state.skills[type].splice(idx, 1);
      clearElementSelection();
      renderAll();
      return;
    }
  }

  // 2. Direct data-edit-path deletion (project, experience, education)
  const path = target.dataset.editPath || (activeSelectedElement && activeSelectedElement.dataset.editPath);
  if (path) {
    const parts = path.split('.');
    const section = parts[0];
    const idx = parseInt(parts[1], 10);

    if (['experience', 'projects', 'education'].includes(section) && !isNaN(idx)) {
      if (confirm(`Delete this ${section.slice(0, -1)} entry?`)) {
        state[section].splice(idx, 1);
        clearElementSelection();
        renderAll();
        return;
      }
    }
  }

  // 3. Parent entry card deletion
  if (activeSelectedEntry) {
    const editPathEl = activeSelectedEntry.querySelector('[data-edit-path]');
    if (editPathEl && editPathEl.dataset.editPath) {
      const parts = editPathEl.dataset.editPath.split('.');
      const section = parts[0];
      const idx = parseInt(parts[1], 10);
      if (['experience', 'projects', 'education'].includes(section) && !isNaN(idx)) {
        if (confirm(`Delete this ${section.slice(0, -1)} entry?`)) {
          state[section].splice(idx, 1);
          clearElementSelection();
          renderAll();
          return;
        }
      }
    }
  }
}

function initCanvasZoom() {
  const zoomBtns = document.querySelectorAll('.ech-zoom-btn');
  const sheets = document.querySelectorAll('.resume-sheet');

  zoomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      zoomBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scale = btn.dataset.scale;
      sheets.forEach(sheet => {
        if (btn.id === 'echZoomFit') {
          sheet.style.transform = '';
        } else if (scale) {
          sheet.style.transform = `scale(${scale})`;
          sheet.style.transformOrigin = 'top center';
        }
      });
    });
  });
}

// ── 6. FLOATING HUD TOOLBAR (for quick in-line edits) ──
const selectionToolbar = document.getElementById('textSelectionToolbar');
const customColorInput = document.getElementById('tstCustomColorPicker');
const selectFontFamily = document.getElementById('tstFontFamily');
const selectFontSize   = document.getElementById('tstFontSize');
const btnAlignLeft     = document.getElementById('tstAlignLeft');
const btnAlignCenter   = document.getElementById('tstAlignCenter');
const btnAlignRight    = document.getElementById('tstAlignRight');
const btnAlignJustify  = document.getElementById('tstAlignJustify');

function initTextSelectionToolbar() {
  if (!selectionToolbar) return;

  makeResumeEditable();

  selectionToolbar.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'SELECT' && e.target.type !== 'color') {
      e.preventDefault();
    }
  });

  const swatches = selectionToolbar.querySelectorAll('.tst-color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      e.preventDefault();
      const color = swatch.dataset.color;
      if (color) applyInlineStyle('color', color);
    });
  });

  if (customColorInput) {
    customColorInput.addEventListener('input', () => applyInlineStyle('color', customColorInput.value));
    customColorInput.addEventListener('change', () => applyInlineStyle('color', customColorInput.value));
  }

  if (selectFontFamily) {
    selectFontFamily.addEventListener('change', () => {
      const val = selectFontFamily.value;
      if (val) applyInlineStyle('fontFamily', val);
      selectFontFamily.value = '';
    });
  }

  if (selectFontSize) {
    selectFontSize.addEventListener('change', () => {
      const val = selectFontSize.value;
      if (val) applyInlineStyle('fontSize', val);
      selectFontSize.value = '';
    });
  }

  if (btnAlignLeft) btnAlignLeft.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('left'); });
  if (btnAlignCenter) btnAlignCenter.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('center'); });
  if (btnAlignRight) btnAlignRight.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('right'); });
  if (btnAlignJustify) btnAlignJustify.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('justify'); });

  const btnBold      = document.getElementById('tstBtnBold');
  const btnItalic    = document.getElementById('tstBtnItalic');
  const btnUnderline = document.getElementById('tstBtnUnderline');
  const btnReset     = document.getElementById('tstBtnReset');

  if (btnBold) btnBold.addEventListener('click', (e) => { e.preventDefault(); restoreSavedSelection(); try { document.execCommand('bold', false, null); } catch(err){} triggerResumeContentChanged(); });
  if (btnItalic) btnItalic.addEventListener('click', (e) => { e.preventDefault(); restoreSavedSelection(); try { document.execCommand('italic', false, null); } catch(err){} triggerResumeContentChanged(); });
  if (btnUnderline) btnUnderline.addEventListener('click', (e) => { e.preventDefault(); restoreSavedSelection(); try { document.execCommand('underline', false, null); } catch(err){} triggerResumeContentChanged(); });
  if (btnReset) btnReset.addEventListener('click', (e) => { e.preventDefault(); clearSelectionFormatting(); });

  const checkSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      hideToolbar();
      return;
    }

    const range = sel.getRangeAt(0);
    const previewPanel = document.getElementById('previewPanel');
    if (!previewPanel || !previewPanel.contains(range.commonAncestorContainer)) {
      hideToolbar();
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      hideToolbar();
      return;
    }

    savedSelectionRange = range.cloneRange();

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hideToolbar();
      return;
    }

    selectionToolbar.style.display = 'flex';
    selectionToolbar.classList.add('visible');

    const tbWidth  = selectionToolbar.offsetWidth || 500;
    const tbHeight = selectionToolbar.offsetHeight || 42;

    let top  = rect.top - tbHeight - 12;
    let left = rect.left + (rect.width / 2) - (tbWidth / 2);

    if (top < 70) {
      top = rect.bottom + 12;
    }
    left = Math.max(12, Math.min(left, window.innerWidth - tbWidth - 12));

    selectionToolbar.style.top  = `${Math.round(top)}px`;
    selectionToolbar.style.left = `${Math.round(left)}px`;
  };

  function hideToolbar() {
    if (selectionToolbar.classList.contains('visible')) {
      selectionToolbar.classList.remove('visible');
      selectionToolbar.style.display = 'none';
    }
  }

  document.addEventListener('selectionchange', () => {
    if (!selectionToolbar.matches(':hover') && document.activeElement?.tagName !== 'SELECT') {
      checkSelection();
    }
  });

  const previewPanel = document.getElementById('previewPanel');
  if (previewPanel) {
    previewPanel.addEventListener('mouseup', () => setTimeout(checkSelection, 30));
    previewPanel.addEventListener('keyup', (e) => {
      if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setTimeout(checkSelection, 30);
      }
    });
    previewPanel.addEventListener('scroll', () => {
      if (selectionToolbar.classList.contains('visible')) checkSelection();
    }, { passive: true });
  }

  document.addEventListener('mousedown', (e) => {
    if (!selectionToolbar.contains(e.target) && (!previewPanel || !previewPanel.contains(e.target))) {
      hideToolbar();
    }
  });
}

function restoreSavedSelection() {
  if (savedSelectionRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelectionRange);
  }
}

// Applies arbitrary CSS property (color, fontFamily, fontSize) to selected text
function applyInlineStyle(property, value) {
  restoreSavedSelection();
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const previewPanel = document.getElementById('previewPanel');
  if (!previewPanel || !previewPanel.contains(range.commonAncestorContainer)) return;

  try {
    const span = document.createElement('span');
    span.style[property] = value;

    const parent = range.commonAncestorContainer.nodeType === 3
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    if (parent && parent.tagName === 'SPAN' && parent.textContent.trim() === range.toString().trim() && parent.dataset.canvaEditable !== 'true') {
      parent.style[property] = value;
    } else {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRange = newRange.cloneRange();
    }
  } catch (err) {
    console.warn('DOM inline styling exception:', err);
  }

  triggerResumeContentChanged();
}

// Applies block alignment to selected paragraph or active element
function applyAlignment(align) {
  restoreSavedSelection();
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;

    const block = node.closest('[data-canva-editable="true"]') || node.closest('.cl-entry-desc, .mo-entry-desc, .mn-entry-desc, .cl-summary, .mo-summary, .mn-summary, p, div, li') || node;
    if (block) {
      block.style.textAlign = align;
      triggerResumeContentChanged();
      return;
    }
  }

  if (activeSelectedElement) {
    activeSelectedElement.style.textAlign = align;
    triggerResumeContentChanged();
  }
}

function clearSelectionFormatting() {
  restoreSavedSelection();
  const sel = window.getSelection();
  if (sel && sel.rangeCount && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;

    if (node.tagName === 'SPAN' && node.dataset.canvaEditable !== 'true') {
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    } else {
      try { document.execCommand('removeFormat', false, null); } catch(e) {}
    }
  } else if (activeSelectedElement) {
    activeSelectedElement.style.fontFamily = '';
    activeSelectedElement.style.fontSize = '';
    activeSelectedElement.style.color = '';
    activeSelectedElement.style.fontWeight = '';
    activeSelectedElement.style.fontStyle = '';
    activeSelectedElement.style.textDecoration = '';
    activeSelectedElement.style.textAlign = '';
    const spans = activeSelectedElement.querySelectorAll('span');
    spans.forEach(s => {
      if (s.dataset.canvaEditable !== 'true') {
        s.replaceWith(document.createTextNode(s.textContent));
      }
    });
  }
  triggerResumeContentChanged();
}

function triggerResumeContentChanged() {
  const sel = window.getSelection();
  let anchor = sel && sel.anchorNode ? (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode) : null;
  const target = (anchor && anchor.closest('[data-canva-editable="true"]')) || activeSelectedElement || document.activeElement?.closest('[data-canva-editable="true"]');
  if (target) {
    const path = target.dataset.editPath;
    const content = /<(span|b|i|u|strong|em)\b/i.test(target.innerHTML) ? target.innerHTML : target.innerText.trim();
    if (path) {
      handlePathUpdate(path, content, target);
    }
  }

  updateLiveATSReadiness();
  try {
    localStorage.setItem('resumatic_state', JSON.stringify(state));
  } catch(e) {}
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
loadFromStorage();
initViewModeSwitcher();
initDedicatedEditorHeader();
initElementSelectionEngine();
initTextSelectionToolbar();
initCanvaLiveEditor();
initSkillEnhancer();
renderAll();
