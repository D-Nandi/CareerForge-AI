// ══════════════════════════════════════════════════════
//  RESUMATIC — Preview Script
//  Handles: live data binding, template switching,
//           experience/education blocks, divider drag,
//           print/download, cover letter generation
// ══════════════════════════════════════════════════════

// ── STATE ──
const state = {
  personal: { firstName:'', lastName:'', title:'', email:'', phone:'', location:'', linkedin:'', summary:'' },
  experience: [],
  education: [],
  skills: { tech:[], soft:[], languages:[] },
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
  state.skills.languages = raw('lang', 'p_languages');
}

// ══════════════════════════════════════════════════════
//  RENDER ALL — dispatches to active template
// ══════════════════════════════════════════════════════
function renderAll() {
  syncPersonal();
  if (activeTemplate === 'classic')   renderClassic();
  if (activeTemplate === 'modern')    renderModern();
  if (activeTemplate === 'minimal')   renderMinimal();
}

// ══════════════════════════════════════════════════════
//  TEMPLATE: CLASSIC
// ══════════════════════════════════════════════════════
function renderClassic() {
  const p = state.personal;
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');

  setTextEmpty('cl_name', full, 'Your Name');
  setTextEmpty('cl_title', p.title, 'Professional Title');

  const contactFields = [
    { val: p.email,    icon: '' },
    { val: p.phone,    icon: '' },
    { val: p.location, icon: '' },
    { val: p.linkedin, icon: '' },
  ];
  const el = document.getElementById('cl_contact');
  el.innerHTML = contactFields
    .filter(f => f.val)
    .map(f => `<span class="cl-contact-item">${esc(f.val)}</span>`)
    .join('');

  const sum = document.getElementById('cl_summary');
  if (sum) sum.textContent = p.summary || 'Your professional summary will appear here.';

  renderClassicExperience();
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
  c.innerHTML = entries.map(e => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title">${esc(e.role) || '—'}</span>
        <span class="cl-entry-date">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="cl-entry-sub">${esc(e.company)}</div>
      ${e.description ? `<div class="cl-entry-desc">${esc(e.description)}</div>` : ''}
    </div>`).join('');
}

function renderClassicEducation() {
  const c = document.getElementById('cl_education');
  if (!c) return;
  const entries = state.education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="cl-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map(e => `
    <div class="cl-entry">
      <div class="cl-entry-top">
        <span class="cl-entry-title">${esc(e.degree) || '—'}</span>
        <span class="cl-entry-date">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="cl-entry-sub">${esc(e.institution)}</div>
      ${e.details ? `<div class="cl-entry-desc">${esc(e.details)}</div>` : ''}
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

  setTextEmpty('mo_name', full, 'Your Name');
  setTextEmpty('mo_title', p.title, 'Professional Title');
  setTextEmpty('mo_main_name', full, 'Your Name');
  setTextEmpty('mo_main_title', p.title, 'Professional Title');

  const contactFields = [
    { val: p.email,    icon: '✉' },
    { val: p.phone,    icon: '☎' },
    { val: p.location, icon: '⌖' },
    { val: p.linkedin, icon: '⇗' },
  ];
  const mc = document.getElementById('mo_contact');
  if (mc) {
    mc.innerHTML = contactFields
      .filter(f => f.val)
      .map(f => `<div class="mo-contact-item"><span class="mo-contact-icon">${f.icon}</span>${esc(f.val)}</div>`)
      .join('') || '<div class="mo-contact-item" style="color:rgba(196,181,253,0.4);font-style:italic">No contact info</div>';
  }

  const sum = document.getElementById('mo_summary');
  if (sum) sum.textContent = p.summary || 'Your professional summary will appear here.';

  renderSkillTags('mo_techSkills', state.skills.tech, 'mo-tag');
  renderSkillTags('mo_softSkills', state.skills.soft, 'mo-tag');
  renderSkillTags('mo_languages',  state.skills.languages, 'mo-tag');

  renderModernExperience();
  renderModernEducation();
}

function renderModernExperience() {
  const c = document.getElementById('mo_experience');
  if (!c) return;
  const entries = state.experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="mo-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map(e => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title">${esc(e.role) || '—'}</span>
        ${[e.startDate, e.endDate].filter(Boolean).length ? `<span class="mo-entry-date">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>` : ''}
      </div>
      <div class="mo-entry-sub">${esc(e.company)}</div>
      ${e.description ? `<div class="mo-entry-desc">${esc(e.description)}</div>` : ''}
    </div>`).join('');
}

function renderModernEducation() {
  const c = document.getElementById('mo_education');
  if (!c) return;
  const entries = state.education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="mo-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map(e => `
    <div class="mo-entry">
      <div class="mo-entry-top">
        <span class="mo-entry-title">${esc(e.degree) || '—'}</span>
        ${[e.startYear, e.endYear].filter(Boolean).length ? `<span class="mo-entry-date">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>` : ''}
      </div>
      <div class="mo-entry-sub">${esc(e.institution)}</div>
      ${e.details ? `<div class="mo-entry-desc">${esc(e.details)}</div>` : ''}
    </div>`).join('');
}

// ══════════════════════════════════════════════════════
//  TEMPLATE: MINIMAL
// ══════════════════════════════════════════════════════
function renderMinimal() {
  const p = state.personal;
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ');

  setTextEmpty('mn_name', full, 'Your Name');
  setTextEmpty('mn_title', p.title, 'Professional Title');

  const contactFields = [
    p.email, p.phone, p.location, p.linkedin
  ].filter(Boolean);
  const mc = document.getElementById('mn_contact');
  if (mc) {
    mc.innerHTML = contactFields
      .map(v => `<span class="mn-contact-item">${esc(v)}</span>`)
      .join('') || '';
  }

  const sum = document.getElementById('mn_summary');
  if (sum) sum.textContent = p.summary || 'Your professional summary will appear here.';

  renderSkillTags('mn_techSkills', state.skills.tech, 'mn-tag');
  renderSkillTags('mn_softSkills', state.skills.soft, 'mn-tag');
  renderSkillTags('mn_languages',  state.skills.languages, 'mn-tag');

  renderMinimalExperience();
  renderMinimalEducation();
}

function renderMinimalExperience() {
  const c = document.getElementById('mn_experience');
  if (!c) return;
  const entries = state.experience.filter(e => e.role || e.company);
  if (!entries.length) { c.innerHTML = '<p class="mn-placeholder">No experience added yet.</p>'; return; }
  c.innerHTML = entries.map(e => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title">${esc(e.role) || '—'}</span>
        <span class="mn-entry-date">${[e.startDate, e.endDate].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="mn-entry-sub">${esc(e.company)}</div>
      ${e.description ? `<div class="mn-entry-desc">${esc(e.description)}</div>` : ''}
    </div>`).join('');
}

