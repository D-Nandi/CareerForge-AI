// ── STATE ──
const state = {
  currentStep: 1,
  totalSteps: 6,
  personal: {},
  experience: [],
  education: [],
  skills: { tech: [], soft: [], languages: [] },
  jobDescription: {},
  tone: 'professional',
};

// ── DOM REFS ──
const progressFill  = document.getElementById('progressFill');
const stepDots      = document.getElementById('stepDots');
const headerStepNum = document.getElementById('headerStepNum');
const btnPrev       = document.getElementById('btnPrev');
const btnNext       = document.getElementById('btnNext');

// ── INIT DOTS ──
for (let i = 1; i <= state.totalSteps; i++) {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 1 ? ' active' : '');
  dot.dataset.step = i;
  stepDots.appendChild(dot);
}

// ── PROGRESS UPDATE ──
function updateProgress() {
  const pct = (state.currentStep / state.totalSteps) * 100;
  progressFill.style.width = pct + '%';
  headerStepNum.textContent = state.currentStep;

  document.querySelectorAll('.dot').forEach(d => {
    const s = parseInt(d.dataset.step);
    d.className = 'dot' + (s < state.currentStep ? ' done' : s === state.currentStep ? ' active' : '');
  });

  btnPrev.disabled = state.currentStep === 1;
  btnNext.textContent = state.currentStep === state.totalSteps ? 'Submit' : 'Continue';
  btnNext.innerHTML = state.currentStep === state.totalSteps
    ? 'Submit <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : 'Continue <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (state.currentStep === state.totalSteps) btnNext.classList.add('submit');
  else btnNext.classList.remove('submit');
}

// ── SHOW STEP ──
function showStep(next) {
  const current = document.querySelector('.form-step.active');
  const target  = document.querySelector(`.form-step[data-step="${next}"]`);
  if (!current || !target) return;
  current.classList.remove('active');
  target.classList.add('active');
  state.currentStep = next;
  updateProgress();
  if (next === 6) buildReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── VALIDATION ──
function validate(step) {
  clearErrors();
  let ok = true;

  if (step === 1) {
    ok = validateField('firstName', 'First name is required') && ok;
    ok = validateField('lastName', 'Last name is required') && ok;
    ok = validateField('jobTitle', 'Professional title is required') && ok;
    ok = validateEmail() && ok;
  }

  if (step === 4) {
    if (state.skills.tech.length === 0) {
      document.getElementById('techSkillsError').textContent = 'Add at least one technical skill.';
      document.getElementById('techSkillsWrap').style.borderColor = 'var(--red)';
      ok = false;
    }
  }

  if (step === 5) {
    ok = validateField('targetRole', 'Target role is required') && ok;
    ok = validateField('jobDescription', 'Job description is required') && ok;
  }

  return ok;
}

function validateField(id, msg) {
  const el = document.getElementById(id);
  if (!el || !el.value.trim()) {
    el && el.classList.add('error');
    const errEl = el && el.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = msg;
    return false;
  }
  return true;
}

function validateEmail() {
  const el = document.getElementById('email');
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!el.value.trim()) {
    el.classList.add('error');
    el.parentElement.querySelector('.field-error').textContent = 'Email is required.';
    return false;
  }
  if (!re.test(el.value.trim())) {
    el.classList.add('error');
    el.parentElement.querySelector('.field-error').textContent = 'Enter a valid email.';
    return false;
  }
  return true;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  const wrap = document.getElementById('techSkillsWrap');
  if (wrap) wrap.style.borderColor = '';
  const terr = document.getElementById('techSkillsError');
  if (terr) terr.textContent = '';
}

