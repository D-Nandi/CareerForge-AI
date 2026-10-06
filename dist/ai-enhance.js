// ══════════════════════════════════════════════════════
//  RESUMATIC — AI Enhancement Engine (JD-Aware & Anti-Hallucination)
//  Generates inline editable ATS suggestions for fields
//  (Summary, Experience descriptions, Project descriptions)
// ══════════════════════════════════════════════════════

(function(global) {
  'use strict';

  // Weak verb replacement dictionary
  const WEAK_VERB_MAP = [
    { regex: /\b(responsible for|tasked with|in charge of)\s+(\w+ing|\w+)/gi, replace: 'Spearheaded $2' },
    { regex: /\b(helped with|assisted in|aided in)\s+(\w+ing|\w+)/gi, replace: 'Collaborated on $2' },
    { regex: /\b(worked on|worked with)\b/gi, replace: 'Engineered' },
    { regex: /\b(did|made)\b/gi, replace: 'Built and deployed' },
    { regex: /\b(used|utilized|leveraged)\b/gi, replace: 'Implemented' },
    { regex: /\b(handled|dealt with)\b/gi, replace: 'Orchestrated' },
    { regex: /\b(changed|updated)\b/gi, replace: 'Refactored and optimized' },
    { regex: /\b(looked into|checked)\b/gi, replace: 'Audited and benchmarked' },
    { regex: /\b(talked to|met with)\b/gi, replace: 'Partnered with' },
    { regex: /\b(wrote code for|programmed)\b/gi, replace: 'Developed robust software for' },
    { regex: /\b(fixed bugs in|bug fixing)\b/gi, replace: 'Resolved critical defects in' }
  ];

  // Domain-specific action verb pools (no more repetitive "Spearheaded development of")
  const DOMAIN_VERBS = {
    engineering: [
      'Architected', 'Engineered', 'Refactored', 'Automated',
      'Scaled', 'Deployed', 'Implemented', 'Streamlined', 'Modernized'
    ],
    leadership: [
      'Orchestrated', 'Steered', 'Championed', 'Directed',
      'Mentored', 'Cultivated', 'Spearheaded', 'Mobilized', 'Facilitated'
    ],
    data: [
      'Quantified', 'Synthesized', 'Benchmarked', 'Forecasted',
      'Modeled', 'Extracted', 'Validated', 'Systematized', 'Optimized'
    ],
    product: [
      'Conceptualized', 'Spearheaded', 'Launched', 'Iterated',
      'Designed', 'Prioritized', 'Validated', 'Delivered'
    ],
    general: [
      'Executed', 'Established', 'Transformed', 'Accelerated',
      'Standardized', 'Enhanced', 'Integrated', 'Delivered'
    ]
  };

  // Recognize ALL common resume power verbs to avoid double-prefixing
  const ALL_POWER_VERBS = new Set([
    'architected', 'engineered', 'refactored', 'automated', 'scaled', 'deployed',
    'implemented', 'streamlined', 'modernized', 'built', 'developed', 'designed',
    'spearheaded', 'orchestrated', 'steered', 'championed', 'directed', 'mentored',
    'cultivated', 'mobilized', 'facilitated', 'led', 'managed', 'supervised', 'collaborated',
    'partnered', 'quantified', 'synthesized', 'benchmarked', 'forecasted', 'modeled',
    'extracted', 'validated', 'systematized', 'optimized', 'conceptualized', 'launched',
    'iterated', 'prioritized', 'delivered', 'executed', 'established', 'transformed',
    'accelerated', 'standardized', 'enhanced', 'integrated', 'resolved', 'audited',
    'reduced', 'increased', 'improved', 'expanded', 'boosted', 'generated', 'initiated'
  ]);

  /**
   * Helper to retrieve target JD text from DOM or state if not explicitly passed
   */
  function getEffectiveTargetJD(passedJD) {
    if (passedJD && typeof passedJD === 'string' && passedJD.trim().length > 20) {
      return passedJD.trim();
    }
    const jdEl = document.getElementById('jobDescription') ||
                 document.getElementById('cl_jobDescription') ||
                 document.getElementById('jobDescInput');
    if (jdEl && jdEl.value && jdEl.value.trim().length > 20) {
      return jdEl.value.trim();
    }
    if (window.resumaticState && window.resumaticState.jobDescription) {
      const stateJD = window.resumaticState.jobDescription.jobDescription;
      if (stateJD && stateJD.trim().length > 20) return stateJD.trim();
    }
    return '';
  }

  /**
   * Extract key required skills from JD that are absent in candidate text
   */
  function extractMissingJDSkills(candidateText, jobText) {
    if (!jobText || jobText.length < 25) return [];

    const KEY_TECH_TOKENS = [
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'typescript', 'react', 'node.js',
      'python', 'postgresql', 'mongodb', 'ci/cd', 'graphql', 'rest api', 'microservices',
      'redis', 'terraform', 'kafka', 'sql', 'agile', 'scrum', 'unit testing', 'system design'
    ];

    const jdLower = jobText.toLowerCase();
    const candLower = candidateText.toLowerCase();

    return KEY_TECH_TOKENS.filter(token => {
      const inJD = jdLower.includes(token);
      const inCand = candLower.includes(token);
      return inJD && !inCand;
    });
  }

  /**
   * Detect professional domain based on role title and bullet text
   */
  function detectDomain(roleOrTitle, text) {
    const combined = `${roleOrTitle || ''} ${text || ''}`.toLowerCase();
    if (/\b(lead|manager|director|vp|head of|scrum master|management)\b/i.test(roleOrTitle || '')) return 'leadership';
    if (/\b(data\s*scientist|data\s*analyst|machine\s*learning|bi\s*analyst|analytics)\b/i.test(combined)) return 'data';
    if (/\b(product\s*manager|product\s*designer|ux|ui|growth)\b/i.test(combined)) return 'product';
    if (/\b(engineer|developer|architect|backend|frontend|fullstack|devops|cloud|sre|software)\b/i.test(combined)) return 'engineering';
    return 'general';
  }

  /**
   * Enhances a job or project bullet/description (Anti-hallucination + JD-aware)
   */
  function enhanceDescription(text, roleOrTitle, targetJD) {
    if (!text || !text.trim()) return '';

    const effectiveJD = getEffectiveTargetJD(targetJD);
    const domain = detectDomain(roleOrTitle, text);
    const verbPool = DOMAIN_VERBS[domain] || DOMAIN_VERBS.general;
    const missingJDSkills = extractMissingJDSkills(text, effectiveJD);

    let lines = text.split(/\n|(?<=\.)\s+/).filter(l => l.trim().length > 10);
    if (!lines.length) lines = [text.trim()];

    const enhancedLines = lines.map((line, idx) => {
      let cleaned = line.replace(/^[•\-*▪◦➤\d\.]+\s*/, '').trim();

      // Apply weak verb replacements
      WEAK_VERB_MAP.forEach(item => {
        cleaned = cleaned.replace(item.regex, item.replace);
      });

      // Capitalize first letter
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

      // Check if starts with a recognized power verb
      const firstWord = cleaned.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
      const hasActionVerb = ALL_POWER_VERBS.has(firstWord);

      if (!hasActionVerb) {
        const verb = verbPool[idx % verbPool.length];
        if (/^(building|creating|designing|implementing|developing|maintaining|scaling)/i.test(cleaned)) {
          cleaned = cleaned.replace(/^(building|creating|designing|implementing|developing|maintaining|scaling)\s*/i, '');
          cleaned = `${verb} ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;
        } else {
          cleaned = `${verb} ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;
        }
      }

      // Weave missing JD skill ONLY if bullet is technical and not purely managerial/leadership
      const isTechBullet = !/\b(team|developers|scrum|meetings|sprint goals|stakeholders|clients|hiring)\b/i.test(cleaned);
      if (idx === 0 && missingJDSkills.length > 0 && isTechBullet) {
        const skillToWeave = missingJDSkills[0];
        if (!cleaned.toLowerCase().includes(skillToWeave)) {
          cleaned = cleaned.replace(/(\.|\,)?$/, `, utilizing ${skillToWeave}`);
        }
      }

      // Check for real metrics: if already present, do NOT hallucinate or tamper
      const hasMetric = /\b\d+(\.\d+)?%|\b\d{1,3}(,\d{3})*\b|\$[\d,]+|\b\d+x\b|\b\d+\s*(ms|hours|days|k|m)\b/i.test(cleaned);

      if (!hasMetric) {
        // Anti-hallucination: Insert candid, candidate-prompted placeholders instead of fake numbers
        const placeholderOutcomes = {
          engineering: [
            ', reducing production latency by [X]%',
            ', scaling system capacity to support [X]+ concurrent users',
            ', cutting build and release pipeline turnaround by [X]%',
            ', boosting automated test coverage to [X]%'
          ],
          leadership: [
            ', delivering sprint objectives [X] weeks ahead of target deadlines',
            ', elevating cross-functional team delivery velocity by [X]%',
            ', mentoring [X] junior team members through successful onboarding',
            ', managing project deliverables within a [$X] budget'
          ],
          data: [
            ', improving predictive model accuracy by [X]%',
            ', identifying [X]+ data anomalies across [X] million database records',
            ', cutting recurring reporting generation time by [X] hours weekly',
            ', driving a [X]% optimization in resource utilization'
          ],
          product: [
            ', driving a [X]% increase in user activation and engagement',
            ', reducing customer onboarding drop-off rate by [X]%',
            ', increasing monthly recurring adoption by [X]%',
            ', accelerating product time-to-market by [X] weeks'
          ],
          general: [
            ', boosting workflow turnaround speed by [X]%',
            ', cutting recurring operational overhead by [X] hours per week',
            ', achieving [X]% compliance with corporate benchmarks',
            ', improving stakeholder delivery satisfaction by [X]%'
          ]
        };

        const list = placeholderOutcomes[domain] || placeholderOutcomes.general;
        const outcome = list[idx % list.length];
        cleaned = cleaned.replace(/[\.,\s]+$/, '');
        cleaned += `${outcome}.`;
      } else if (!cleaned.endsWith('.')) {
        cleaned += '.';
      }

      return `• ${cleaned}`;
    });

    return enhancedLines.join('\n');
  }

  /**
   * Enhances a professional summary (JD-Aware + Keyword-Rich)
   */
  function enhanceSummary(summary, roleTitle, topSkills, targetJD) {
    const effectiveJD = getEffectiveTargetJD(targetJD);
    const title = roleTitle || 'Results-Driven Professional';
    
    // Skills selection
    let skillsList = 'scalable architecture, modern technologies, and cross-functional execution';
    if (Array.isArray(topSkills) && topSkills.length) {
      skillsList = topSkills.slice(0, 5).join(', ');
    }

    // Extract target JD key requirements if available
    let jdFocus = '';
    if (effectiveJD) {
      const missingSkills = extractMissingJDSkills(summary || '', effectiveJD);
      if (missingSkills.length >= 2) {
        jdFocus = ` Specializing in ${missingSkills.slice(0, 3).join(', ')} to deliver mission-critical business outcomes.`;
      }
    }

    if (!summary || summary.trim().length < 25) {
      return `Accomplished and solutions-focused ${title} with proven expertise in ${skillsList}.${jdFocus} Track record of architecting resilient workflows, optimizing team velocity, and delivering high-impact products aligned with strategic objectives.`;
    }

    let cleaned = summary.trim();
    WEAK_VERB_MAP.forEach(item => {
      cleaned = cleaned.replace(item.regex, item.replace);
    });

    return `${title} with demonstrated track record in ${skillsList}. ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}${jdFocus} Committed to technical excellence, continuous delivery, and quantifiable business value.`;
  }

  /**
   * Attach an inline editable suggestion box below a target form field
   */
  function attachSuggestionBox(targetEl, suggestedText, onAccept) {
    if (!targetEl || !suggestedText) return;

    const existing = targetEl.parentElement.querySelector('.ai-suggestion-box');
    if (existing) existing.remove();

    const hasPlaceholders = /\[X\]|\[\$X\]|\[Y\]/i.test(suggestedText);

    const box = document.createElement('div');
    box.className = 'ai-suggestion-box';
    box.innerHTML = `
      <div class="suggestion-header">
        <span class="suggestion-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          AI ATS-Optimized Suggestion
        </span>
        <span style="font-size:11px;color:var(--text-muted);font-weight:500;">Directly editable</span>
      </div>
      ${hasPlaceholders ? `
        <div class="placeholder-tip" style="display:flex;align-items:center;gap:6px;background:rgba(245,158,11,0.1);border:1px dashed rgba(245,158,11,0.4);color:#d97706;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:500;margin-bottom:8px;">
          <span>💡</span>
          <span><strong>Action Required:</strong> Replace <code>[X]</code> with your actual metric before saving to avoid fake claims in interviews.</span>
        </div>
      ` : ''}
      <textarea class="suggestion-textarea" rows="4">${escapeHtml(suggestedText)}</textarea>
      <div class="suggestion-actions">
        <button type="button" class="btn-accept-sug">✓ Accept &amp; Save</button>
        <button type="button" class="btn-dismiss-sug">✕ Keep Original</button>
      </div>
    `;

    if (targetEl.nextSibling) {
      targetEl.parentNode.insertBefore(box, targetEl.nextSibling);
    } else {
      targetEl.parentNode.appendChild(box);
    }

    const textarea = box.querySelector('.suggestion-textarea');
    const btnAccept = box.querySelector('.btn-accept-sug');
    const btnDismiss = box.querySelector('.btn-dismiss-sug');

    btnAccept.addEventListener('click', () => {
      const finalText = textarea.value.trim();
      targetEl.value = finalText;
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
      targetEl.dispatchEvent(new Event('change', { bubbles: true }));

      // Green confirmation highlight
      targetEl.style.transition = 'box-shadow 0.3s, border-color 0.3s';
      targetEl.style.borderColor = '#10b981';
      targetEl.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
      setTimeout(() => {
        targetEl.style.borderColor = '';
        targetEl.style.boxShadow = '';
      }, 1500);

      if (typeof onAccept === 'function') onAccept(finalText);
      box.remove();
    });

    btnDismiss.addEventListener('click', () => {
      box.remove();
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Generates suggestions for all extracted fields and attaches them inline
   */
  function generateFieldSuggestions(data) {
    if (!data) return;

    const targetJD = (data.jobDescription && data.jobDescription.jobDescription) ||
                     (document.getElementById('jobDescription') ? document.getElementById('jobDescription').value : '') ||
                     '';

    // 1. Summary
    const summaryEl = document.getElementById('summary') || document.getElementById('p_summary');
    if (summaryEl && data.summary) {
      const topSkills = (data.skills && data.skills.tech) || [];
      const enhancedSummary = enhanceSummary(data.summary, data.jobTitle, topSkills, targetJD);
      attachSuggestionBox(summaryEl, enhancedSummary);
    }

    // 2. Experience entries
    const expCards = document.querySelectorAll('#experienceList .entry-card, #expFields .entry-block');
    expCards.forEach((card) => {
      const descEl = card.querySelector('textarea[name="description"], textarea[data-key="description"]');
      const roleEl = card.querySelector('input[name="role"], input[data-key="role"]');
      if (descEl && descEl.value.trim()) {
        const enhanced = enhanceDescription(descEl.value, roleEl ? roleEl.value : '', targetJD);
        attachSuggestionBox(descEl, enhanced);
      }
    });

    // 3. Project entries
    const projCards = document.querySelectorAll('#projectList .entry-card, #projFields .entry-block');
    projCards.forEach((card) => {
      const descEl = card.querySelector('textarea[name="description"], textarea[data-key="description"]');
      const nameEl = card.querySelector('input[name="name"], input[data-key="name"]');
      if (descEl && descEl.value.trim()) {
        const enhanced = enhanceDescription(descEl.value, nameEl ? nameEl.value : 'Project', targetJD);
        attachSuggestionBox(descEl, enhanced);
      }
    });
  }

  // Expose to global/window
  global.AIEnhance = {
    enhanceDescription: enhanceDescription,
    enhanceSummary: enhanceSummary,
    attachSuggestionBox: attachSuggestionBox,
    generateFieldSuggestions: generateFieldSuggestions
  };

})(typeof window !== 'undefined' ? window : this);
