const fs = require('fs');

const newCode = `// ══════════════════════════════════════════════════
//  DEDICATED EDITOR CANVAS & ELEMENT SELECTION ENGINE
//  Dual Selection: Character-Level Text Highlighting + Element-Level Selection
// ══════════════════════════════════════════════════
let currentViewMode = 'preview'; // 'preview' | 'editor'
let activeSelectedElement = null; // Currently clicked DOM element on canvas
let activeSelectedEntry = null;   // Currently focused entry block (e.g. project or experience item)
let savedSelectionRange = null;   // Saved DOM Range for highlighted text

// ── 1. VIEW MODE SWITCHER (Preview vs Editor Canvas) ──
function initViewModeSwitcher() {
  const btnPrev = document.getElementById('btnModePreview');
  const btnEdit = document.getElementById('btnModeEditor');
  const splitScreen = document.querySelector('.split-screen');
  const editorHeader = document.getElementById('editorCanvasHeader');

  function setMode(mode) {
    currentViewMode = mode;
    if (mode === 'editor') {
      if (splitScreen) splitScreen.classList.add('mode-editor-active');
      if (btnEdit) { btnEdit.classList.add('active'); btnEdit.setAttribute('aria-selected', 'true'); }
      if (btnPrev) { btnPrev.classList.remove('active'); btnPrev.setAttribute('aria-selected', 'false'); }
      if (editorHeader) editorHeader.style.display = 'flex';
      makeResumeEditable();
      updateTargetBadge('Click any element or text to edit');
    } else {
      if (splitScreen) splitScreen.classList.remove('mode-editor-active');
      if (btnPrev) { btnPrev.classList.add('active'); btnPrev.setAttribute('aria-selected', 'true'); }
      if (btnEdit) { btnEdit.classList.remove('active'); btnEdit.setAttribute('aria-selected', 'false'); }
      if (editorHeader) editorHeader.style.display = 'none';
      clearElementSelection();
    }
  }

  if (btnPrev) btnPrev.addEventListener('click', () => setMode('preview'));
  if (btnEdit) btnEdit.addEventListener('click', () => setMode('editor'));
}

// ── 2. ELEMENT SELECTION & TARGET BADGE ──
function clearElementSelection() {
  if (activeSelectedElement) {
    activeSelectedElement.classList.remove('editor-element-selected');
    activeSelectedElement = null;
  }
  if (activeSelectedEntry) {
    activeSelectedEntry.classList.remove('editor-entry-selected');
    activeSelectedEntry = null;
  }
  const delBtn = document.getElementById('echDeleteElemBtn');
  if (delBtn) delBtn.style.display = 'none';
  updateTargetBadge('Click any text or element to edit');
}

function selectElement(el) {
  if (!el) return;
  if (activeSelectedElement && activeSelectedElement !== el) {
    activeSelectedElement.classList.remove('editor-element-selected');
  }
  activeSelectedElement = el;
  el.classList.add('editor-element-selected');

  // Check if inside an entry card (e.g. .cl-entry, .mo-entry)
  const entryCard = el.closest('.cl-entry, .mo-entry, .mn-entry');
  if (activeSelectedEntry && activeSelectedEntry !== entryCard) {
    activeSelectedEntry.classList.remove('editor-entry-selected');
  }
  activeSelectedEntry = entryCard;
  if (entryCard) {
    entryCard.classList.add('editor-entry-selected');
  }

  // Show/Hide Delete Button
  const delBtn = document.getElementById('echDeleteElemBtn');
  if (delBtn) {
    delBtn.style.display = (entryCard || el.classList.contains('cl-skill-tag') || el.classList.contains('mo-tag') || el.classList.contains('mn-tag')) ? 'inline-flex' : 'none';
  }

  // Compute description for badge
  const label = getElementFriendlyLabel(el);
  updateTargetBadge(label);

  // Sync toolbar controls to match element's computed styles
  syncToolbarToElement(el);
}

function getElementFriendlyLabel(el) {
  if (el.classList.contains('cl-name') || el.classList.contains('mo-name') || el.classList.contains('mn-name') || (el.id && el.id.includes('name'))) {
    return '👤 Full Name';
  }
  if (el.classList.contains('cl-title') || el.classList.contains('mo-title') || el.classList.contains('mn-title') || (el.id && el.id.includes('title'))) {
    return '💼 Professional Title';
  }
  if (el.classList.contains('cl-section-title') || el.classList.contains('mo-section-title') || el.classList.contains('mn-section-title')) {
    return \`🏷️ Section: \${el.innerText.trim() || 'Header'}\`;
  }
  if (el.classList.contains('cl-summary') || el.classList.contains('mo-summary') || el.classList.contains('mn-summary')) {
    return '📝 Professional Summary';
  }
  if (el.dataset.editPath && el.dataset.editPath.startsWith('projects.')) {
    return \`🚀 Project: \${el.innerText.trim().substring(0, 25) || 'Item'}\`;
  }
  if (el.dataset.editPath && el.dataset.editPath.startsWith('experience.')) {
    return \`💼 Work Experience: \${el.innerText.trim().substring(0, 25) || 'Role'}\`;
  }
  if (el.dataset.editPath && el.dataset.editPath.startsWith('education.')) {
    return \`🎓 Education: \${el.innerText.trim().substring(0, 25) || 'Degree'}\`;
  }
  if (el.classList.contains('cl-skill-tag') || el.classList.contains('mo-tag') || el.classList.contains('mn-tag')) {
    return \`⚡ Skill: \${el.innerText.trim()}\`;
  }
  if (el.classList.contains('cl-entry-desc') || el.classList.contains('mo-entry-desc')) {
    return '📄 Bullet Description';
  }
  return \`Target: \${el.innerText.trim().substring(0, 28) || 'Selected Element'}\`;
}

function updateTargetBadge(text) {
  const badgeText = document.getElementById('echTargetText');
  if (badgeText) badgeText.textContent = text;
}

function syncToolbarToElement(el) {
  try {
    const computed = window.getComputedStyle(el);
    const ffSelect = document.getElementById('echFontFamily');
    const fsSelect = document.getElementById('echFontSize');
    const clrInput = document.getElementById('echCustomColorPicker');

    if (fsSelect && computed.fontSize) {
      const px = Math.round(parseFloat(computed.fontSize)) + 'px';
      const hasOpt = Array.from(fsSelect.options).some(o => o.value === px);
      if (hasOpt) fsSelect.value = px;
    }
    if (clrInput && computed.color) {
      const rgb = computed.color;
      const hex = rgbToHex(rgb);
      if (hex) clrInput.value = hex;
    }
  } catch(e) {}
}

function rgbToHex(rgb) {
  const m = rgb.match(/\\d+/g);
  if (!m || m.length < 3) return null;
  return '#' + ((1 << 24) + (parseInt(m[0]) << 16) + (parseInt(m[1]) << 8) + parseInt(m[2])).toString(16).slice(1);
}

// ── 3. ELEMENT SELECTION LISTENERS ──
function initElementSelectionEngine() {
  const previewPanel = document.getElementById('previewPanel');
  if (!previewPanel) return;

  previewPanel.addEventListener('click', (e) => {
    if (currentViewMode !== 'editor') return;

    const editable = e.target.closest('[data-canva-editable="true"], .cl-section-title, .mo-section-title, .mn-section-title, .cl-skill-tag, .mo-tag, .mn-tag, .cl-entry, .mo-entry, .mn-entry');
    if (editable) {
      selectElement(editable);
    } else if (!e.target.closest('#editorCanvasHeader, #textSelectionToolbar')) {
      clearElementSelection();
    }
  });

  // Track text highlight within preview
  document.addEventListener('selectionchange', () => {
    if (currentViewMode !== 'editor') return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (previewPanel && previewPanel.contains(range.commonAncestorContainer)) {
        savedSelectionRange = range.cloneRange();
        const str = sel.toString().trim();
        if (str) {
          updateTargetBadge(\`🔤 Text: "\${str.length > 20 ? str.substring(0, 18) + '…' : str}"\`);
        }
      }
    }
  });

  // Keyboard Shortcuts in Editor Canvas
  document.addEventListener('keydown', (e) => {
    if (currentViewMode !== 'editor') return;

    if (e.key === 'Escape') {
      clearElementSelection();
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        applyFormatting('fontWeight');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        applyFormatting('fontStyle');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        applyFormatting('textDecoration');
      }
    }
  });
}

// ── 4. UNIVERSAL FORMATTING ENGINE ──
function applyFormatting(property, value) {
  const sel = window.getSelection();
  const previewPanel = document.getElementById('previewPanel');

  // Check if text range is highlighted inside the resume sheet
  if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (previewPanel && previewPanel.contains(range.commonAncestorContainer)) {
      if (property === 'fontWeight' || property === 'fontStyle' || property === 'textDecoration') {
        const cmdMap = { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline' };
        try { document.execCommand(cmdMap[property], false, null); } catch(err){}
      } else {
        applyInlineStyle(property, value);
      }
      triggerResumeContentChanged();
      return;
    }
  }

  // If no text range is highlighted, format the currently selected ELEMENT:
  if (activeSelectedElement) {
    if (property === 'fontFamily') {
      activeSelectedElement.style.fontFamily = value;
    } else if (property === 'fontSize') {
      activeSelectedElement.style.fontSize = value;
    } else if (property === 'color') {
      activeSelectedElement.style.color = value;
    } else if (property === 'fontWeight') {
      const isBold = activeSelectedElement.style.fontWeight === 'bold' || parseInt(activeSelectedElement.style.fontWeight) >= 700;
      activeSelectedElement.style.fontWeight = isBold ? 'normal' : 'bold';
    } else if (property === 'fontStyle') {
      activeSelectedElement.style.fontStyle = (activeSelectedElement.style.fontStyle === 'italic') ? 'normal' : 'italic';
    } else if (property === 'textDecoration') {
      const hasUnderline = activeSelectedElement.style.textDecoration && activeSelectedElement.style.textDecoration.includes('underline');
      activeSelectedElement.style.textDecoration = hasUnderline ? 'none' : 'underline';
    }
    triggerResumeContentChanged();
  }
}

// ── 5. DEDICATED EDITOR HEADER INITIALIZATION ──
function initDedicatedEditorHeader() {
  const ech = document.getElementById('editorCanvasHeader');
  if (!ech) return;

  // Prevent mousedown on header tools from deselecting text
  ech.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'SELECT' && e.target.type !== 'color') {
      e.preventDefault();
    }
  });

  // Font Family
  const echFontFamily = document.getElementById('echFontFamily');
  if (echFontFamily) {
    echFontFamily.addEventListener('change', () => {
      const val = echFontFamily.value;
      if (val) applyFormatting('fontFamily', val);
      echFontFamily.value = '';
    });
  }

  // Font Size Stepper
  const echFontSize = document.getElementById('echFontSize');
  if (echFontSize) {
    echFontSize.addEventListener('change', () => {
      const val = echFontSize.value;
      if (val) applyFormatting('fontSize', val);
      echFontSize.value = '';
    });
  }

  const echSizeDec = document.getElementById('echSizeDec');
  const echSizeInc = document.getElementById('echSizeInc');
  if (echSizeDec) {
    echSizeDec.addEventListener('click', (e) => {
      e.preventDefault();
      adjustActiveFontSize(-1);
    });
  }
  if (echSizeInc) {
    echSizeInc.addEventListener('click', (e) => {
      e.preventDefault();
      adjustActiveFontSize(1);
    });
  }

  function adjustActiveFontSize(delta) {
    let currentPx = 14;
    if (activeSelectedElement) {
      currentPx = parseInt(window.getComputedStyle(activeSelectedElement).fontSize, 10) || 14;
    }
    const nextPx = Math.max(8, Math.min(48, currentPx + delta)) + 'px';
    applyFormatting('fontSize', nextPx);
  }

  // Formatting Buttons
  const btnB = document.getElementById('echBtnBold');
  const btnI = document.getElementById('echBtnItalic');
  const btnU = document.getElementById('echBtnUnderline');
  const btnBullet = document.getElementById('echBtnBullet');

  if (btnB) btnB.addEventListener('click', (e) => { e.preventDefault(); applyFormatting('fontWeight'); });
  if (btnI) btnI.addEventListener('click', (e) => { e.preventDefault(); applyFormatting('fontStyle'); });
  if (btnU) btnU.addEventListener('click', (e) => { e.preventDefault(); applyFormatting('textDecoration'); });
  if (btnBullet) {
    btnBullet.addEventListener('click', (e) => {
      e.preventDefault();
      insertBulletPoint();
    });
  }

  // Colors
  const swatches = ech.querySelectorAll('.ech-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      e.preventDefault();
      const color = swatch.dataset.color;
      if (color) applyFormatting('color', color);
    });
  });

  const customColor = document.getElementById('echCustomColorPicker');
  if (customColor) {
    customColor.addEventListener('input', () => applyFormatting('color', customColor.value));
    customColor.addEventListener('change', () => applyFormatting('color', customColor.value));
  }

  // Text Alignment
  const aLeft = document.getElementById('echAlignLeft');
  const aCenter = document.getElementById('echAlignCenter');
  const aRight = document.getElementById('echAlignRight');

  if (aLeft) aLeft.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('left'); });
  if (aCenter) aCenter.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('center'); });
  if (aRight) aRight.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('right'); });

  // Add / Delete Actions
  const addProj = document.getElementById('echAddProjectBtn');
  const addExp = document.getElementById('echAddExpBtn');
  const addEdu = document.getElementById('echAddEduBtn');
  const addSkill = document.getElementById('echAddSkillBtn');
  const delBtn = document.getElementById('echDeleteElemBtn');
  const resetBtn = document.getElementById('echResetFormatting');

  if (addProj) addProj.addEventListener('click', (e) => { e.preventDefault(); addProjectEntry(); });
  if (addExp) addExp.addEventListener('click', (e) => { e.preventDefault(); addExperienceEntry(); });
  if (addEdu) addEdu.addEventListener('click', (e) => { e.preventDefault(); addEducationEntry(); });
  if (addSkill) addSkill.addEventListener('click', (e) => { e.preventDefault(); addSkillTag(); });
  if (delBtn) delBtn.addEventListener('click', (e) => { e.preventDefault(); deleteSelectedElementOrEntry(); });
  if (resetBtn) resetBtn.addEventListener('click', (e) => { e.preventDefault(); clearSelectionFormatting(); });

  // Canvas Zoom
  initCanvasZoom();
}

function insertBulletPoint() {
  if (activeSelectedElement) {
    activeSelectedElement.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const bulletNode = document.createTextNode('• ');
      range.insertNode(bulletNode);
      range.setStartAfter(bulletNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      activeSelectedElement.innerHTML = (activeSelectedElement.innerHTML ? activeSelectedElement.innerHTML + '<br>' : '') + '• ';
    }
    triggerResumeContentChanged();
  }
}

function addProjectEntry() {
  state.projects = state.projects || [];
  state.projects.push({
    name: 'New Project Name',
    type: 'Personal Project',
    link: '',
    startDate: '2024',
    endDate: 'Present',
    description: '• Implemented core architecture and optimized performance.\\n• Designed responsive user interface with modern frameworks.'
  });
  renderAll();
  setTimeout(() => {
    const newItems = document.querySelectorAll('#previewPanel [data-edit-path^="projects."]');
    if (newItems.length) {
      const last = newItems[newItems.length - 1];
      selectElement(last);
      last.focus();
    }
  }, 60);
}

function addExperienceEntry() {
  state.experience = state.experience || [];
  state.experience.push({
    role: 'Software Engineer',
    company: 'Company Name',
    startDate: '2023',
    endDate: 'Present',
    description: '• Developed scalable web solutions and collaborated with cross-functional teams.\\n• Streamlined deployments and reduced p99 latency.'
  });
  renderAll();
  setTimeout(() => {
    const newItems = document.querySelectorAll('#previewPanel [data-edit-path^="experience."]');
    if (newItems.length) {
      const last = newItems[newItems.length - 1];
      selectElement(last);
      last.focus();
    }
  }, 60);
}

function addEducationEntry() {
  state.education = state.education || [];
  state.education.push({
    degree: 'B.Tech in Computer Science',
    institution: 'University / Institute Name',
    startYear: '2020',
    endYear: '2024',
    info: 'CGPA: 8.5 / 10.0'
  });
  renderAll();
  setTimeout(() => {
    const newItems = document.querySelectorAll('#previewPanel [data-edit-path^="education."]');
    if (newItems.length) {
      const last = newItems[newItems.length - 1];
      selectElement(last);
      last.focus();
    }
  }, 60);
}

function addSkillTag() {
  const skill = prompt('Enter new skill name:', 'TypeScript');
  if (skill && skill.trim()) {
    state.skills = state.skills || { tech: [], soft: [], languages: [] };
    state.skills.tech = state.skills.tech || [];
    state.skills.tech.push(skill.trim());
    renderAll();
  }
}

function deleteSelectedElementOrEntry() {
  const target = activeSelectedElement || activeSelectedEntry;
  if (!target) return;

  // 1. Skill Tag deletion
  if (target.dataset.editType === 'skill') {
    const type = target.dataset.skillType || 'tech';
    const idx = parseInt(target.dataset.skillIdx, 10);
    if (state.skills && state.skills[type] && !isNaN(idx)) {
      state.skills[type].splice(idx, 1);
      clearElementSelection();
      renderAll();
      return;
    }
  }

  // 2. Direct data-edit-path deletion (project, experience, education)
  const path = target.dataset.editPath || (activeSelectedElement && activeSelectedElement.dataset.editPath);
  if (path) {
    const parts = path.split('.');
    const section = parts[0];
    const idx = parseInt(parts[1], 10);

    if (['experience', 'projects', 'education'].includes(section) && !isNaN(idx)) {
      if (confirm(\`Delete this \${section.slice(0, -1)} entry?\`)) {
        state[section].splice(idx, 1);
        clearElementSelection();
        renderAll();
        return;
      }
    }
  }

  // 3. Parent entry card deletion
  if (activeSelectedEntry) {
    const editPathEl = activeSelectedEntry.querySelector('[data-edit-path]');
    if (editPathEl && editPathEl.dataset.editPath) {
      const parts = editPathEl.dataset.editPath.split('.');
      const section = parts[0];
      const idx = parseInt(parts[1], 10);
      if (['experience', 'projects', 'education'].includes(section) && !isNaN(idx)) {
        if (confirm(\`Delete this \${section.slice(0, -1)} entry?\`)) {
          state[section].splice(idx, 1);
          clearElementSelection();
          renderAll();
          return;
        }
      }
    }
  }
}

function initCanvasZoom() {
  const zoomBtns = document.querySelectorAll('.ech-zoom-btn');
  const sheets = document.querySelectorAll('.resume-sheet');

  zoomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      zoomBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scale = btn.dataset.scale;
      sheets.forEach(sheet => {
        if (btn.id === 'echZoomFit') {
          sheet.style.transform = '';
        } else if (scale) {
          sheet.style.transform = \`scale(\${scale})\`;
          sheet.style.transformOrigin = 'top center';
        }
      });
    });
  });
}

// ── 6. FLOATING HUD TOOLBAR (for quick in-line edits) ──
const selectionToolbar = document.getElementById('textSelectionToolbar');
const customColorInput = document.getElementById('tstCustomColorPicker');
const selectFontFamily = document.getElementById('tstFontFamily');
const selectFontSize   = document.getElementById('tstFontSize');
const btnAlignLeft     = document.getElementById('tstAlignLeft');
const btnAlignCenter   = document.getElementById('tstAlignCenter');
const btnAlignRight    = document.getElementById('tstAlignRight');
const btnAlignJustify  = document.getElementById('tstAlignJustify');

function initTextSelectionToolbar() {
  if (!selectionToolbar) return;

  makeResumeEditable();

  selectionToolbar.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'SELECT' && e.target.type !== 'color') {
      e.preventDefault();
    }
  });

  const swatches = selectionToolbar.querySelectorAll('.tst-color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      e.preventDefault();
      const color = swatch.dataset.color;
      if (color) applyInlineStyle('color', color);
    });
  });

  if (customColorInput) {
    customColorInput.addEventListener('input', () => applyInlineStyle('color', customColorInput.value));
    customColorInput.addEventListener('change', () => applyInlineStyle('color', customColorInput.value));
  }

  if (selectFontFamily) {
    selectFontFamily.addEventListener('change', () => {
      const val = selectFontFamily.value;
      if (val) applyInlineStyle('fontFamily', val);
      selectFontFamily.value = '';
    });
  }

  if (selectFontSize) {
    selectFontSize.addEventListener('change', () => {
      const val = selectFontSize.value;
      if (val) applyInlineStyle('fontSize', val);
      selectFontSize.value = '';
    });
  }

  if (btnAlignLeft) btnAlignLeft.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('left'); });
  if (btnAlignCenter) btnAlignCenter.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('center'); });
  if (btnAlignRight) btnAlignRight.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('right'); });
  if (btnAlignJustify) btnAlignJustify.addEventListener('click', (e) => { e.preventDefault(); applyAlignment('justify'); });

  const btnBold      = document.getElementById('tstBtnBold');
  const btnItalic    = document.getElementById('tstBtnItalic');
  const btnUnderline = document.getElementById('tstBtnUnderline');
  const btnReset     = document.getElementById('tstBtnReset');

  if (btnBold) btnBold.addEventListener('click', (e) => { e.preventDefault(); restoreSavedSelection(); try { document.execCommand('bold', false, null); } catch(err){} triggerResumeContentChanged(); });
  if (btnItalic) btnItalic.addEventListener('click', (e) => { e.preventDefault(); restoreSavedSelection(); try { document.execCommand('italic', false, null); } catch(err){} triggerResumeContentChanged(); });
  if (btnUnderline) btnUnderline.addEventListener('click', (e) => { e.preventDefault(); restoreSavedSelection(); try { document.execCommand('underline', false, null); } catch(err){} triggerResumeContentChanged(); });
  if (btnReset) btnReset.addEventListener('click', (e) => { e.preventDefault(); clearSelectionFormatting(); });

  const checkSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      hideToolbar();
      return;
    }

    const range = sel.getRangeAt(0);
    const previewPanel = document.getElementById('previewPanel');
    if (!previewPanel || !previewPanel.contains(range.commonAncestorContainer)) {
      hideToolbar();
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      hideToolbar();
      return;
    }

    savedSelectionRange = range.cloneRange();

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hideToolbar();
      return;
    }

    selectionToolbar.style.display = 'flex';
    selectionToolbar.classList.add('visible');

    const tbWidth  = selectionToolbar.offsetWidth || 500;
    const tbHeight = selectionToolbar.offsetHeight || 42;

    let top  = rect.top - tbHeight - 12;
    let left = rect.left + (rect.width / 2) - (tbWidth / 2);

    if (top < 70) {
      top = rect.bottom + 12;
    }
    left = Math.max(12, Math.min(left, window.innerWidth - tbWidth - 12));

    selectionToolbar.style.top  = \`\${Math.round(top)}px\`;
    selectionToolbar.style.left = \`\${Math.round(left)}px\`;
  };

  function hideToolbar() {
    if (selectionToolbar.classList.contains('visible')) {
      selectionToolbar.classList.remove('visible');
      selectionToolbar.style.display = 'none';
    }
  }

  document.addEventListener('selectionchange', () => {
    if (!selectionToolbar.matches(':hover') && document.activeElement?.tagName !== 'SELECT') {
      checkSelection();
    }
  });

  const previewPanel = document.getElementById('previewPanel');
  if (previewPanel) {
    previewPanel.addEventListener('mouseup', () => setTimeout(checkSelection, 30));
    previewPanel.addEventListener('keyup', (e) => {
      if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setTimeout(checkSelection, 30);
      }
    });
    previewPanel.addEventListener('scroll', () => {
      if (selectionToolbar.classList.contains('visible')) checkSelection();
    }, { passive: true });
  }

  document.addEventListener('mousedown', (e) => {
    if (!selectionToolbar.contains(e.target) && (!previewPanel || !previewPanel.contains(e.target))) {
      hideToolbar();
    }
  });
}

function restoreSavedSelection() {
  if (savedSelectionRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelectionRange);
  }
}

// Applies arbitrary CSS property (color, fontFamily, fontSize) to selected text
function applyInlineStyle(property, value) {
  restoreSavedSelection();
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const previewPanel = document.getElementById('previewPanel');
  if (!previewPanel || !previewPanel.contains(range.commonAncestorContainer)) return;

  try {
    const span = document.createElement('span');
    span.style[property] = value;

    const parent = range.commonAncestorContainer.nodeType === 3
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    if (parent && parent.tagName === 'SPAN' && parent.textContent.trim() === range.toString().trim() && parent.dataset.canvaEditable !== 'true') {
      parent.style[property] = value;
    } else {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRange = newRange.cloneRange();
    }
  } catch (err) {
    console.warn('DOM inline styling exception:', err);
  }

  triggerResumeContentChanged();
}

// Applies block alignment to selected paragraph or active element
function applyAlignment(align) {
  restoreSavedSelection();
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;

    const block = node.closest('[data-canva-editable="true"]') || node.closest('.cl-entry-desc, .mo-entry-desc, .mn-entry-desc, .cl-summary, .mo-summary, .mn-summary, p, div, li') || node;
    if (block) {
      block.style.textAlign = align;
      triggerResumeContentChanged();
      return;
    }
  }

  if (activeSelectedElement) {
    activeSelectedElement.style.textAlign = align;
    triggerResumeContentChanged();
  }
}

function clearSelectionFormatting() {
  restoreSavedSelection();
  const sel = window.getSelection();
  if (sel && sel.rangeCount && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;

    if (node.tagName === 'SPAN' && node.dataset.canvaEditable !== 'true') {
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    } else {
      try { document.execCommand('removeFormat', false, null); } catch(e) {}
    }
  } else if (activeSelectedElement) {
    activeSelectedElement.style.fontFamily = '';
    activeSelectedElement.style.fontSize = '';
    activeSelectedElement.style.color = '';
    activeSelectedElement.style.fontWeight = '';
    activeSelectedElement.style.fontStyle = '';
    activeSelectedElement.style.textDecoration = '';
    activeSelectedElement.style.textAlign = '';
    const spans = activeSelectedElement.querySelectorAll('span');
    spans.forEach(s => {
      if (s.dataset.canvaEditable !== 'true') {
        s.replaceWith(document.createTextNode(s.textContent));
      }
    });
  }
  triggerResumeContentChanged();
}

function triggerResumeContentChanged() {
  const sel = window.getSelection();
  let anchor = sel && sel.anchorNode ? (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode) : null;
  const target = (anchor && anchor.closest('[data-canva-editable="true"]')) || activeSelectedElement || document.activeElement?.closest('[data-canva-editable="true"]');
  if (target) {
    const path = target.dataset.editPath;
    const content = /<(span|b|i|u|strong|em)\\b/i.test(target.innerHTML) ? target.innerHTML : target.innerText.trim();
    if (path) {
      handlePathUpdate(path, content, target);
    }
  }

  updateLiveATSReadiness();
  try {
    localStorage.setItem('resumatic_state', JSON.stringify(state));
  } catch(e) {}
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
loadFromStorage();
initViewModeSwitcher();
initDedicatedEditorHeader();
initElementSelectionEngine();
initTextSelectionToolbar();
initCanvaLiveEditor();
initSkillEnhancer();
renderAll();
`;

let orig = fs.readFileSync('backend/public/preview-script.js', 'utf8');
const marker = '//  DEDICATED LIGHTWEIGHT SELECTION ENGINE';
const idx = orig.indexOf(marker);
if (idx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}
// Find the preceding comment line
const preMarker = orig.lastIndexOf('// ═════', idx);
const before = orig.substring(0, preMarker);
const finalContent = before + newCode;

fs.writeFileSync('backend/public/preview-script.js', finalContent, 'utf8');
fs.writeFileSync('preview-script.js', finalContent, 'utf8');
console.log('Successfully applied editor canvas engine to both preview-script.js files! Length:', finalContent.length);