// ── SAVE STATE ──
function saveStep(step) {
  if (step === 1) {
    ['firstName','lastName','jobTitle','email','phone','location','linkedin','summary'].forEach(id => {
      const el = document.getElementById(id);
      if (el) state.personal[id] = el.value.trim();
    });
  }
  if (step === 5) {
    state.jobDescription.targetRole     = document.getElementById('targetRole').value.trim();
    state.jobDescription.jobDescription = document.getElementById('jobDescription').value.trim();
  }
  if (step === 6) {
    const checked = document.querySelector('input[name="tone"]:checked');
    if (checked) state.tone = checked.value;
  }
}

// ── PERSIST TO localStorage ──
function persistState() {
  try {
    localStorage.setItem('resumatic_state', JSON.stringify({
      personal:   state.personal,
      experience: state.experience,
      education:  state.education,
      skills:     state.skills,
    }));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

// ── NAV HANDLERS ──
btnNext.addEventListener('click', () => {
  saveStep(state.currentStep);
  if (!validate(state.currentStep)) return;
  if (state.currentStep < state.totalSteps) showStep(state.currentStep + 1);
  else handleSubmit();
});

btnPrev.addEventListener('click', () => {
  saveStep(state.currentStep);
  if (state.currentStep > 1) showStep(state.currentStep - 1);
});

// ── CLEAR ERRORS ON INPUT ──
document.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const err = el.parentElement.querySelector('.field-error');
    if (err) err.textContent = '';
  });
});

// ── EXPERIENCE ENTRIES ──
let expCount = 0;
document.getElementById('addExperience').addEventListener('click', () => addExperience());
function addExperience(data = {}) {
  expCount++;
  const id = `exp_${expCount}`;
  const card = document.createElement('div');
  card.className = 'entry-card expanded';
  card.id = id;
  card.innerHTML = `
    <div class="entry-card-header">
      <div>
        <div class="entry-card-title">${data.company || 'New Experience'}</div>
        <div class="entry-card-subtitle">${data.role || 'Role & Company'}</div>
      </div>
      <div class="entry-card-actions">
        <button class="btn-icon" title="Remove" onclick="removeEntry('${id}', 'experience')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button class="btn-icon toggle" onclick="toggleCard('${id}')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="entry-card-body">
      <div class="fields-grid">
        <div class="field-group"><label>Job Title</label><input type="text" name="role" placeholder="e.g. Frontend Developer" value="${data.role||''}" /></div>
        <div class="field-group"><label>Company</label><input type="text" name="company" placeholder="e.g. Google" value="${data.company||''}" /></div>
        <div class="field-group"><label>Start Date</label><input type="text" name="startDate" placeholder="Jan 2022" value="${data.startDate||''}" /></div>
        <div class="field-group"><label>End Date</label><input type="text" name="endDate" placeholder="Present" value="${data.endDate||''}" /></div>
        <div class="field-group full"><label>Description</label><textarea name="description" rows="3" placeholder="Key responsibilities and achievements...">${data.description||''}</textarea></div>
      </div>
    </div>`;
  document.getElementById('experienceList').appendChild(card);
  attachEntryListeners(card, 'experience', id);
  syncEntry(card, 'experience', id);
}

// ── EDUCATION ENTRIES ──
let eduCount = 0;
document.getElementById('addEducation').addEventListener('click', () => addEducation());
function addEducation(data = {}) {
  eduCount++;
  const id = `edu_${eduCount}`;
  const card = document.createElement('div');
  card.className = 'entry-card expanded';
  card.id = id;
  card.innerHTML = `
    <div class="entry-card-header">
      <div>
        <div class="entry-card-title">${data.institution || 'New Education'}</div>
        <div class="entry-card-subtitle">${data.degree || 'Degree & Institution'}</div>
      </div>
      <div class="entry-card-actions">
        <button class="btn-icon" title="Remove" onclick="removeEntry('${id}', 'education')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button class="btn-icon toggle" onclick="toggleCard('${id}')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="entry-card-body">
      <div class="fields-grid">
        <div class="field-group"><label>Degree</label><input type="text" name="degree" placeholder="e.g. B.Tech Computer Science" value="${data.degree||''}" /></div>
        <div class="field-group"><label>Institution</label><input type="text" name="institution" placeholder="e.g. IIT Bombay" value="${data.institution||''}" /></div>
        <div class="field-group"><label>Start Year</label><input type="text" name="startYear" placeholder="2019" value="${data.startYear||''}" /></div>
        <div class="field-group"><label>End Year</label><input type="text" name="endYear" placeholder="2023" value="${data.endYear||''}" /></div>
        <div class="field-group full"><label>Additional Info</label><input type="text" name="info" placeholder="GPA, honors, relevant coursework..." value="${data.info||''}" /></div>
      </div>
    </div>`;
  document.getElementById('educationList').appendChild(card);
  attachEntryListeners(card, 'education', id);
  syncEntry(card, 'education', id);
}

