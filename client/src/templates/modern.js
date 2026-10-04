/**
 * Modern Resume Template Renderer
 */

import { escapeHTML as esc, sanitizeRichText } from '../utils/dom.js';

export function renderModernTemplate(state, helpers = {}) {
  const p = state.personal || {};
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');

  const setTextEmpty = helpers.setTextEmpty || ((id, value, placeholder, editPath) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (document.activeElement !== el) {
      el.textContent = value || placeholder;
    }
    el.classList.toggle('empty', !value);
    el.setAttribute('data-canva-editable', 'true');
    if (editPath) el.dataset.editPath = editPath;
  });

  const renderSkillTags = helpers.renderSkillTags || (() => {});

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

  renderSkillTags('mo_techSkills', (state.skills && state.skills.tech) || [], 'mo-tag');
  renderSkillTags('mo_softSkills', (state.skills && state.skills.soft) || [], 'mo-tag');
  renderSkillTags('mo_languages',  (state.skills && state.skills.languages) || [], 'mo-tag');

  renderModernExperience(state.experience || []);
  renderModernProjects(state.projects || []);
  renderModernEducation(state.education || []);
}

export function renderModernExperience(experience) {
  const c = document.getElementById('mo_experience');
  if (!c) return;
  const entries = experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="mo-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map((e, ei) => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title" data-canva-editable="true" data-edit-path="experience.${ei}.role">${sanitizeRichText(e.role) || '—'}</span>
        ${[e.startDate, e.endDate].filter(Boolean).length ? `<span class="mo-entry-date" data-canva-editable="true" data-edit-path="experience.${ei}.dates">${[esc(e.startDate), esc(e.endDate)].filter(Boolean).join(' – ')}</span>` : ''}
      </div>
      <div class="mo-entry-sub" data-canva-editable="true" data-edit-path="experience.${ei}.company">${sanitizeRichText(e.company)}</div>
      ${e.description ? `<div class="mo-entry-desc" data-canva-editable="true" data-edit-path="experience.${ei}.description">${sanitizeRichText(e.description)}</div>` : ''}
    </div>`).join('');
}

export function renderModernProjects(projects) {
  const c = document.getElementById('mo_projects');
  const sec = document.getElementById('moProjectsSection');
  if (!c) return;
  const entries = projects.filter(p => p.name || p.title);
  if (sec) sec.style.display = entries.length ? 'block' : 'none';
  if (!entries.length) { c.innerHTML = ''; return; }
  c.innerHTML = entries.map((p, pi) => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title" data-canva-editable="true" data-edit-path="projects.${pi}.name">${sanitizeRichText(p.name || p.title) || '—'}</span>
        ${p.startDate ? `<span class="mo-entry-date" data-canva-editable="true" data-edit-path="projects.${pi}.startDate">${sanitizeRichText(p.startDate)}</span>` : ''}
      </div>
      <div class="mo-entry-sub" data-canva-editable="true" data-edit-path="projects.${pi}.type">${[sanitizeRichText(p.type || 'Personal Project'), p.link ? `<a href="${esc(p.link)}" target="_blank" style="color:var(--accent2);text-decoration:none;">Link ↗</a>` : ''].filter(Boolean).join(' • ')}</div>
      ${p.description ? `<div class="mo-entry-desc" data-canva-editable="true" data-edit-path="projects.${pi}.description">${sanitizeRichText(p.description)}</div>` : ''}
    </div>`).join('');
}

export function renderModernEducation(education) {
  const c = document.getElementById('mo_education');
  if (!c) return;
  const entries = education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="mo-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map((e, di) => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title" data-canva-editable="true" data-edit-path="education.${di}.degree">${sanitizeRichText(e.degree) || '—'}</span>
        ${[e.startYear, e.endYear].filter(Boolean).length ? `<span class="mo-entry-date" data-canva-editable="true" data-edit-path="education.${di}.dates">${[esc(e.startYear), esc(e.endYear)].filter(Boolean).join(' – ')}</span>` : ''}
      </div>
      <div class="mo-entry-sub" data-canva-editable="true" data-edit-path="education.${di}.institution">${sanitizeRichText(e.institution)}</div>
      ${e.details ? `<div class="mo-entry-desc" data-canva-editable="true" data-edit-path="education.${di}.details">${sanitizeRichText(e.details)}</div>` : ''}
    </div>`).join('');
}
