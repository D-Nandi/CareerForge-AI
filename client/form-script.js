// ── UTILS ──
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── STATE ──
const state = {
  currentStep: 1,
  totalSteps: 6,
  personal: {},
  experience: [],
  projects: [],
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
  if (next === 4) {
    renderProficiencyMapper();
    renderLangProficiencyMapper();
  }
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
    } else {
      const unmapped = state.skills.tech.some(s => !parseSkillTag(s).level);
      if (unmapped) {
        autoLevelAllProficiencies();
      }
    }

    if (state.skills.languages && state.skills.languages.length > 0) {
      const unmappedLang = state.skills.languages.some(l => !parseSkillTag(l).level);
      if (unmappedLang) {
        autoLevelAllLangProficiencies();
      }
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
function saveAllSteps() {
  ['firstName','lastName','jobTitle','email','phone','location','linkedin','summary'].forEach(id => {
    const el = document.getElementById(id);
    if (el) state.personal[id] = el.value.trim();
  });
  const tr = document.getElementById('targetRole');
  if (tr) state.jobDescription.targetRole = tr.value.trim();
  const jd = document.getElementById('jobDescription');
  if (jd) state.jobDescription.jobDescription = jd.value.trim();
  const checked = document.querySelector('input[name="tone"]:checked');
  if (checked) state.tone = checked.value;
}

function saveStep(step) {
  saveAllSteps();
}

// ── PERSIST TO localStorage ──
function persistState() {
  saveAllSteps();
  if (typeof syncLangProficiencyArray === 'function') syncLangProficiencyArray();
  try {
    localStorage.setItem('resumatic_state', JSON.stringify({
      personal:        state.personal,
      experience:      state.experience,
      projects:        state.projects,
      education:       state.education,
      skills:          state.skills,
      langProficiency: state.langProficiency,
      jobDescription:  state.jobDescription,
      tone:            state.tone,
      deletedSegments: state.deletedSegments || {},
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

const btnNavPreview = document.getElementById('btnNavPreview');
if (btnNavPreview) {
  btnNavPreview.addEventListener('click', () => {
    saveStep(state.currentStep);
    persistState();
  });
}

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
        <div class="entry-card-title">${esc(data.company) || 'New Experience'}</div>
        <div class="entry-card-subtitle">${esc(data.role) || 'Role & Company'}</div>
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
        <div class="field-group"><label>Job Title</label><input type="text" name="role" placeholder="e.g. Frontend Developer" value="${esc(data.role)}" /></div>
        <div class="field-group"><label>Company</label><input type="text" name="company" placeholder="e.g. Google" value="${esc(data.company)}" /></div>
        <div class="field-group"><label>Start Date</label><input type="text" name="startDate" placeholder="Jan 2022" value="${esc(data.startDate)}" /></div>
        <div class="field-group"><label>End Date</label><input type="text" name="endDate" placeholder="Present" value="${esc(data.endDate)}" /></div>
        <div class="field-group full"><label>Description</label><textarea name="description" rows="3" placeholder="Key responsibilities and achievements...">${esc(data.description)}</textarea></div>
      </div>
    </div>`;
  document.getElementById('experienceList').appendChild(card);
  attachEntryListeners(card, 'experience', id);
  syncEntry(card, 'experience', id);
}

// ── PROJECT ENTRIES ──
let projCount = 0;
const btnAddProject = document.getElementById('addProject');
if (btnAddProject) btnAddProject.addEventListener('click', () => addProject());

function addProject(data = {}) {
  projCount++;
  const id = `proj_${projCount}`;
  const card = document.createElement('div');
  card.className = 'entry-card expanded';
  card.id = id;
  card.innerHTML = `
    <div class="entry-card-header">
      <div>
        <div class="entry-card-title">${esc(data.name) || 'New Project'}</div>
        <div class="entry-card-subtitle">${esc(data.type) || 'Personal Project'}</div>
      </div>
      <div class="entry-card-actions">
        <button type="button" class="btn-icon" title="Remove" onclick="removeEntry('${id}', 'project')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button type="button" class="btn-icon toggle" onclick="toggleCard('${id}')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="entry-card-body">
      <div class="fields-grid">
        <div class="field-group"><label>Project Name</label><input type="text" name="name" placeholder="e.g. TIEM EventSphere" value="${esc(data.name)}" /></div>
        <div class="field-group"><label>Role / Type</label><input type="text" name="type" placeholder="e.g. Full Stack Developer / Personal Project" value="${esc(data.type)}" /></div>
        <div class="field-group"><label>Live / GitHub Link</label><input type="text" name="link" placeholder="https://github.com/..." value="${esc(data.link)}" /></div>
        <div class="field-group"><label>Timeline / Date</label><input type="text" name="startDate" placeholder="2023 – Present" value="${esc(data.startDate)}" /></div>
        <div class="field-group full"><label>Project Description</label><textarea name="description" rows="3" placeholder="Key technologies, architecture, and achievements...">${esc(data.description)}</textarea></div>
      </div>
    </div>`;
  const pList = document.getElementById('projectList');
  if (pList) {
    pList.appendChild(card);
    attachEntryListeners(card, 'project', id);
    syncEntry(card, 'project', id);
  }
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
        <div class="entry-card-title">${esc(data.institution) || 'New Education'}</div>
        <div class="entry-card-subtitle">${esc(data.degree) || 'Degree & Institution'}</div>
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
        <div class="field-group"><label>Degree</label><input type="text" name="degree" placeholder="e.g. B.Tech Computer Science" value="${esc(data.degree)}" /></div>
        <div class="field-group"><label>Institution</label><input type="text" name="institution" placeholder="e.g. IIT Bombay" value="${esc(data.institution)}" /></div>
        <div class="field-group"><label>Start Year</label><input type="text" name="startYear" placeholder="2019" value="${esc(data.startYear)}" /></div>
        <div class="field-group"><label>End Year</label><input type="text" name="endYear" placeholder="2023" value="${esc(data.endYear)}" /></div>
        <div class="field-group full"><label>Additional Info</label><input type="text" name="info" placeholder="GPA, honors, relevant coursework..." value="${esc(data.info)}" /></div>
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
  if (type === 'project')    state.projects   = state.projects.filter(e => e._id !== id);
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
      const name        = card.querySelector('[name="name"]');
      const typeInput   = card.querySelector('[name="type"]');
      const degree      = card.querySelector('[name="degree"]');
      const institution = card.querySelector('[name="institution"]');
      if (role && company) {
        titleEl.textContent    = company.value || 'New Experience';
        subtitleEl.textContent = role.value    || 'Role & Company';
      }
      if (name) {
        titleEl.textContent    = name.value      || 'New Project';
        subtitleEl.textContent = (typeInput && typeInput.value) || 'Project Details';
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
  let arr;
  if (type === 'experience') arr = state.experience;
  else if (type === 'project') arr = state.projects;
  else arr = state.education;

  const idx = arr.findIndex(e => e._id === id);
  if (idx > -1) arr[idx] = data; else arr.push(data);
}

// Expose helpers globally
window.addExperience = addExperience;
window.addProject    = addProject;
window.addEducation  = addEducation;
window.state         = state;
window.persistState  = persistState;

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

function renderTagPill(text, key, display) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.dataset.tag = text;

  const textNode = document.createTextNode(text);
  tag.appendChild(textNode);

  const removeBtn = document.createElement('span');
  removeBtn.className = 'tag-remove';
  removeBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeTag(text, key, removeBtn);
  });
  tag.appendChild(removeBtn);

  display.appendChild(tag);
}

function addTag(text, key, display) {
  if (!text || state.skills[key].includes(text)) return;
  state.skills[key].push(text);
  renderTagPill(text, key, display);
  if (key === 'tech') renderProficiencyMapper();
  if (key === 'languages') {
    syncLangProficiencyArray();
    renderLangProficiencyMapper();
  }
  persistState();
}

function removeTag(text, key, el) {
  state.skills[key] = state.skills[key].filter(t => {
    const raw = typeof t === 'string' ? t.replace(/\s*\([^)]*\)$/, '').trim() : '';
    const cleanText = text.replace(/\s*\([^)]*\)$/, '').trim();
    return t !== text && raw !== cleanText;
  });
  el.closest('.tag')?.remove();
  if (key === 'tech') renderProficiencyMapper();
  if (key === 'languages') {
    syncLangProficiencyArray();
    renderLangProficiencyMapper();
  }
  persistState();
}

// ── PROACTIVE SKILL PROFICIENCY MAPPER ──
function parseSkillTag(str) {
  if (!str) return { name: '', level: '' };
  const trimmed = str.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (parenMatch) return { name: parenMatch[1].trim(), level: parenMatch[2].trim() };
  return { name: trimmed, level: '' };
}

function renderProficiencyMapper() {
  const container = document.getElementById('skillProficiencyContainer');
  const list = document.getElementById('skillProficiencyList');
  if (!container || !list) return;

  const tech = state.skills.tech || [];
  if (!tech.length) {
    container.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  list.innerHTML = '';

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  tech.forEach((skillItem, idx) => {
    const { name, level } = parseSkillTag(skillItem);
    const effectiveLevel = level || 'Proficient';
    if (!level) {
      state.skills.tech[idx] = `${name} (${effectiveLevel})`;
    }

    const row = document.createElement('div');
    row.className = 'sp-row';
    const safeName = String(name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    
    row.innerHTML = `
      <div class="sp-skill-label">
        <span>⚡ ${safeName}</span>
      </div>
      <div class="sp-pills">
        ${LEVELS.map(lvl => `
          <button type="button" class="sp-pill ${effectiveLevel.toLowerCase() === lvl.toLowerCase() ? 'active' : ''}" data-idx="${idx}" data-level="${lvl}">
            ${lvl}
          </button>
        `).join('')}
      </div>
    `;

    row.querySelectorAll('.sp-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(btn.dataset.idx, 10);
        const newLevel = btn.dataset.level;
        const current = parseSkillTag(state.skills.tech[targetIdx]);
        state.skills.tech[targetIdx] = `${current.name} (${newLevel})`;
        persistState();
        renderProficiencyMapper();
      });
    });

    list.appendChild(row);
  });
}

function autoLevelAllProficiencies() {
  const tech = state.skills.tech || [];
  state.skills.tech = tech.map((item, idx) => {
    const { name } = parseSkillTag(item);
    if (idx === 0 || idx === 1) return `${name} (Expert)`;
    if (idx === 2 || idx === 3) return `${name} (Advanced)`;
    return `${name} (Intermediate)`;
  });
  persistState();
  renderProficiencyMapper();
}

window.renderProficiencyMapper = renderProficiencyMapper;

const btnAutoProf = document.getElementById('btnAutoMapProficiencies');
if (btnAutoProf) {
  btnAutoProf.addEventListener('click', (e) => {
    e.preventDefault();
    autoLevelAllProficiencies();
  });
}

// ── PROACTIVE LANGUAGE PROFICIENCY MAPPER ──
const LANG_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'];

function renderLangProficiencyMapper() {
  const container = document.getElementById('langProficiencyContainer');
  const list = document.getElementById('langProficiencyList');
  if (!container || !list) return;

  const langs = state.skills.languages || [];
  if (!langs.length) {
    container.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  list.innerHTML = '';

  langs.forEach((langItem, idx) => {
    const { name, level } = parseSkillTag(langItem);
    const effectiveLevel = level || 'Fluent';
    if (!level) {
      state.skills.languages[idx] = `${name} (${effectiveLevel})`;
    }

    const row = document.createElement('div');
    row.className = 'sp-row';
    const safeName = String(name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    
    row.innerHTML = `
      <div class="sp-skill-label">
        <span>🗣️ ${safeName}</span>
      </div>
      <div class="sp-pills">
        ${LANG_LEVELS.map(lvl => `
          <button type="button" class="sp-pill ${effectiveLevel.toLowerCase() === lvl.toLowerCase() ? 'active' : ''}" data-idx="${idx}" data-level="${lvl}">
            ${lvl}
          </button>
        `).join('')}
      </div>
    `;

    row.querySelectorAll('.sp-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(btn.dataset.idx, 10);
        const newLevel = btn.dataset.level;
        const current = parseSkillTag(state.skills.languages[targetIdx]);
        state.skills.languages[targetIdx] = `${current.name} (${newLevel})`;
        syncLangProficiencyArray();
        persistState();
        renderLangProficiencyMapper();
      });
    });

    list.appendChild(row);
  });
}

function autoLevelAllLangProficiencies() {
  const langs = state.skills.languages || [];
  state.skills.languages = langs.map((item, idx) => {
    const { name } = parseSkillTag(item);
    if (idx === 0) return `${name} (Native)`;
    if (idx === 1) return `${name} (Fluent)`;
    if (idx === 2) return `${name} (Conversational)`;
    return `${name} (Basic)`;
  });
  syncLangProficiencyArray();
  persistState();
  renderLangProficiencyMapper();
}

function syncLangProficiencyArray() {
  state.langProficiency = (state.skills.languages || []).map(item => {
    const { name, level } = parseSkillTag(item);
    return { name, overall: level || 'Fluent', speaking: level || 'Fluent', reading: level || 'Fluent', writing: level || 'Fluent' };
  });
}

window.renderLangProficiencyMapper = renderLangProficiencyMapper;

const btnAutoMapLang = document.getElementById('btnAutoMapLangProficiencies');
if (btnAutoMapLang) {
  btnAutoMapLang.addEventListener('click', (e) => {
    e.preventDefault();
    autoLevelAllLangProficiencies();
  });
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
    { label: 'Projects',     value: (state.projects || []).length + ' entr' + ((state.projects || []).length === 1 ? 'y' : 'ies') },
    { label: 'Education',    value: state.education.length  + ' entr' + (state.education.length  === 1 ? 'y' : 'ies') },
    { label: 'Tech Skills',  value: state.skills.tech.join(', ') || null },
    { label: 'Target Role',  value: state.jobDescription.targetRole },
  ];
  grid.innerHTML = items.map(i => `
    <div class="review-item">
      <div class="review-label">${i.label}</div>
      <div class="review-value ${!i.value ? 'empty' : ''}">${i.value || '—'}</div>
    </div>`).join('');

  // ── UPDATE LIVE ATS READINESS WIDGET IN REVIEW ──
  const fBadge = document.getElementById('fAtsBadge');
  if (fBadge) {
    const fullText = `${p.firstName || ''} ${p.lastName || ''} ${p.jobTitle || ''} ${p.email || ''} ${p.summary || ''} ${(state.experience||[]).map(e=>(e.role||'')+' '+(e.description||'')).join(' ')} ${(state.projects||[]).map(pr=>(pr.name||'')+' '+(pr.description||'')).join(' ')} ${(state.skills.tech||[]).join(' ')}`;
    const targetJD = (state.jobDescription && state.jobDescription.jobDescription) || '';

    // Structure
    let struct = 0;
    if (p.email && p.email.includes('@')) struct += 25;
    if (p.phone) struct += 15;
    if (state.experience.length > 0) struct += 30;
    if (state.education.length > 0) struct += 15;
    if (state.skills.tech.length >= 3) struct += 15;

    // Metrics / Impact
    const metricMatches = fullText.match(/\b\d+(\.\d+)?\s*%|\b\d{1,3}(,\d{3})*(\.\d+)?\s*([kKmMbB]|\+)?\s*(users|clients|requests|queries|downloads|records|visits|subscribers|transactions|accounts|sessions)|\$[\d,]+|\b\d+(\.\d+)?\s*(ms|x|fold|fps)\b/gi) || [];
    const actionVerbMatches = fullText.match(/\b(architected|engineered|spearheaded|orchestrated|streamlined|automated|scaled|deployed|refactored|designed|optimized|reduced|increased|improved|delivered|built)\b/gi) || [];
    const impact = Math.min(100, Math.round((metricMatches.length * 20) + (actionVerbMatches.length * 8)));

    // Readability
    const words = fullText.match(/\b[A-Za-z0-9'-]+\b/g) || [];
    let read = 60;
    if (words.length >= 150 && words.length <= 800) read = 95;
    else if (words.length > 800) read = 80;
    else if (words.length >= 60) read = 75;
    else read = 45;

    // Keywords
    let kw = 75;
    if (targetJD && targetJD.length > 20) {
      const rawJD = targetJD.toLowerCase().match(/\b[a-z0-9#\+\.\/\-]{2,}\b/g) || [];
      const stopWords = new Set(['the','and','with','for','that','this','from','are','will','have','our','your','role','responsibilities','experience','looking','seeking','skills']);
      const jdKws = [...new Set(rawJD.filter(w => !stopWords.has(w) && !/^\d+$/.test(w)))];
      if (jdKws.length > 0) {
        const resumeLower = fullText.toLowerCase();
        let matched = 0;
        jdKws.forEach(k => { if (resumeLower.includes(k)) matched++; });
        kw = Math.min(100, Math.max(15, Math.round((matched / jdKws.length) * 100)));
      }
    } else {
      kw = Math.min(95, Math.max(35, state.skills.tech.length * 12));
    }

    const overall = Math.round((kw * 0.35) + (read * 0.25) + (impact * 0.20) + (struct * 0.20));

    fBadge.textContent = `${overall}%`;
    const fFill = document.getElementById('fAtsFill');
    if (fFill) {
      fFill.style.width = `${overall}%`;
      if (overall >= 85) {
        fFill.style.background = '#10b981';
        fBadge.style.color = '#10b981';
      } else if (overall >= 65) {
        fFill.style.background = '#f59e0b';
        fBadge.style.color = '#f59e0b';
      } else {
        fFill.style.background = '#ef4444';
        fBadge.style.color = '#ef4444';
      }
    }

    const fSub = document.getElementById('fAtsSubtitle');
    if (fSub) {
      if (overall >= 85) fSub.textContent = 'ATS High Pass Rate';
      else if (overall >= 65) fSub.textContent = 'Moderate Match — Boost Keywords';
      else fSub.textContent = 'Action Required';
    }

    const fKw = document.getElementById('fAtsKeywords');
    if (fKw) fKw.textContent = `${kw}%`;
    const fRd = document.getElementById('fAtsReadability');
    if (fRd) fRd.textContent = `${read}%`;
    const fImp = document.getElementById('fAtsImpact');
    if (fImp) fImp.textContent = `${impact}%`;
    const fSt = document.getElementById('fAtsStructure');
    if (fSt) fSt.textContent = `${struct}%`;
  }
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
          projects:       state.projects,
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
    const restored = loadFromStorage();
    if (!restored) {
      addExperience();
      addEducation();
    }
  }
}

// ── RESTORE FROM LOCALSTORAGE ──
function loadFromStorage() {
  let saved = null;
  try {
    const raw = localStorage.getItem('resumatic_state');
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse resumatic_state:', e);
  }
  if (!saved) return false;

  const hasData = (saved.personal && Object.values(saved.personal).some(Boolean)) ||
                  (Array.isArray(saved.experience) && saved.experience.length > 0) ||
                  (Array.isArray(saved.education) && saved.education.length > 0) ||
                  (saved.skills && ((saved.skills.tech && saved.skills.tech.length) || (saved.skills.soft && saved.skills.soft.length) || (saved.skills.languages && saved.skills.languages.length))) ||
                  (saved.jobDescription && (saved.jobDescription.targetRole || saved.jobDescription.jobDescription));
  if (!hasData) return false;

  if (saved.deletedSegments) {
    state.deletedSegments = saved.deletedSegments;
  }

  // 1. Personal Info
  if (saved.personal) {
    state.personal = { ...saved.personal };
    const pKeys = ['firstName', 'lastName', 'jobTitle', 'email', 'phone', 'location', 'linkedin', 'summary'];
    pKeys.forEach(k => {
      const el = document.getElementById(k);
      if (el && saved.personal[k] !== undefined) {
        el.value = saved.personal[k];
      }
    });
  }

  // 2. Experience
  const expList = document.getElementById('experienceList');
  if (expList) expList.innerHTML = '';
  state.experience = [];
  if (Array.isArray(saved.experience) && saved.experience.length > 0) {
    saved.experience.forEach(exp => addExperience(exp));
  } else {
    addExperience();
  }

  // 3. Education
  const eduList = document.getElementById('educationList');
  if (eduList) eduList.innerHTML = '';
  state.education = [];
  if (Array.isArray(saved.education) && saved.education.length > 0) {
    saved.education.forEach(edu => addEducation(edu));
  } else {
    addEducation();
  }

  // Projects
  if (Array.isArray(saved.projects)) {
    const seenP = new Set();
    const cleanProjects = saved.projects.filter(p => {
      if (!p) return false;
      const sig = (p.name || p.title || '').trim().toLowerCase();
      if (!sig || seenP.has(sig)) return false;
      seenP.add(sig);
      return true;
    });
    state.projects = [];
    const pList = document.getElementById('projectList');
    if (pList) {
      pList.innerHTML = '';
      cleanProjects.forEach(p => addProject(p));
    } else {
      state.projects = cleanProjects;
    }
  }

  // 4. Skills & Proficiencies
  if (saved.skills) {
    state.skills.tech = Array.isArray(saved.skills.tech) ? [...saved.skills.tech] : [];
    state.skills.soft = Array.isArray(saved.skills.soft) ? [...saved.skills.soft] : [];
    state.skills.languages = Array.isArray(saved.skills.languages) ? [...saved.skills.languages] : [];

    const techDisplay = document.getElementById('techTagsDisplay');
    if (techDisplay) {
      techDisplay.innerHTML = '';
      state.skills.tech.forEach(t => renderTagPill(t, 'tech', techDisplay));
    }

    const softDisplay = document.getElementById('softTagsDisplay');
    if (softDisplay) {
      softDisplay.innerHTML = '';
      state.skills.soft.forEach(s => renderTagPill(s, 'soft', softDisplay));
    }

    const langDisplay = document.getElementById('langTagsDisplay');
    if (langDisplay) {
      langDisplay.innerHTML = '';
      state.skills.languages.forEach(l => renderTagPill(l, 'languages', langDisplay));
    }

    renderProficiencyMapper();
    renderLangProficiencyMapper();
  }

  // 5. Job Description & Target Role
  if (saved.jobDescription) {
    state.jobDescription = { ...saved.jobDescription };
    const tr = document.getElementById('targetRole');
    if (tr && saved.jobDescription.targetRole) tr.value = saved.jobDescription.targetRole;
    const jd = document.getElementById('jobDescription');
    if (jd && saved.jobDescription.jobDescription) jd.value = saved.jobDescription.jobDescription;
  }

  // 6. Tone
  if (saved.tone) {
    state.tone = saved.tone;
    const toneRadio = document.querySelector(`input[name="tone"][value="${saved.tone}"]`);
    if (toneRadio) toneRadio.checked = true;
  }

  return true;
}

// Auto-save on any input across form
document.addEventListener('input', (e) => {
  if (e.target.matches('input, textarea, select')) {
    persistState();
  }
});

window.addEventListener('beforeunload', () => {
  persistState();
});

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