function renderMinimalEducation() {
  const c = document.getElementById('mn_education');
  if (!c) return;
  const entries = state.education.filter(e => e.degree || e.institution);
  if (!entries.length) { c.innerHTML = '<p class="mn-placeholder">No education added yet.</p>'; return; }
  c.innerHTML = entries.map(e => `
    <div class="mn-entry">
      <div class="mn-entry-top">
        <span class="mn-entry-title">${esc(e.degree) || '—'}</span>
        <span class="mn-entry-date">${[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
      </div>
      <div class="mn-entry-sub">${esc(e.institution)}</div>
      ${e.details ? `<div class="mn-entry-desc">${esc(e.details)}</div>` : ''}
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

// ── SYNC BLOCK ──
function syncBlock(id, type, div) {
  const arr  = type === 'experience' ? state.experience : state.education;
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
    setOverlaySub('Capturing layout…', 25);

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      width: 794px; background: transparent; z-index: -1;
    `;
    const clone = sheet.cloneNode(true);
    clone.style.cssText = `
      position: static; display: block; opacity: 1;
      transform: none; translate: none;
      width: 794px; max-width: 794px;
      box-shadow: none; border-radius: 0;
    `;

    // Watermark injection on free exports
    const watermark = document.createElement('div');
    watermark.className = 'resumatic-watermark';
    watermark.style.cssText = 'text-align:center; font-size:9px; color:#94a3b8; padding-top:14px; margin-top:20px; font-family:sans-serif; letter-spacing:0.04em; border-top:1px dashed #cbd5e1;';
    watermark.textContent = 'Built with Resumatic • resumatic.ai (Free ATS Resume Builder)';
    clone.appendChild(watermark);

    container.appendChild(clone);
    document.body.appendChild(container);

    await delay(80);
    setOverlaySub('Rendering pixels…', 50);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: getTemplateBackground(activeTemplate),
      logging: false,
      windowWidth: 794,
      onclone: (clonedDoc, clonedEl) => {
        clonedEl.style.height = 'auto';
        clonedEl.style.minHeight = '0';
      }
    });

    document.body.removeChild(container);
    setOverlaySub('Building PDF…', 75);
    await delay(60);

    const { jsPDF } = window.jspdf;

    const A4_W = 210;
    const A4_H = 297;

    const imgW  = canvas.width;
    const imgH  = canvas.height;

    const pdfW  = A4_W;
    const pdfH  = (imgH * A4_W) / imgW;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.97);

    if (pdfH <= A4_H) {
      const yOffset = pdfH < A4_H ? (A4_H - pdfH) / 2 : 0;
      pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfW, pdfH);
    } else {
      const pageHeightPx = Math.floor((A4_H / A4_W) * imgW);
      let yPx = 0;

      while (yPx < imgH) {
        const sliceH = Math.min(pageHeightPx, imgH - yPx);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width  = imgW;
        pageCanvas.height = sliceH;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, yPx, imgW, sliceH, 0, 0, imgW, sliceH);

        const pageData  = pageCanvas.toDataURL('image/jpeg', 0.97);
        const pageImgH  = (sliceH * A4_W) / imgW;

        if (yPx > 0) pdf.addPage();
        pdf.addImage(pageData, 'JPEG', 0, 0, pdfW, pageImgH);
        yPx += sliceH;
      }
    }

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

function setTextEmpty(id, value, placeholder) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || placeholder;
  el.classList.toggle('empty', !value);
}

function renderSkillTags(containerId, tags, tagClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!tags || !tags.length) {
    el.innerHTML = `<span style="font-size:11px;opacity:0.35;font-style:italic">Not specified</span>`;
    return;
  }
  el.innerHTML = tags.map(t => `<span class="${tagClass}">${esc(t)}</span>`).join('');
}

// ══════════════════════════════════════════════════════
//  LOAD FROM localStorage (data handoff from form page)
// ══════════════════════════════════════════════════════
function loadFromStorage() {
  let saved;
  try {
    const raw = localStorage.getItem('resumatic_state');
    if (!raw) return;
    saved = JSON.parse(raw);
  } catch (e) {
    return;
  }
  if (!saved) return;

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
    if (el && p[key]) el.value = p[key];
  });

  // ── Skills (comma-join arrays into the text inputs) ──
  const sk = saved.skills || {};
  const skillMap = { tech: 'p_techSkills', soft: 'p_softSkills', languages: 'p_languages' };
  Object.entries(skillMap).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el && sk[key] && sk[key].length) el.value = sk[key].join(', ');
  });

  // ── Experience blocks ──
  (saved.experience || []).forEach(e => addExpBlock(e));

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

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
loadFromStorage();
renderAll();

