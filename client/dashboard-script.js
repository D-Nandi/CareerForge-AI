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
  const [resumes, coverLetters, roadmap, subData] = await Promise.all([
    fetchResumes(),
    fetchCoverLetters(),
    fetchRoadmap(),
    fetchSubscription(),
  ]);
  renderResumes(resumes);
  renderCoverLetters(coverLetters);
  renderDashboardRoadmap(roadmap);
  renderDashboardSubscription(subData);
  updateStats(resumes.length, coverLetters.length, roadmap, subData?.tier);
  loadReferralData();

  // Check URL params for post-checkout success
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('upgraded') === 'true') {
    showToast('🎉 Plan upgrade active! Your premium capabilities are ready.', 'success');
    switchTab('plan');
  }
}

async function fetchResumes() {
  try {
    const res  = await fetch(`${API}/resumes`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.resumes : [];
  } catch {
    return [];
  }
}

async function fetchCoverLetters() {
  try {
    const res  = await fetch(`${API}/cover-letters`, { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.coverLetters : [];
  } catch {
    return [];
  }
}

async function fetchRoadmap() {
  try {
    const res  = await fetch('/api/roadmap/my', { credentials: 'include' });
    const data = await res.json();
    return data.success ? data.roadmap : null;
  } catch {
    return null;
  }
}

async function fetchSubscription() {
  try {
    const res = await fetch('/api/payments/my-subscription', { credentials: 'include' });
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════
function updateStats(rCount, clCount, roadmap, tier = 'free') {
  const elR = document.getElementById('statResumes');
  const elC = document.getElementById('statCLs');
  const elRoadmap = document.getElementById('statRoadmapPhase');
  const elTier = document.getElementById('statTier');

  if (elR) elR.textContent = rCount;
  if (elC) elC.textContent = clCount;
  if (elTier) {
    if (tier === 'career_plus') elTier.textContent = 'Career+';
    else if (tier === 'pro') elTier.textContent = 'Pro';
    else elTier.textContent = 'Free';
  }
  if (elRoadmap) {
    if (roadmap && roadmap.phases && roadmap.phases.length) {
      const doneMilestones = (roadmap.milestones || []).filter(m => m.completed).length;
      elRoadmap.textContent = `${doneMilestones}/${roadmap.milestones.length} Done`;
    } else {
      elRoadmap.textContent = 'None';
    }
  }
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
      const tabKey = btn.dataset.tab;
      const targetMap = {
        resumes: 'tabResumes',
        coverletters: 'tabCoverLetters',
        roadmap: 'tabRoadmap',
        plan: 'tabPlan'
      };
      const target = targetMap[tabKey] || 'tabResumes';
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
}

function switchTab(tabKey) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabKey}"]`);
  if (btn) btn.click();
}

// ══════════════════════════════════════════════════════
//  RENDER ROADMAP IN DASHBOARD
// ══════════════════════════════════════════════════════
function renderDashboardRoadmap(roadmap) {
  const content = document.getElementById('roadmapDashboardContent');
  const empty = document.getElementById('roadmapEmpty');
  if (!content || !empty) return;

  if (!roadmap || !roadmap.phases || !roadmap.phases.length) {
    empty.style.display = 'flex';
    content.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  content.style.display = 'block';

  const doneCount = (roadmap.milestones || []).filter(m => m.completed).length;
  const totalMilestones = (roadmap.milestones || []).length;
  const progressPercent = totalMilestones > 0 ? Math.round((doneCount / totalMilestones) * 100) : 0;

  const milestonesHtml = (roadmap.milestones || []).map(m => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--radius-sm); background: var(--surface); margin-bottom: 8px; border: 1px solid var(--border);">
      <input type="checkbox" id="dash_m_${m.id}" ${m.completed ? 'checked' : ''} style="cursor: pointer;" />
      <label for="dash_m_${m.id}" style="cursor: pointer; flex: 1; font-size: 13px; color: ${m.completed ? 'var(--text-muted)' : 'var(--text)'}; text-decoration: ${m.completed ? 'line-through' : 'none'};">${esc(m.text)}</label>
      <span class="badge badge-primary" style="font-size: 10px;">Phase ${m.phase}</span>
    </div>
  `).join('');

  const phasesSummaryHtml = (roadmap.phases || []).map(p => `
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
        <strong style="font-family: var(--font-head); font-size: 15px; color: var(--text);">${esc(p.label)}</strong>
        <span class="badge ${p.phaseNumber === 1 ? 'badge-success' : 'badge-primary'}" style="font-size: 10px;">${esc(p.duration)}</span>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px;">${esc(p.focus)}</p>
      <div class="keyword-chips">
        ${(p.skills || []).map(s => `<span class="chip" style="font-size: 11px; padding: 2px 7px;">${esc(s)}</span>`).join(' ')}
      </div>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
        <div>
          <span class="badge badge-primary" style="margin-bottom: 4px;">Active Target Role</span>
          <h2 style="font-family: var(--font-head); font-size: 24px; font-weight: 800; color: var(--text);">${esc(roadmap.targetRole)}</h2>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Timeline: ${esc(roadmap.timeline)} · Experience: ${esc(roadmap.experienceLevel)}</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Profile Ready</div>
            <div style="font-family: var(--font-head); font-size: 26px; font-weight: 800; color: var(--green);">${roadmap.profileScore || 65}%</div>
          </div>
          <a href="career-roadmap.html?role=${encodeURIComponent(roadmap.targetRole)}" class="btn btn-secondary btn-sm" style="margin-left: 10px;">Edit Compass →</a>
          <button class="btn btn-primary btn-sm" id="btnDashRecalibrate" style="margin-left: 6px;">⚡ Recalibrate (AI)</button>
        </div>
      </div>

      <!-- Milestone Progress Bar -->
      <div style="margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
          <span>Milestones Completed: <strong>${doneCount}/${totalMilestones}</strong></span>
          <span>${progressPercent}% Complete</span>
        </div>
        <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${progressPercent}%;"></div></div>
      </div>
    </div>

    <!-- Milestones & Phase Architecture Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
      <div class="card">
        <h3 style="font-family: var(--font-head); font-size: 18px; font-weight: 700; margin-bottom: 12px;">Active Milestones Checklist</h3>
        <div id="dashMilestonesWrapper">
          ${milestonesHtml}
        </div>
      </div>

      <div class="card">
        <h3 style="font-family: var(--font-head); font-size: 18px; font-weight: 700; margin-bottom: 12px;">4-Phase Architecture</h3>
        <div>
          ${phasesSummaryHtml}
        </div>
      </div>
    </div>
  `;

  // Attach interactive milestone listeners
  (roadmap.milestones || []).forEach(m => {
    const chk = document.getElementById(`dash_m_${m.id}`);
    if (chk) {
      chk.addEventListener('change', async (e) => {
        m.completed = e.target.checked;
        try {
          await fetch('/api/roadmap/milestone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ milestoneId: m.id, completed: m.completed })
          });
          renderDashboardRoadmap(roadmap);
          updateStats(
            document.querySelectorAll('.resume-card').length,
            document.querySelectorAll('.cl-row').length,
            roadmap
          );
          showToast(`Milestone updated!`, 'success');
        } catch (err) {
          showToast('Failed to update milestone.', 'error');
        }
      });
    }
  });

  // Attach Recalibrate button listener
  const btnRecal = document.getElementById('btnDashRecalibrate');
  if (btnRecal) {
    btnRecal.addEventListener('click', async () => {
      const note = prompt('Add optional milestone reflection or recent achievements to recalibrate:', 'Completed core modules and deployed portfolio.');
      if (note === null) return;

      btnRecal.disabled = true;
      btnRecal.textContent = 'Recalibrating...';
      try {
        const res = await fetch('/api/roadmap/recalibrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userReflection: note })
        });
        const data = await res.json();
        if (data.success && data.roadmap) {
          showToast('🎉 Roadmap dynamically recalibrated! Profile readiness updated.', 'success');
          loadAll();
        } else if (data.error === 'upgrade_required' && window.paywall) {
          window.paywall.show({ feature: 'Roadmap Re-calibration', requiredTier: 'pro' });
        } else {
          showToast(data.message || 'Recalibration failed.', 'error');
        }
      } catch (err) {
        showToast('Failed to recalibrate roadmap.', 'error');
      } finally {
        btnRecal.disabled = false;
        btnRecal.textContent = '⚡ Recalibrate (AI)';
      }
    });
  }
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

// ══════════════════════════════════════════════════════
//  RENDER SUBSCRIPTION & BILLING
// ══════════════════════════════════════════════════════
function renderDashboardSubscription(subData) {
  const tier = subData?.tier || 'free';
  const sub = subData?.subscription;
  const history = subData?.history || [];

  const planBadge = document.getElementById('planBadge');
  const planTitle = document.getElementById('planTitle');
  const planStatusTag = document.getElementById('planStatusTag');
  const planDesc = document.getElementById('planDesc');
  const planBillingCycle = document.getElementById('planBillingCycle');
  const planExpiryDate = document.getElementById('planExpiryDate');
  const btnPlanAction = document.getElementById('btnPlanAction');
  const btnCancelSub = document.getElementById('btnCancelSub');
  const planFeaturesList = document.getElementById('planFeaturesList');
  const invoiceTableBody = document.getElementById('invoiceTableBody');
  const invoiceEmptyState = document.getElementById('invoiceEmptyState');

  if (!planTitle) return;

  if (tier === 'career_plus') {
    if (planBadge) {
      planBadge.textContent = 'Career+ Tier';
      planBadge.style.background = 'rgba(234, 179, 8, 0.15)';
      planBadge.style.color = '#eab308';
      planBadge.style.borderColor = 'rgba(234, 179, 8, 0.3)';
    }
    planTitle.textContent = 'Career+ Accelerator';
    planDesc.textContent = 'Unrestricted VIP access to AI STAR Answer Coach, full personalized roadmaps, and priority evaluation.';
    if (btnPlanAction) {
      btnPlanAction.textContent = 'Change / Renew Plan →';
      btnPlanAction.href = 'pricing.html?tier=career_plus';
    }
  } else if (tier === 'pro') {
    if (planBadge) {
      planBadge.textContent = 'Pro Tier';
      planBadge.style.background = 'rgba(139, 92, 246, 0.15)';
      planBadge.style.color = 'var(--accent)';
      planBadge.style.borderColor = 'rgba(139, 92, 246, 0.3)';
    }
    planTitle.textContent = 'CareerForge Pro';
    planDesc.textContent = 'Unlimited ATS scans, full 4-phase career roadmap, and 15+ curated interview question bank.';
    if (btnPlanAction) {
      btnPlanAction.textContent = 'Upgrade to Career+ →';
      btnPlanAction.href = 'pricing.html?tier=career_plus';
    }
  } else {
    if (planBadge) {
      planBadge.textContent = 'Free Starter';
      planBadge.style.background = 'var(--surface2)';
      planBadge.style.color = 'var(--text-muted)';
      planBadge.style.borderColor = 'var(--border)';
    }
    planTitle.textContent = 'Free Starter Plan';
    planDesc.textContent = 'Baseline diagnostic access with 5 monthly ATS checks, Phase 1 roadmap, and top 5 interview questions.';
    if (btnPlanAction) {
      btnPlanAction.textContent = 'Upgrade to Pro / Career+ →';
      btnPlanAction.href = 'pricing.html';
    }
  }

  if (sub && sub.status === 'active') {
    if (planStatusTag) {
      planStatusTag.textContent = 'Active';
      planStatusTag.style.background = 'rgba(74, 222, 128, 0.15)';
      planStatusTag.style.color = 'var(--green)';
    }
    if (planBillingCycle) {
      planBillingCycle.textContent = sub.billingCycle === 'annual' ? 'Annual (Billed Yearly)' : 'Monthly (Billed Monthly)';
    }
    if (planExpiryDate) {
      planExpiryDate.textContent = formatDate(sub.endDate);
    }
    if (btnCancelSub) {
      btnCancelSub.style.display = 'inline-block';
      btnCancelSub.onclick = async () => {
        if (!confirm('Are you sure you want to cancel automatic renewal? You will retain access until ' + formatDate(sub.endDate))) return;
        try {
          const res = await fetch('/api/payments/cancel', { method: 'POST', credentials: 'include' });
          const json = await res.json();
          if (json.success) {
            showToast('Subscription cancelled. Access remains active until period ends.', 'info');
            loadAll();
          } else {
            showToast(json.message || 'Cancellation failed', 'error');
          }
        } catch (err) {
          showToast('Failed to cancel subscription', 'error');
        }
      };
    }
  } else if (sub && sub.status === 'cancelled') {
    if (planStatusTag) {
      planStatusTag.textContent = 'Cancelling';
      planStatusTag.style.background = 'rgba(239, 68, 68, 0.15)';
      planStatusTag.style.color = 'var(--red)';
    }
    if (planBillingCycle) planBillingCycle.textContent = `${sub.billingCycle} (Cancelled)`;
    if (planExpiryDate) planExpiryDate.textContent = `Access until ${formatDate(sub.endDate)}`;
    if (btnCancelSub) btnCancelSub.style.display = 'none';
  } else {
    if (planStatusTag) {
      planStatusTag.textContent = 'Free Tier';
      planStatusTag.style.background = 'var(--surface2)';
      planStatusTag.style.color = 'var(--text-muted)';
    }
    if (planBillingCycle) planBillingCycle.textContent = 'Lifetime Free';
    if (planExpiryDate) planExpiryDate.textContent = 'Never expires';
    if (btnCancelSub) btnCancelSub.style.display = 'none';
  }

  // Populate Features List
  if (planFeaturesList) {
    const features = tier === 'career_plus' ? [
      { text: 'Unlimited In-Depth ATS Resume Scans & Keyword Gap Diagnosis', check: true },
      { text: 'Full 4-Phase Career Roadmap with Live Milestones & Course Sync', check: true },
      { text: 'Interactive AI STAR Method Answer Coach', check: true },
      { text: '15+ Company-Tier Interview Question Bank (Service, Unicorn, FAANG)', check: true },
      { text: 'Priority AI Response Generation Speed', check: true },
      { text: 'Unlimited PDF & DOCX Resume Exports', check: true }
    ] : (tier === 'pro' ? [
      { text: 'Unlimited In-Depth ATS Resume Scans & Keyword Gap Diagnosis', check: true },
      { text: 'Full 4-Phase Career Roadmap with Live Milestones & Course Sync', check: true },
      { text: '15+ Company-Tier Interview Question Bank (Service, Unicorn, FAANG)', check: true },
      { text: 'Unlimited PDF & DOCX Resume Exports', check: true },
      { text: 'Interactive AI STAR Method Answer Coach', check: false }
    ] : [
      { text: 'Basic ATS Resume Scanner (5 scans/month)', check: true },
      { text: 'Phase 1 Career Roadmap Overview', check: true },
      { text: 'Top 5 Curated Interview Questions', check: true },
      { text: 'Full 4-Phase Roadmap & Milestone Tracking', check: false },
      { text: 'Interactive AI STAR Method Answer Coach', check: false }
    ]);

    planFeaturesList.innerHTML = features.map(f => `
      <li style="display: flex; align-items: center; gap: 10px; color: ${f.check ? 'var(--text)' : 'var(--text-muted)'}; opacity: ${f.check ? '1' : '0.6'};">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${f.check ? 'var(--green)' : 'var(--text-muted)'}" stroke-width="2.5">
          ${f.check ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}
        </svg>
        <span>${f.text}</span>
      </li>
    `).join('');
  }

  // Populate Invoices
  if (invoiceTableBody && invoiceEmptyState) {
    if (!history.length) {
      invoiceTableBody.innerHTML = '';
      invoiceEmptyState.style.display = 'block';
    } else {
      invoiceEmptyState.style.display = 'none';
      invoiceTableBody.innerHTML = history.map(item => `
        <tr style="border-bottom: 1px solid var(--border);">
          <td style="padding: 12px;">${formatDate(item.createdAt || item.startDate)}</td>
          <td style="padding: 12px; font-weight: 600; text-transform: capitalize;">${item.tier === 'career_plus' ? 'Career+' : 'Pro'} (${item.billingCycle})</td>
          <td style="padding: 12px; font-weight: 700; color: var(--accent);">₹${item.amount.toLocaleString('en-IN')}</td>
          <td style="padding: 12px; font-family: monospace; font-size: 11px; color: var(--text-muted);">${item.razorpayOrderId || item._id}</td>
          <td style="padding: 12px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: ${item.status === 'active' ? 'rgba(74, 222, 128, 0.15)' : 'var(--surface2)'}; color: ${item.status === 'active' ? 'var(--green)' : 'var(--text-muted)'};">
              ${item.status}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }
}

// ══════════════════════════════════════════════════════
//  VIRAL REFERRAL PROGRAM
// ══════════════════════════════════════════════════════
async function loadReferralData() {
  const linkInput = document.getElementById('referralLinkInput');
  const statsMonths = document.getElementById('referralStatsMonths');
  const btnCopy = document.getElementById('btnCopyReferral');
  const btnWA = document.getElementById('btnShareWhatsApp');
  const btnLI = document.getElementById('btnShareLinkedIn');

  if (!linkInput) return;

  try {
    const res = await fetch('/api/insights/referral/my-code', { credentials: 'include' });
    const data = await res.json();

    if (data.success) {
      linkInput.value = data.referralLink;
      if (statsMonths) {
        statsMonths.textContent = `${data.stats.rewardsClaimedMonths} Month${data.stats.rewardsClaimedMonths > 1 ? 's' : ''} Free`;
      }

      if (btnCopy) {
        btnCopy.onclick = () => {
          navigator.clipboard.writeText(data.referralLink).then(() => {
            showToast('Referral link copied to clipboard!', 'success');
          });
        };
      }

      const shareText = encodeURIComponent(`Hey! I'm using CareerForge AI to benchmark my tech compensation, check my ATS score, and prep for top SDE interviews. Use my invite link to get 14 days of Pro free: ${data.referralLink}`);
      if (btnWA) btnWA.href = `https://api.whatsapp.com/send?text=${shareText}`;
      if (btnLI) btnLI.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.referralLink)}`;
    }
  } catch (err) {
    console.warn('Could not load referral data:', err);
  }
}

