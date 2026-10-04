/**
 * Classic Resume Template Renderer
 */

import { escapeHTML as esc, sanitizeRichText } from '../utils/dom.js';

export function renderClassicTemplate(state, helpers = {}) {
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

  setTextEmpty('cl_name', full, 'Your Name', 'personal.name');
  setTextEmpty('cl_title', p.title, 'Professional Title', 'personal.title');

  const contactFields = [
    { key: 'email', val: p.email },
    { key: 'phone', val: p.phone },
    { key: 'location', val: p.location },
    { key: 'linkedin', val: p.linkedin },
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

  renderClassicExperience(state.experience || []);
  renderClassicProjects(state.projects || []);
  renderClassicEducation(state.education || []);

  renderSkillTags('cl_techSkills', (state.skills && state.skills.tech) || [], 'cl-skill-tag');
  renderSkillTags('cl_softSkills', (state.skills && state.skills.soft) || [], 'cl-skill-tag');
  renderSkillTags('cl_languages',  (state.skills && state.skills.languages) || [], 'cl-skill-tag');
}

export function renderClassicExperience(experience) {
  const c = document.getElementById('cl_experience');
  if (!c) return;
  const entries = experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="cl-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map((e, ei) => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title" data-canva-editable="true" data-edit-path="experience.${ei}.role">${sanitizeRichText(e.role) || '—'}</span>
        <span class="cl-entry-date" data-canva-editable="true" data-edit-path="experience.${ei}.dates">${[esc(e.startDate), esc(e.endDate)].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="cl-entry-sub" data-canva-editable="true" data-edit-path="experience.${ei}.company">${sanitizeRichText(e.company)}</div>
      ${e.description ? `<div class="cl-entry-desc" data-canva-editable="true" data-edit-path="experience.${ei}.description">${sanitizeRichText(e.description)}</div>` : ''}
    </div>`).join('');
}

export function renderClassicProjects(projects) {
  const c = document.getElementById('cl_projects');
  const sec = document.getElementById('clProjectsSection');
  if (!c) return;
  const entries = projects.filter(p => p.name || p.title);
  if (sec) sec.style.display = entries.length ? 'block' : 'none';
  if (!entries.length) { c.innerHTML = ''; return; }
  c.innerHTML = entries.map((p, pi) => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title" data-canva-editable="true" data-edit-path="projects.${pi}.name">${sanitizeRichText(p.name || p.title) || '—'}</span>
        ${p.startDate ? `<span class="cl-entry-date" data-canva-editable="true" data-edit-path="projects.${pi}.startDate">${sanitizeRichText(p.startDate)}</span>` : ''}
      </div>
      <div class="cl-entry-sub" data-canva-editable="true" data-edit-path="projects.${pi}.type">${[sanitizeRichText(p.type || 'Personal Project'), p.link ? `<a href="${esc(p.link)}" target="_blank" style="color:inherit;text-decoration:underline;">Link ↗</a>` : ''].filter(Boolean).join(' • ')}</div>
      ${p.description ? `<div class="cl-entry-desc" data-canva-editable="true" data-edit-path="projects.${pi}.description">${sanitizeRichText(p.description)}</div>` : ''}
    </div>`).join('');
}

export function renderClassicEducation(education) {
  const c = document.getElementById('cl_education');
  if (!c) return;
  const entries = education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="cl-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map((e, di) => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title" data-canva-editable="true" data-edit-path="education.${di}.degree">${sanitizeRichText(e.degree) || '—'}</span>
        <span class="cl-entry-date" data-canva-editable="true" data-edit-path="education.${di}.dates">${[esc(e.startYear), esc(e.endYear)].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="cl-entry-sub" data-canva-editable="true" data-edit-path="education.${di}.institution">${sanitizeRichText(e.institution)}</div>
      ${e.details ? `<div class="cl-entry-desc" data-canva-editable="true" data-edit-path="education.${di}.details">${sanitizeRichText(e.details)}</div>` : ''}
    </div>`).join('');
}