function toggleCard(id) {
  document.getElementById(id).classList.toggle('expanded');
}

function removeEntry(id, type) {
  const card = document.getElementById(id);
  if (card) card.remove();
  if (type === 'experience') state.experience = state.experience.filter(e => e._id !== id);
  if (type === 'education')  state.education  = state.education.filter(e => e._id !== id);
}

function attachEntryListeners(card, type, id) {
  card.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => syncEntry(card, type, id));
  });
  const titleEl    = card.querySelector('.entry-card-title');
  const subtitleEl = card.querySelector('.entry-card-subtitle');
  card.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      const role        = card.querySelector('[name="role"]');
      const company     = card.querySelector('[name="company"]');
      const degree      = card.querySelector('[name="degree"]');
      const institution = card.querySelector('[name="institution"]');
      if (role && company) {
        titleEl.textContent    = company.value || 'New Experience';
        subtitleEl.textContent = role.value    || 'Role & Company';
      }
      if (degree && institution) {
        titleEl.textContent    = institution.value || 'New Education';
        subtitleEl.textContent = degree.value      || 'Degree & Institution';
      }
    });
  });
}

function syncEntry(card, type, id) {
  const data = { _id: id };
  card.querySelectorAll('input, textarea').forEach(el => {
    if (el.name) data[el.name] = el.value.trim();
  });
  const arr = type === 'experience' ? state.experience : state.education;
  const idx = arr.findIndex(e => e._id === id);
  if (idx > -1) arr[idx] = data; else arr.push(data);
}

// ── TAG INPUT ──
setupTagInput('techSkillInput',  'techTagsDisplay',  'tech');
setupTagInput('softSkillInput',  'softTagsDisplay',  'soft');
setupTagInput('langInput',       'langTagsDisplay',  'languages');

function setupTagInput(inputId, displayId, key) {
  const input   = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  if (!input || !display) return;

  input.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      addTag(input.value.replace(',','').trim(), key, display);
      input.value = '';
      if (key === 'tech') {
        document.getElementById('techSkillsError').textContent = '';
        document.getElementById('techSkillsWrap').style.borderColor = '';
      }
    }
    if (e.key === 'Backspace' && !input.value && state.skills[key].length > 0) {
      const last = state.skills[key].pop();
      display.querySelector(`[data-tag="${last}"]`)?.remove();
    }
  });
}

function addTag(text, key, display) {
  if (!text || state.skills[key].includes(text)) return;
  state.skills[key].push(text);
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.dataset.tag = text;
  tag.innerHTML = `${text}<span class="tag-remove" onclick="removeTag('${text}','${key}',this)">
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  </span>`;
  display.appendChild(tag);
}

function removeTag(text, key, el) {
  state.skills[key] = state.skills[key].filter(t => t !== text);
  el.closest('.tag').remove();
}

// ── TONE CARDS ──
document.querySelectorAll('.tone-card').forEach(card => {
  card.addEventListener('click', () => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio) { radio.checked = true; state.tone = radio.value; }
  });
});

