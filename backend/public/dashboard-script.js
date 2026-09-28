// ══════════════════════════════════════════════════════
//  RESUMATIC — Dashboard Script
// ══════════════════════════════════════════════════════

const API = '/api/dashboard';

// ── STATE ──
let pendingDelete = null; // { type: 'resume'|'coverletter', id }

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModal();
  loadAll();
});

// ══════════════════════════════════════════════════════
//  LOAD ALL
// ══════════════════════════════════════════════════════
async function loadAll() {
  showSkeletons();
  const [resumes, coverLetters] = await Promise.all([
    fetchResumes(),
    fetchCoverLetters(),
  ]);
  renderResumes(resumes);
  renderCoverLetters(coverLetters);
  updateStats(resumes.length, coverLetters.length);
}

async function fetchResumes() {
  try {
    const res  = await fetch(`${API}/resumes`);
    const data = await res.json();
    return data.success ? data.resumes : [];
  } catch {
    return [];
  }
}

async function fetchCoverLetters() {
  try {
    const res  = await fetch(`${API}/cover-letters`);
    const data = await res.json();
    return data.success ? data.coverLetters : [];
  } catch {
    return [];
  }
}

// ══════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════
function updateStats(rCount, clCount) {
  document.getElementById('statResumes').textContent = rCount;
  document.getElementById('statCLs').textContent     = clCount;
}

// ══════════════════════════════════════════════════════
//  RENDER RESUMES
// ══════════════════════════════════════════════════════
function renderResumes(resumes) {
  const grid  = document.getElementById('resumeGrid');
  const empty = document.getElementById('resumeEmpty');
  grid.innerHTML = '';

  if (!resumes.length) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  resumes.forEach(r => {
    const card = buildResumeCard(r);
    grid.appendChild(card);
  });
}

function buildResumeCard(r) {
  const card = document.createElement('div');
  card.className = 'resume-card';
  card.dataset.id = r._id;

  const scale    = 200 / 1123;
  const scaledW  = 794 * scale;

  const preview  = buildMiniResume(r);
  const dateStr  = formatDate(r.createdAt);
  const fullName = [r.personal?.firstName, r.personal?.lastName].filter(Boolean).join(' ') || 'Untitled';
  const jobTitle = r.personal?.jobTitle || '';
  const title    = r.title || fullName;

  card.innerHTML = `
    <div class="card-preview">
      <div class="card-preview-inner" style="transform: scale(${scale.toFixed(4)}); width:794px;"></div>
      <div class="card-preview-overlay"></div>
    </div>
    <div class="card-info">
      <div class="card-title" title="${esc(title)}">${esc(title)}</div>
      <div class="card-meta">
        <span>${dateStr}</span>
        <span class="card-template-badge">${r.template || 'classic'}</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn-card btn-edit" data-id="${r._id}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L3 11H1v-2L8.5 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        Edit
      </button>
      <button class="btn-card btn-download" data-id="${r._id}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1.5 10h9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        PDF
      </button>
      <button class="btn-card btn-delete" data-id="${r._id}" data-title="${esc(title)}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Delete
      </button>
    </div>`;

  // inject preview DOM
  const innerEl = card.querySelector('.card-preview-inner');
  innerEl.appendChild(preview);

  // button listeners
  card.querySelector('.btn-edit').addEventListener('click', () => editResume(r._id));
  card.querySelector('.btn-download').addEventListener('click', () => downloadResume(r._id));
  card.querySelector('.btn-delete').addEventListener('click', () => confirmDelete('resume', r._id, title));

  return card;
}

