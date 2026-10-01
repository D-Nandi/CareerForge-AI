/**
 * CareerForge AI / Resumatic — ATS Evaluation & Readiness Engine Module
 * Wrapped in IIFE to prevent global lexical scope collisions.
 */
(function(global) {
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

  const DOMAIN_BENCHMARKS = {
    fullstack: ['javascript', 'typescript', 'react', 'node.js', 'sql', 'mongodb', 'api', 'docker', 'git', 'html', 'css', 'rest', 'aws', 'communication', 'leadership'],
    frontend: ['javascript', 'typescript', 'react', 'html', 'css', 'redux', 'vue', 'webpack', 'tailwind', 'next.js', 'responsive', 'rest', 'git', 'collaboration', 'problem solving'],
    backend: ['node.js', 'python', 'java', 'express', 'sql', 'postgresql', 'mongodb', 'docker', 'api', 'microservices', 'redis', 'aws', 'git', 'system design', 'problem solving'],
    devops: ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd', 'linux', 'python', 'bash', 'ansible', 'jenkins', 'cloud', 'git', 'monitoring', 'incident management', 'troubleshooting'],
    data: ['python', 'sql', 'pandas', 'machine learning', 'numpy', 'tableau', 'spark', 'r', 'statistics', 'etl', 'visualization', 'git', 'analytical skills', 'critical thinking']
  };

  function evaluateATSReadiness(state = {}, targetJD = '') {
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

    // 1. Structure score (0-100)
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

    const ratedSkillsCount = rawTech.filter(s => /\((expert|advanced|intermediate|proficient|beginner|senior|lead)\)/i.test(s)).length;
    if (ratedSkillsCount >= 3) structScore += 10;
    else if (ratedSkillsCount >= 1) structScore += 5;

    structScore = Math.min(100, structScore);

    // 2. Metrics / Impact score (0-100)
    const metricMatches = fullResumeText.match(/\b\d+(\.\d+)?\s*%|\b\d{1,3}(,\d{3})*(\.\d+)?\s*([kKmMbB]|\+)?\s*(users|clients|customers|requests|queries|downloads|records|visits|subscribers|transactions|accounts|events|sessions|endpoints|pipelines)\b|[\$\€\£\₹]\s*\d{1,3}(,\d{3})*(\.\d+)?\s*([kKmMbB]|million|thousand)?\b|\b\d+(\.\d+)?\s*(ms|milliseconds|seconds|sec|x|fold|fps)\b|\b(reduced|increased|improved|boosted|cut|saved|scaled|optimized|delivered|grew)\s+(by\s+)?(\d+(\.\d+)?\s*(hours|hrs|days|weeks|percent)?)/gi) || [];

    let actionVerbCount = 0;
    ACTION_VERBS.forEach(v => {
      if (new RegExp('\\b' + v + '\\b', 'i').test(fullResumeText)) actionVerbCount++;
    });
    const impactScore = Math.min(100, Math.round((metricMatches.length * 18) + (actionVerbCount * 8)));

    // 3. Readability & word budget
    const words = fullResumeText.match(/\b[A-Za-z0-9'-]+\b/g) || [];
    const totalWords = words.length;
    let readabilityScore = 65;
    if (totalWords >= 350 && totalWords <= 850) readabilityScore = 95;
    else if (totalWords >= 220 && totalWords < 350) readabilityScore = 82;
    else if (totalWords >= 120 && totalWords < 220) readabilityScore = 72;
    else if (totalWords > 850 && totalWords <= 1200) readabilityScore = 80;
    else if (totalWords > 1200) readabilityScore = 60;
    else readabilityScore = 45;

    // 4. Keyword score
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
      let domain = 'fullstack';
      const titleLower = (p.title || '').toLowerCase();
      if (/devops|sre|infrastructure|kubernetes/i.test(titleLower + ' ' + fullLower)) domain = 'devops';
      else if (/frontend|react|ui|ux|web/i.test(titleLower + ' ' + fullLower)) domain = 'frontend';
      else if (/backend|api|server|database/i.test(titleLower + ' ' + fullLower)) domain = 'backend';
      else if (/data|analytics|machine learning|ai/i.test(titleLower + ' ' + fullLower)) domain = 'data';

      const benchmarks = DOMAIN_BENCHMARKS[domain] || DOMAIN_BENCHMARKS.fullstack;
      let found = 0;
      benchmarks.forEach(bm => {
        if (fullLower.includes(bm)) found++;
      });
      keywordScore = Math.min(100, Math.round((found / benchmarks.length) * 100));
    }

    const overallATS = Math.round(
      (structScore * 0.35) +
      (keywordScore * 0.30) +
      (impactScore * 0.20) +
      (readabilityScore * 0.15)
    );

    return {
      overallATS,
      structScore,
      keywordScore,
      impactScore,
      readabilityScore,
      metricCount: metricMatches.length,
      actionVerbCount,
      totalWords
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { evaluateATSReadiness, ACTION_VERBS, DOMAIN_BENCHMARKS };
  } else {
    global.evaluateATSReadiness = evaluateATSReadiness;
    global.ACTION_VERBS = ACTION_VERBS;
    global.DOMAIN_BENCHMARKS = DOMAIN_BENCHMARKS;
  }
})(typeof window !== 'undefined' ? window : this);