// ── REVIEW ──
function buildReview() {
  saveStep(5);
  const grid = document.getElementById('reviewGrid');
  const p = state.personal;
  const items = [
    { label: 'Full Name',    value: [p.firstName, p.lastName].filter(Boolean).join(' ') },
    { label: 'Title',        value: p.jobTitle },
    { label: 'Email',        value: p.email },
    { label: 'Location',     value: p.location },
    { label: 'Experience',   value: state.experience.length + ' entr' + (state.experience.length === 1 ? 'y' : 'ies') },
    { label: 'Education',    value: state.education.length  + ' entr' + (state.education.length  === 1 ? 'y' : 'ies') },
    { label: 'Tech Skills',  value: state.skills.tech.join(', ') || null },
    { label: 'Target Role',  value: state.jobDescription.targetRole },
  ];
  grid.innerHTML = items.map(i => `
    <div class="review-item">
      <div class="review-label">${i.label}</div>
      <div class="review-value ${!i.value ? 'empty' : ''}">${i.value || '—'}</div>
    </div>`).join('');
}

// ── SUBMIT & GENERATE ──
async function handleSubmit() {
  saveStep(6);

  const resultBox   = document.getElementById('coverLetterResult');
  const resultText  = document.getElementById('coverLetterText');
  const btnGenerate = document.getElementById('btnGenerate');

  // Hide the preview button while (re)generating
  let btnPreview = document.getElementById('btnGoToPreview');
  if (btnPreview) btnPreview.remove();

  // Show result box, set loading state
  resultBox.style.display = 'block';
  resultText.textContent  = '';
  btnNext.disabled        = true;
  btnGenerate.disabled    = true;
  btnGenerate.textContent = 'Generating…';
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    let coverLetterText = '';
    
    // Try primary backend endpoint on port 5000 or relative path
    try {
      const apiUrl = (window.location.port === '5000') ? '/api/generate' : 'http://localhost:5000/api/generate';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal:       state.personal,
          experience:     state.experience,
          education:      state.education,
          skills:         state.skills,
          jobDescription: state.jobDescription,
          tone:           state.tone,
        }),
      });

      if (res.ok) {
        const rawText = await res.text();
        if (rawText && rawText.trim()) {
          const data = JSON.parse(rawText);
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
      const name = [state.personal.firstName, state.personal.lastName].filter(Boolean).join(' ') || 'Job Applicant';
      const role = state.jobDescription?.targetRole || state.personal.jobTitle || 'Target Role';
      const expStr = (state.experience || []).map(e => `${e.role} at ${e.company} (${e.description || ''})`).join('; ');
      const techStr = (state.skills.tech || []).join(', ');
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      let intro = `I am writing to express my strong enthusiasm for the ${role} position. With a solid foundation in ${techStr || 'technical innovation and scalable execution'}, I am confident in my ability to bring immediate value to your organization.`;
      let body = expStr 
        ? `Throughout my career, I have focused on driving measurable outcomes: ${expStr}. My background has prepared me to tackle complex challenges and collaborate effectively across cross-functional teams.`
        : `My background combines technical problem solving, structured execution, and strategic communication. I take deep ownership in translating complex goals into high-quality deliverables.`;
      let closing = `I look forward to discussing how my experience and passion align with your team's upcoming roadmap. Thank you for your time and consideration.\n\nSincerely,\n${name}`;

      coverLetterText = `${today}\n\nDear Hiring Team,\n\n${intro}\n\n${body}\n\n${closing}`;
    }

    resultText.textContent  = coverLetterText;
    btnGenerate.textContent = 'Regenerate ↺';
    btnGenerate.disabled    = false;

    // ── SAVE TO localStorage SO preview.html CAN READ IT ──
    persistState();

    // ── GO TO PREVIEW BUTTON ──
    btnPreview = document.createElement('a');
    btnPreview.id        = 'btnGoToPreview';
    btnPreview.href      = 'preview.html';
    btnPreview.innerHTML = 'Go to Preview <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btnPreview.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'gap:6px',
      'margin-top:16px',
      'padding:10px 22px',
      'background:var(--accent, #7c6fff)',
      'color:#fff',
      'border-radius:8px',
      'font-weight:600',
      'font-size:0.95rem',
      'text-decoration:none',
      'transition:opacity .2s',
    ].join(';');
    btnPreview.addEventListener('mouseover', () => btnPreview.style.opacity = '0.85');
    btnPreview.addEventListener('mouseout',  () => btnPreview.style.opacity = '1');
    resultBox.appendChild(btnPreview);

  } catch (err) {
    resultText.textContent  = '⚠ ' + err.message;
    btnGenerate.textContent = 'Try Again';
    btnGenerate.disabled    = false;
  } finally {
    btnNext.disabled = false;
  }
}