// ══════════════════════════════════════════════════════
//  MINI RESUME BUILDER (scaled HTML preview)
// ══════════════════════════════════════════════════════
function buildMiniResume(r) {
  const tpl = r.template || 'classic';
  const p   = r.personal || {};
  const exp = r.experience || [];
  const edu = r.education  || [];
  const sk  = r.skills     || { tech: [], soft: [], languages: [] };

  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';
  const contact  = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);

  const expHTML = exp.filter(e => e.role || e.company).map(e => `
    <div class="m-entry">
      <div class="m-entry-top">
        <span class="m-entry-title">${esc(e.role)}</span>
        <span class="m-entry-date">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="m-entry-sub">${esc(e.company)}</div>
      ${e.description ? `<div class="m-entry-desc">${esc(e.description)}</div>` : ''}
    </div>`).join('') || '<div class="m-entry" style="color:#999;font-size:10px">No experience added.</div>';

  const eduHTML = edu.filter(e => e.degree || e.institution).map(e => `
    <div class="m-entry">
      <div class="m-entry-top">
        <span class="m-entry-title">${esc(e.degree)}</span>
        <span class="m-entry-date">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="m-entry-sub">${esc(e.institution)}</div>
    </div>`).join('') || '<div class="m-entry" style="color:#999;font-size:10px">No education added.</div>';

  const wrapper = document.createElement('div');
  wrapper.className = `mini-resume mini-${tpl}`;

  if (tpl === 'classic') {
    const tagsHTML = [...(sk.tech || []), ...(sk.soft || [])].slice(0, 10)
      .map(t => `<span class="m-skill-tag">${esc(t)}</span>`).join('');
    wrapper.innerHTML = `
      <div class="m-header">
        <div class="m-name">${esc(fullName)}</div>
        <div class="m-title">${esc(p.jobTitle || '')}</div>
        <div class="m-contact">${contact.map(c => `<span>${esc(c)}</span>`).join('')}</div>
      </div>
      ${p.summary ? `<div class="m-section"><div class="m-section-title">Profile</div><div class="m-body">${esc(p.summary)}</div></div>` : ''}
      <div class="m-section"><div class="m-section-title">Experience</div>${expHTML}</div>
      <div class="m-section"><div class="m-section-title">Education</div>${eduHTML}</div>
      ${tagsHTML ? `<div class="m-section"><div class="m-section-title">Skills</div><div class="m-skill-tags">${tagsHTML}</div></div>` : ''}`;
  }

  if (tpl === 'modern') {
    const initials = [p.firstName, p.lastName].filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?';
    const sbTechTags = (sk.tech || []).slice(0, 6).map(t => `<span class="m-tag">${esc(t)}</span>`).join('');
    const sbSoftTags = (sk.soft || []).slice(0, 4).map(t => `<span class="m-tag">${esc(t)}</span>`).join('');
    wrapper.innerHTML = `
      <div class="m-sidebar">
        <div class="m-avatar">${esc(initials)}</div>
        <div class="m-name">${esc(fullName)}</div>
        <div class="m-title">${esc(p.jobTitle || '')}</div>
        <div class="m-sb-section"><div class="m-sb-title">Contact</div>
          ${contact.map(c => `<div class="m-sb-item">${esc(c)}</div>`).join('')}
        </div>
        ${sbTechTags ? `<div class="m-sb-section"><div class="m-sb-title">Technical</div>${sbTechTags}</div>` : ''}
        ${sbSoftTags ? `<div class="m-sb-section"><div class="m-sb-title">Soft Skills</div>${sbSoftTags}</div>` : ''}
      </div>
      <div class="m-main">
        ${p.summary ? `<div class="m-section"><div class="m-section-title">Profile</div><div class="m-body">${esc(p.summary)}</div></div>` : ''}
        <div class="m-section"><div class="m-section-title">Experience</div>${expHTML}</div>
        <div class="m-section"><div class="m-section-title">Education</div>${eduHTML}</div>
      </div>`;
  }

  if (tpl === 'minimal') {
    const allTags = [...(sk.tech || []), ...(sk.soft || [])].slice(0, 8)
      .map(t => `<span class="m-tag">${esc(t)}</span>`).join('');
    wrapper.innerHTML = `
      <div class="m-header">
        <div>
          <div class="m-name">${esc(fullName)}</div>
          <div class="m-title">${esc(p.jobTitle || '')}</div>
        </div>
        <div class="m-contact">${contact.map(c => `<div>${esc(c)}</div>`).join('')}</div>
      </div>
      <hr class="m-rule" />
      ${p.summary ? `<div class="m-row"><div class="m-label">Profile</div><div class="m-content"><div class="m-body">${esc(p.summary)}</div></div></div>` : ''}
      <div class="m-row"><div class="m-label">Experience</div><div class="m-content">${expHTML}</div></div>
      <div class="m-row"><div class="m-label">Education</div><div class="m-content">${eduHTML}</div></div>
      ${allTags ? `<div class="m-row"><div class="m-label">Skills</div><div class="m-content">${allTags}</div></div>` : ''}`;
  }

  return wrapper;
}

// ══════════════════════════════════════════════════════
//  RENDER COVER LETTERS
// ══════════════════════════════════════════════════════
function renderCoverLetters(list) {
  const container = document.getElementById('clList');
  const empty     = document.getElementById('clEmpty');
  container.innerHTML = '';

  if (!list.length) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  list.forEach(cl => {
    const row = buildCLRow(cl);
    container.appendChild(row);
  });
}

