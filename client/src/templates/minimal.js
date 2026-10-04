/**
 * Minimal Resume Template Renderer
 */

import { escapeHTML as esc, sanitizeRichText } from '../utils/dom.js';

export function renderMinimalTemplate(state, helpers = {}) {
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
      sum.textContent = p.summary || 'Your professional summary will appear here.';
    }
    sum.setAttribute('data-canva-editable', 'true');
    sum.dataset.editPath = 'personal.summary';
  }

  renderSkillTags('mn_techSkills', (state.skills && state.skills.tech) || [], 'mn-tag');
  renderSkillTags('mn_softSkills', (state.skills && state.skills.soft) || [], 'mn-tag');
  renderSkillTags('mn_languages',  (state.skills && state.skills.languages) || [], 'mn-tag');

  renderMinimalExperience(state.experience || []);
  renderMinimalProjects(state.projects || []);
  renderMinimalEducation(state.education || []);
}

export function renderMinimalExperience(experience) {
  const c = document.getElementById('mn_experience');
  if (!c) return;
  const entries = experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="mn-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map((e, ei) => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title" data-canva-editable="true" data-edit-path="experience.${ei}.role">${sanitizeRichText(e.role) || '—'}</span>
        <span class="mn-entry-date" data-canva-editable="true" data-edit-path="experience.${ei}.dates">${[esc(e.startDate), esc(e.endDate)].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="mn-entry-sub" data-canva-editable="true" data-edit-path="experience.${ei}.company">${sanitizeRichText(e.company)}</div>
      ${e.description ? `<div class="mn-entry-desc" data-canva-editable="true" data-edit-path="experience.${ei}.description">${sanitizeRichText(e.description)}</div>` : ''}
    </div>`).join('');
}

export function renderMinimalProjects(projects) {
  const c = document.getElementById('mn_projects');
  const sec = document.getElementById('mnProjectsSection');
  if (!c) return;
  const entries = projects.filter(p => p.name || p.title);
  if (sec) sec.style.display = entries.length ? 'grid' : 'none';
  if (!entries.length) { c.innerHTML = ''; return; }
  c.innerHTML = entries.map((p, pi) => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title" data-canva-editable="true" data-edit-path="projects.${pi}.name">${sanitizeRichText(p.name || p.title) || '—'}</span>
        ${p.startDate ? `<span class="mn-entry-date" data-canva-editable="true" data-edit-path="projects.${pi}.startDate">${sanitizeRichText(p.startDate)}</span>` : ''}
      </div>
      <div class="mn-entry-sub" data-canva-editable="true" data-edit-path="projects.${pi}.type">${[sanitizeRichText(p.type || 'Personal Project'), p.link ? `<a href="${esc(p.link)}" target="_blank" style="color:#475569;text-decoration:underline;">Link ↗</a>` : ''].filter(Boolean).join(' • ')}</div>
      ${p.description ? `<div class="mn-entry-desc" data-canva-editable="true" data-edit-path="projects.${pi}.description">${sanitizeRichText(p.description)}</div>` : ''}
    </div>`).join('');
}

export function renderMinimalEducation(education) {
  const c = document.getElementById('mn_education');
  if (!c) return;
  const entries = education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="mn-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map((e, di) => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title" data-canva-editable="true" data-edit-path="education.${di}.degree">${sanitizeRichText(e.degree) || '—'}</span>
        <span class="mn-entry-date" data-canva-editable="true" data-edit-path="education.${di}.dates">${[esc(e.startYear), esc(e.endYear)].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="mn-entry-sub" data-canva-editable="true" data-edit-path="education.${di}.institution">${sanitizeRichText(e.institution)}</div>
      ${e.details ? `<div class="mn-entry-desc" data-canva-editable="true" data-edit-path="education.${di}.details">${sanitizeRichText(e.details)}</div>` : ''}
    </div>`).join('');
}