// ── REGENERATE BUTTON ──
document.getElementById('btnGenerate').addEventListener('click', () => {
  saveStep(6);
  handleSubmit();
});

// ── COPY BUTTON ──
document.getElementById('btnCopy').addEventListener('click', () => {
  const text = document.getElementById('coverLetterText').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btnCopy');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
});

// ── INIT & PREFILL ──
updateProgress();

function initPrefill() {
  const urlParams = new URLSearchParams(window.location.search);
  const prefillKey = urlParams.get('prefill');
  
  if (prefillKey && typeof ROLES_DATABASE !== 'undefined' && ROLES_DATABASE[prefillKey]) {
    const data = ROLES_DATABASE[prefillKey];
    
    // Step 1: Personal Info
    if (document.getElementById('firstName')) document.getElementById('firstName').value = 'Alex';
    if (document.getElementById('lastName')) document.getElementById('lastName').value = 'Morgan';
    if (document.getElementById('jobTitle')) document.getElementById('jobTitle').value = data.title;
    if (document.getElementById('email')) document.getElementById('email').value = 'alex.morgan@email.com';
    if (document.getElementById('phone')) document.getElementById('phone').value = '+1 (555) 019-2834';
    if (document.getElementById('location')) document.getElementById('location').value = 'San Francisco, CA';
    if (document.getElementById('summary')) document.getElementById('summary').value = data.summary;

    // Step 2: Experience
    document.getElementById('experienceList').innerHTML = '';
    state.experience = [];
    data.experience.forEach((exp) => {
      addExperience({
        role: exp.role,
        company: exp.company,
        startDate: exp.period.split('–')[0]?.trim() || '2021',
        endDate: exp.period.split('–')[1]?.trim() || 'Present',
        description: exp.bullets.join('\n• ')
      });
    });

    // Step 3: Education
    document.getElementById('educationList').innerHTML = '';
    state.education = [];
    addEducation({
      degree: 'B.S. in Computer Science & Information Systems',
      institution: 'State University',
      gradYear: '2020'
    });

    // Step 4: Skills
    data.keywords.forEach(k => {
      state.skills.tech.push(k);
      createTag(k, 'techTagsDisplay', 'tech', 'techSkillsError');
    });

    ['Communication', 'Cross-functional Collaboration', 'Problem Solving', 'Leadership'].forEach(s => {
      state.skills.soft.push(s);
      createTag(s, 'softTagsDisplay', 'soft');
    });

    // Step 5: Target Role
    if (document.getElementById('targetRole')) {
      document.getElementById('targetRole').value = `${data.title} at Top Tech Co`;
    }
    if (document.getElementById('jobDescription')) {
      document.getElementById('jobDescription').value = `Seeking an experienced ${data.title} skilled in ${data.keywords.slice(0, 5).join(', ')} to drive product innovation and scalable system execution.`;
    }
  } else {
    addExperience();
    addEducation();
  }
}

initPrefill();

// ── GLOBAL EXPORTS FOR AUTOFILL & IMPORT ──
window.state = state;
window.addExperience = addExperience;
window.addEducation = addEducation;
window.addTag = addTag;
window.removeTag = removeTag;
window.syncEntry = syncEntry;
window.saveStep = saveStep;
window.persistState = persistState;