function buildCLRow(cl) {
  const row      = document.createElement('div');
  row.className  = 'cl-row';
  row.dataset.id = cl._id;

  const dateStr = formatDate(cl.createdAt);
  const title   = cl.title || 'Untitled Cover Letter';

  row.innerHTML = `
    <div class="cl-row-icon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M2 7l7 4.5 7-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    </div>
    <div class="cl-row-body">
      <div class="cl-row-title" title="${esc(title)}">${esc(title)}</div>
      <div class="cl-row-meta">
        <span>${dateStr}</span>
        ${cl.targetRole ? `<span>→ ${esc(cl.targetRole)}</span>` : ''}
        <span class="cl-tone-badge">${esc(cl.tone || 'professional')}</span>
      </div>
    </div>
    <div class="cl-row-actions">
      <button class="btn-cl-row btn-copy" data-id="${cl._id}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M3 8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        Copy
      </button>
      <button class="btn-cl-row btn-delete" data-id="${cl._id}" data-title="${esc(title)}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Delete
      </button>
    </div>`;

  row.querySelector('.btn-copy').addEventListener('click',   () => copyCL(cl.content, row.querySelector('.btn-copy')));
  row.querySelector('.btn-delete').addEventListener('click', () => confirmDelete('coverletter', cl._id, title));

  return row;
}

// ══════════════════════════════════════════════════════
//  ACTIONS — RESUME
// ══════════════════════════════════════════════════════
function editResume(id) {
  window.location.href = `preview.html?resumeId=${id}`;
}

async function downloadResume(id) {
  window.location.href = `preview.html?resumeId=${id}&download=true`;
}

// ══════════════════════════════════════════════════════
//  ACTIONS — COVER LETTER
// ══════════════════════════════════════════════════════
function copyCL(content, btn) {
  if (!content) return;
  navigator.clipboard.writeText(content).then(() => {
    const orig = btn.innerHTML;
    btn.textContent = 'Copied ✓';
    btn.style.color = 'var(--green)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.color = '';
    }, 2000);
  });
}

// ══════════════════════════════════════════════════════
//  DELETE MODAL
// ══════════════════════════════════════════════════════
function initModal() {
  document.getElementById('btnModalCancel').addEventListener('click',  closeModal);
  document.getElementById('btnModalConfirm').addEventListener('click', executeDelete);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });
}

function confirmDelete(type, id, title) {
  pendingDelete = { type, id };
  const body = type === 'resume'
    ? `Delete "<strong>${esc(title)}</strong>"? All linked cover letters will also be removed. This cannot be undone.`
    : `Delete "<strong>${esc(title)}</strong>"? This cannot be undone.`;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalBackdrop').classList.add('visible');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('visible');
  pendingDelete = null;
}

async function executeDelete() {
  if (!pendingDelete) return;
  const { type, id } = pendingDelete;
  const btn = document.getElementById('btnModalConfirm');
  btn.classList.add('loading');
  btn.textContent = 'Deleting…';

  try {
    const endpoint = type === 'resume'
      ? `${API}/resumes/${id}`
      : `${API}/cover-letters/${id}`;

    const res  = await fetch(endpoint, { method: 'DELETE' });
    const data = await res.json();

    if (!data.success) throw new Error(data.message || 'Delete failed');

    closeModal();
    showToast(type === 'resume' ? 'Resume deleted.' : 'Cover letter deleted.', 'success');

    // remove card/row from DOM
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0';
      el.style.transform = type === 'resume' ? 'scale(0.95)' : 'translateX(-16px)';
      setTimeout(() => {
        el.remove();
        // update stats & check empty
        refreshEmptyStates();
      }, 300);
    }

  } catch (err) {
    showToast(err.message || 'Something went wrong.', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.textContent = 'Delete';
  }
}

function refreshEmptyStates() {
  const resumeGrid   = document.getElementById('resumeGrid');
  const clList       = document.getElementById('clList');
  const resumeEmpty  = document.getElementById('resumeEmpty');
  const clEmpty      = document.getElementById('clEmpty');

  const rCount = resumeGrid.querySelectorAll('.resume-card').length;
  const cCount = clList.querySelectorAll('.cl-row').length;

  resumeEmpty.style.display = rCount === 0 ? 'flex' : 'none';
  clEmpty.style.display     = cCount === 0 ? 'flex' : 'none';
  updateStats(rCount, cCount);
}

// ══════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab === 'resumes' ? 'tabResumes' : 'tabCoverLetters';
      document.getElementById(target).classList.add('active');
    });
  });
}

// ══════════════════════════════════════════════════════
//  SKELETON LOADING
// ══════════════════════════════════════════════════════
function showSkeletons() {
  const grid = document.getElementById('resumeGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    grid.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-preview"><div class="skeleton"></div></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-meta"></div>
        </div>
        <div class="skeleton-actions">
          <div class="skeleton skeleton-btn"></div>
          <div class="skeleton skeleton-btn"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>`;
  }
}

// ══════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type} visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
