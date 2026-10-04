// ══════════════════════════════════════════════════════
//  PDF TEXT RENDERER — Generates ATS-compatible PDFs
//  with real selectable text (not rasterized images)
//  Replaces the old html2canvas → JPEG → addImage pipeline
// ══════════════════════════════════════════════════════

/**
 * Creates a PDF rendering context with helper methods
 * for drawing text, dividers, sections, and managing
 * page breaks on A4 paper.
 */
function createPDFRenderer() {
  var jsPDFLib = window.jspdf.jsPDF;
  var pdf = new jsPDFLib({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  var PAGE_W = 210;
  var PAGE_H = 297;
  var MARGIN = { top: 22, bottom: 18, left: 24, right: 24 };
  var CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right;
  var curY = MARGIN.top;

  /** Approximate line height in mm for a given font size in pt */
  function lineH(fontSize) {
    return fontSize * 0.45;
  }

  /** Check if we need a page break; adds a new page if so */
  function checkBreak(needed) {
    if (curY + needed > PAGE_H - MARGIN.bottom) {
      pdf.addPage();
      curY = MARGIN.top;
      return true;
    }
    return false;
  }

  /**
   * Draw text at position (x, curY).
   * Supports optional word-wrapping via opts.maxWidth.
   * Returns number of lines rendered.
   */
  function drawText(str, x, fontSize, opts) {
    if (!str) return 0;
    opts = opts || {};
    var font  = opts.font  || 'helvetica';
    var style = opts.style || 'normal';
    var color = opts.color || [26, 29, 38];
    var align = opts.align || 'left';
    var maxWidth = opts.maxWidth;

    pdf.setFont(font, style);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);

    if (maxWidth) {
      var lines = pdf.splitTextToSize(str, maxWidth);
      var lh = lineH(fontSize);
      for (var i = 0; i < lines.length; i++) {
        checkBreak(lh);
        pdf.text(lines[i], x, curY, { align: align });
        curY += lh;
      }
      return lines.length;
    } else {
      var lh = lineH(fontSize);
      checkBreak(lh);
      pdf.text(str, x, curY, { align: align });
      curY += lh;
      return 1;
    }
  }

  /** Convenience: draw wrapped text */
  function wrappedText(str, x, maxWidth, fontSize, opts) {
    opts = opts || {};
    opts.maxWidth = maxWidth;
    return drawText(str, x, fontSize, opts);
  }

  /** Draw a horizontal divider at curY */
  function drawDivider(x1, x2, color, width) {
    color = color || [220, 220, 225];
    width = width || 0.3;
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(width);
    pdf.line(x1, curY, x2, curY);
    curY += 3;
  }

  /** Advance the Y cursor */
  function space(mm) {
    curY += mm;
  }

  /** Draw a section header with uppercase title + underline */
  function sectionHeader(title, x1, x2) {
    checkBreak(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(26, 29, 38);
    pdf.text(title.toUpperCase(), x1, curY);
    curY += 3.5;
    drawDivider(x1, x2, [229, 231, 235], 0.4);
    space(1);
  }

  /** Draw a filled rectangle */
  function drawRect(x, y, w, h, color) {
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(x, y, w, h, 'F');
  }

  /** Add the Resumatic watermark at the bottom */
  function addWatermark() {
    space(8);
    checkBreak(10);
    drawDivider(MARGIN.left, PAGE_W - MARGIN.right, [203, 213, 225], 0.3);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Built with Resumatic \u2022 resumatic.ai (Free ATS Resume Builder)', PAGE_W / 2, curY, { align: 'center' });
  }

  /** Set PDF document metadata for ATS parsers */
  function setMetadata(state) {
    var p = state.personal;
    var fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
    pdf.setProperties({
      title: fullName + ' - Resume',
      subject: p.title || 'Professional Resume',
      author: fullName,
      keywords: (state.skills.tech || []).join(', '),
      creator: 'Resumatic AI Resume Builder',
    });
  }

  return {
    pdf: pdf,
    get y() { return curY; },
    set y(val) { curY = val; },
    lineH: lineH,
    checkBreak: checkBreak,
    text: drawText,
    wrappedText: wrappedText,
    divider: drawDivider,
    space: space,
    sectionHeader: sectionHeader,
    rect: drawRect,
    addWatermark: addWatermark,
    setMetadata: setMetadata,
    PAGE_W: PAGE_W,
    PAGE_H: PAGE_H,
    MARGIN: MARGIN,
    CONTENT_W: CONTENT_W,
  };
}


function formatSkillForPDF(s) {
  if (!s) return '';
  var trimmed = s.trim();
  var paren = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (paren) return paren[1].trim() + ' (' + paren[2].trim() + ')';
  var dash = trimmed.match(/^(.+?)\s*[-:]\s*(beginner|intermediate|advanced|expert|proficient|senior|lead|mid|entry)$/i);
  if (dash) return dash[1].trim() + ' (' + dash[2].trim() + ')';
  return trimmed;
}

// ══════════════════════════════════════════════════════
//  CLASSIC TEMPLATE PDF
//  Single column, centered header, section dividers
// ══════════════════════════════════════════════════════
function renderClassicPDF(r, state) {
  var p  = state.personal;
  var M  = r.MARGIN;
  var PW = r.PAGE_W;
  var CW = r.CONTENT_W;
  var fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';

  // ── Header ──
  r.text(fullName.toUpperCase(), PW / 2, 24, { style: 'bold', align: 'center' });
  r.space(2);

  if (p.title) {
    r.text(p.title.toUpperCase(), PW / 2, 9.5, { color: [120, 120, 128], align: 'center' });
    r.space(4);
  }

  // ── Contact ──
  var contacts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
  if (contacts.length) {
    r.divider(M.left, PW - M.right, [200, 200, 200], 0.3);
    r.space(2);
    var contactLine = contacts.join('   \u2022   ');
    r.wrappedText(contactLine, PW / 2, CW, 8.5, { color: [100, 100, 110], align: 'center' });
    r.space(3);
  }

  var del = state.deletedSegments || {};

  // ── Profile / Summary ──
  if (p.summary && !del.summary) {
    r.sectionHeader('Profile', M.left, PW - M.right);
    r.wrappedText(p.summary, M.left, CW, 9.5, { color: [55, 65, 81], style: 'italic' });
    r.space(5);
  }

  // ── Experience ──
  var exp = (state.experience || []).filter(function(e) { return e.role || e.company; });
  if (exp.length && !del.experience) {
    r.sectionHeader('Experience', M.left, PW - M.right);
    for (var ei = 0; ei < exp.length; ei++) {
      var e = exp[ei];
      r.checkBreak(16);

      // Title + Date
      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(10.5);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text(e.role || '\u2014', M.left, r.y);

      var dateStr = [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ');
      if (dateStr) {
        r.pdf.setFont('helvetica', 'normal');
        r.pdf.setFontSize(9);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text(dateStr, PW - M.right, r.y, { align: 'right' });
      }
      r.space(r.lineH(10.5));

      // Company
      if (e.company) {
        r.text(e.company, M.left, 9, { color: [100, 100, 110] });
        r.space(1.5);
      }

      // Description
      if (e.description) {
        r.wrappedText(e.description, M.left, CW, 9, { color: [55, 65, 81] });
      }

      if (ei < exp.length - 1) r.space(5);
    }
    r.space(5);
  }

  // ── Projects ──
  var proj = (state.projects || []).filter(function(pj) { return pj.name || pj.title; });
  if (proj.length && !del.projects) {
    r.sectionHeader('Projects', M.left, PW - M.right);
    for (var pi = 0; pi < proj.length; pi++) {
      var pj = proj[pi];
      r.checkBreak(16);

      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(10.5);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text(pj.name || pj.title || '\u2014', M.left, r.y);

      var pDate = [pj.startDate, pj.endDate].filter(Boolean).join(' \u2013 ');
      if (pDate) {
        r.pdf.setFont('helvetica', 'normal');
        r.pdf.setFontSize(9);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text(pDate, PW - M.right, r.y, { align: 'right' });
      }
      r.space(r.lineH(10.5));

      var subInfo = [pj.type || '', pj.link || pj.liveUrl || ''].filter(Boolean).join(' \u2022 ');
      if (subInfo) {
        r.text(subInfo, M.left, 9, { color: [100, 100, 110] });
        r.space(1.5);
      }

      if (pj.description) {
        r.wrappedText(pj.description, M.left, CW, 9, { color: [55, 65, 81] });
      }

      if (pi < proj.length - 1) r.space(5);
    }
    r.space(5);
  }

  // ── Education ──
  var edu = (state.education || []).filter(function(e) { return e.degree || e.institution; });
  if (edu.length && !del.education) {
    r.sectionHeader('Education', M.left, PW - M.right);
    for (var di = 0; di < edu.length; di++) {
      var d = edu[di];
      r.checkBreak(14);

      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(10.5);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text(d.degree || '\u2014', M.left, r.y);

      var eduDate = [d.startYear, d.endYear].filter(Boolean).join(' \u2013 ');
      if (eduDate) {
        r.pdf.setFont('helvetica', 'normal');
        r.pdf.setFontSize(9);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text(eduDate, PW - M.right, r.y, { align: 'right' });
      }
      r.space(r.lineH(10.5));

      if (d.institution) {
        r.text(d.institution, M.left, 9, { color: [100, 100, 110] });
        r.space(1.5);
      }
      if (d.details || d.info) {
        r.wrappedText(d.details || d.info, M.left, CW, 8.5, { color: [80, 80, 90] });
      }

      if (di < edu.length - 1) r.space(4);
    }
    r.space(5);
  }

  // ── Skills ──
  var sk = state.skills || {};
  var hasTech = sk.tech && sk.tech.length && !del.tech;
  var hasSoft = sk.soft && sk.soft.length && !del.soft;
  var hasLang = sk.languages && sk.languages.length && !del.languages;
  if (hasTech || hasSoft || hasLang) {
    r.sectionHeader('Skills & Proficiencies', M.left, PW - M.right);

    if (hasTech) {
      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(8);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text('TECHNICAL', M.left, r.y);
      r.space(r.lineH(8) + 1);
      r.wrappedText(sk.tech.map(formatSkillForPDF).join('  \u00B7  '), M.left, CW, 9, { color: [55, 65, 81] });
      r.space(4);
    }

    if (hasSoft) {
      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(8);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text('SOFT SKILLS', M.left, r.y);
      r.space(r.lineH(8) + 1);
      r.wrappedText(sk.soft.map(formatSkillForPDF).join('  \u00B7  '), M.left, CW, 9, { color: [55, 65, 81] });
      r.space(4);
    }

    if (hasLang) {
      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(8);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text('LANGUAGES', M.left, r.y);
      r.space(r.lineH(8) + 1);
      r.wrappedText(sk.languages.map(formatSkillForPDF).join('  \u00B7  '), M.left, CW, 9, { color: [55, 65, 81] });
    }
  }

  r.addWatermark();
}


// ══════════════════════════════════════════════════════
//  MINIMAL TEMPLATE PDF
//  Two-column: narrow labels on left, content on right
// ══════════════════════════════════════════════════════
function renderMinimalPDF(r, state) {
  var p  = state.personal;
  var M  = r.MARGIN;
  var PW = r.PAGE_W;
  var fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';

  var labelColW = 28;
  var contentX  = M.left + labelColW + 6;
  var contentW  = PW - contentX - M.right;

  // ── Header: Name/Title on left, Contacts on right (matching Minimal template) ──
  var headerTopY = r.y;
  var leftY = headerTopY;

  r.pdf.setFont('helvetica', 'bold');
  r.pdf.setFontSize(22);
  r.pdf.setTextColor(26, 29, 38);
  r.pdf.text(fullName.toUpperCase(), M.left, leftY + 6);
  leftY += 6 + 2.5;

  if (p.title) {
    r.pdf.setFont('helvetica', 'normal');
    r.pdf.setFontSize(8.5);
    r.pdf.setTextColor(120, 120, 128);
    r.pdf.text(p.title.toUpperCase(), M.left, leftY + 3.5);
    leftY += 3.5 + 2;
  }

  var contacts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
  var rightY = headerTopY;
  if (contacts.length) {
    r.pdf.setFont('helvetica', 'normal');
    r.pdf.setFontSize(8);
    r.pdf.setTextColor(100, 100, 110);
    for (var ci = 0; ci < contacts.length; ci++) {
      r.pdf.text(contacts[ci], PW - M.right, rightY + 3.5, { align: 'right' });
      rightY += 4.5;
    }
  }

  r.y = Math.max(leftY, rightY) + 3;
  r.divider(M.left, PW - M.right, [26, 29, 38], 0.6);
  r.space(4);

  // ── Section row helper: label on left, content on right ──
  function sectionRow(label, contentFn) {
    r.checkBreak(15);

    // Label (small uppercase, gray)
    r.pdf.setFont('helvetica', 'bold');
    r.pdf.setFontSize(7);
    r.pdf.setTextColor(120, 120, 128);
    r.pdf.text(label.toUpperCase(), M.left, r.y);

    // Content
    contentFn(contentX, contentW);
    r.space(7);
  }

  var del = state.deletedSegments || {};

  // ── Profile ──
  if (p.summary && !del.summary) {
    sectionRow('Profile', function(x, w) {
      r.wrappedText(p.summary, x, w, 9.5, { color: [55, 65, 81], style: 'italic' });
    });
  }

  // ── Experience ──
  var exp = (state.experience || []).filter(function(e) { return e.role || e.company; });
  if (exp.length && !del.experience) {
    sectionRow('Experience', function(x, w) {
      for (var ei = 0; ei < exp.length; ei++) {
        var e = exp[ei];
        r.checkBreak(14);

        r.pdf.setFont('helvetica', 'bold');
        r.pdf.setFontSize(10);
        r.pdf.setTextColor(26, 29, 38);
        r.pdf.text(e.role || '\u2014', x, r.y);

        var dateStr = [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ');
        if (dateStr) {
          r.pdf.setFont('helvetica', 'normal');
          r.pdf.setFontSize(8.5);
          r.pdf.setTextColor(120, 120, 128);
          r.pdf.text(dateStr, PW - M.right, r.y, { align: 'right' });
        }
        r.space(r.lineH(10));

        if (e.company) {
          r.text(e.company, x, 8.5, { color: [100, 100, 110] });
          r.space(1.5);
        }

        if (e.description) {
          r.wrappedText(e.description, x, w, 8.5, { color: [55, 65, 81] });
        }

        if (ei < exp.length - 1) r.space(5);
      }
    });
  }

  // ── Projects ──
  var proj = (state.projects || []).filter(function(pj) { return pj.name || pj.title; });
  if (proj.length && !del.projects) {
    sectionRow('Projects', function(x, w) {
      for (var pi = 0; pi < proj.length; pi++) {
        var pj = proj[pi];
        r.checkBreak(14);

        r.pdf.setFont('helvetica', 'bold');
        r.pdf.setFontSize(10);
        r.pdf.setTextColor(26, 29, 38);
        r.pdf.text(pj.name || pj.title || '\u2014', x, r.y);

        var pDate = [pj.startDate, pj.endDate].filter(Boolean).join(' \u2013 ');
        if (pDate) {
          r.pdf.setFont('helvetica', 'normal');
          r.pdf.setFontSize(8.5);
          r.pdf.setTextColor(120, 120, 128);
          r.pdf.text(pDate, PW - M.right, r.y, { align: 'right' });
        }
        r.space(r.lineH(10));

        var subInfo = [pj.type || '', pj.link || pj.liveUrl || ''].filter(Boolean).join(' \u2022 ');
        if (subInfo) {
          r.text(subInfo, x, 8.5, { color: [100, 100, 110] });
          r.space(1.5);
        }

        if (pj.description) {
          r.wrappedText(pj.description, x, w, 8.5, { color: [55, 65, 81] });
        }

        if (pi < proj.length - 1) r.space(5);
      }
    });
  }

  // ── Education ──
  var edu = (state.education || []).filter(function(e) { return e.degree || e.institution; });
  if (edu.length && !del.education) {
    sectionRow('Education', function(x, w) {
      for (var di = 0; di < edu.length; di++) {
        var d = edu[di];
        r.checkBreak(12);

        r.pdf.setFont('helvetica', 'bold');
        r.pdf.setFontSize(10);
        r.pdf.setTextColor(26, 29, 38);
        r.pdf.text(d.degree || '\u2014', x, r.y);

        var eduDate = [d.startYear, d.endYear].filter(Boolean).join(' \u2013 ');
        if (eduDate) {
          r.pdf.setFont('helvetica', 'normal');
          r.pdf.setFontSize(8.5);
          r.pdf.setTextColor(120, 120, 128);
          r.pdf.text(eduDate, PW - M.right, r.y, { align: 'right' });
        }
        r.space(r.lineH(10));

        if (d.institution) {
          r.text(d.institution, x, 8.5, { color: [100, 100, 110] });
        }

        if (di < edu.length - 1) r.space(4);
      }
    });
  }

  // ── Skills ──
  var sk = state.skills || {};
  var hasTech = sk.tech && sk.tech.length && !del.tech;
  var hasSoft = sk.soft && sk.soft.length && !del.soft;
  var hasLang = sk.languages && sk.languages.length && !del.languages;
  if (hasTech || hasSoft || hasLang) {
    sectionRow('Skills & Proficiencies', function(x, w) {
      if (hasTech) {
        r.pdf.setFont('helvetica', 'bold');
        r.pdf.setFontSize(7);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text('TECHNICAL', x, r.y);
        r.space(r.lineH(7) + 1.5);
        r.wrappedText(sk.tech.map(formatSkillForPDF).join('  \u00B7  '), x, w, 8.5, { color: [50, 50, 60] });
        r.space(4);
      }
      if (hasSoft) {
        r.pdf.setFont('helvetica', 'bold');
        r.pdf.setFontSize(7);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text('SOFT SKILLS', x, r.y);
        r.space(r.lineH(7) + 1.5);
        r.wrappedText(sk.soft.map(formatSkillForPDF).join('  \u00B7  '), x, w, 8.5, { color: [50, 50, 60] });
        r.space(4);
      }
      if (hasLang) {
        r.pdf.setFont('helvetica', 'bold');
        r.pdf.setFontSize(7);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text('LANGUAGES', x, r.y);
        r.space(r.lineH(7) + 1.5);
        r.wrappedText(sk.languages.map(formatSkillForPDF).join('  \u00B7  '), x, w, 8.5, { color: [50, 50, 60] });
      }
    });
  }

  r.addWatermark();
}


// ══════════════════════════════════════════════════════
//  MODERN TEMPLATE PDF
//  Dark sidebar (left) + white main content (right)
// ══════════════════════════════════════════════════════
function renderModernPDF(r, state) {
  var p  = state.personal;
  var M  = r.MARGIN;
  var PW = r.PAGE_W;
  var PH = r.PAGE_H;
  var fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';

  var sideW       = 62;
  var mainX       = sideW + 10;
  var mainW       = PW - mainX - M.right;
  var sideTextX   = 10;
  var sideContentW = sideW - 18;

  // ── Sidebar background (full page 1 height) ──
  r.rect(0, 0, sideW, PH, [32, 28, 52]);

  // ═══════════════════════════════════════
  //  SIDEBAR CONTENT
  // ═══════════════════════════════════════
  r.y = 28;

  // Initials
  var initials = [p.firstName, p.lastName]
    .filter(Boolean)
    .map(function(n) { return n[0].toUpperCase(); })
    .join('') || '?';

  r.pdf.setFont('helvetica', 'bold');
  r.pdf.setFontSize(20);
  r.pdf.setTextColor(255, 255, 255);
  r.pdf.text(initials, sideW / 2, r.y, { align: 'center' });
  r.space(10);

  // Name
  r.pdf.setFont('helvetica', 'bold');
  r.pdf.setFontSize(12);
  r.pdf.setTextColor(255, 255, 255);
  var nameLines = r.pdf.splitTextToSize(fullName, sideContentW);
  for (var ni = 0; ni < nameLines.length; ni++) {
    r.pdf.text(nameLines[ni], sideW / 2, r.y, { align: 'center' });
    r.space(5);
  }
  r.space(1);

  // Title
  if (p.title) {
    r.pdf.setFont('helvetica', 'normal');
    r.pdf.setFontSize(8);
    r.pdf.setTextColor(196, 181, 253);
    var titleLines = r.pdf.splitTextToSize(p.title, sideContentW);
    for (var ti = 0; ti < titleLines.length; ti++) {
      r.pdf.text(titleLines[ti], sideW / 2, r.y, { align: 'center' });
      r.space(3.5);
    }
    r.space(6);
  }

  // Sidebar section header helper
  function sideSection(title) {
    r.pdf.setFont('helvetica', 'bold');
    r.pdf.setFontSize(7.5);
    r.pdf.setTextColor(196, 181, 253);
    r.pdf.text(title.toUpperCase(), sideTextX, r.y);
    r.space(2.5);
    r.pdf.setDrawColor(80, 72, 110);
    r.pdf.setLineWidth(0.2);
    r.pdf.line(sideTextX, r.y, sideW - 8, r.y);
    r.space(4);
  }

  // Sidebar text helper
  function sideText(str) {
    r.pdf.setFont('helvetica', 'normal');
    r.pdf.setFontSize(7.5);
    r.pdf.setTextColor(210, 200, 240);
    var lines = r.pdf.splitTextToSize(str, sideContentW);
    for (var li = 0; li < lines.length; li++) {
      r.pdf.text(lines[li], sideTextX, r.y);
      r.space(3.5);
    }
  }

  // Contact
  sideSection('Contact');
  var contacts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
  for (var ci = 0; ci < contacts.length; ci++) {
    sideText(contacts[ci]);
    r.space(1.5);
  }
  r.space(4);

  var del = state.deletedSegments || {};

  // Skills in sidebar
  var sk = state.skills || {};
  if (sk.tech && sk.tech.length && !del.tech) {
    sideSection('Technical');
    sideText(sk.tech.map(formatSkillForPDF).join(', '));
    r.space(4);
  }
  if (sk.soft && sk.soft.length && !del.soft) {
    sideSection('Soft Skills');
    sideText(sk.soft.map(formatSkillForPDF).join(', '));
    r.space(4);
  }
  if (sk.languages && sk.languages.length && !del.languages) {
    sideSection('Languages');
    sideText(sk.languages.map(formatSkillForPDF).join(', '));
  }

  // ═══════════════════════════════════════
  //  MAIN CONTENT AREA (right side)
  // ═══════════════════════════════════════
  r.y = 28;

  // Name
  r.pdf.setFont('helvetica', 'bold');
  r.pdf.setFontSize(20);
  r.pdf.setTextColor(26, 29, 38);
  r.pdf.text(fullName, mainX, r.y);
  r.space(7);

  if (p.title) {
    r.pdf.setFont('helvetica', 'normal');
    r.pdf.setFontSize(10);
    r.pdf.setTextColor(120, 120, 128);
    r.pdf.text(p.title, mainX, r.y);
    r.space(9);
  }

  // Main section title helper
  function mainSectionTitle(title) {
    r.checkBreak(12);
    r.pdf.setFont('helvetica', 'bold');
    r.pdf.setFontSize(10);
    r.pdf.setTextColor(108, 92, 231);
    r.pdf.text(title, mainX, r.y);
    r.space(5);
  }

  // Profile
  if (p.summary && !del.summary) {
    mainSectionTitle('Profile');
    r.wrappedText(p.summary, mainX, mainW, 9, { color: [55, 65, 81] });
    r.space(7);
  }

  // Experience
  var exp = (state.experience || []).filter(function(e) { return e.role || e.company; });
  if (exp.length && !del.experience) {
    mainSectionTitle('Experience');
    for (var ei = 0; ei < exp.length; ei++) {
      var e = exp[ei];
      r.checkBreak(14);

      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(10);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text(e.role || '\u2014', mainX, r.y);

      var dateStr = [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ');
      if (dateStr) {
        r.pdf.setFont('helvetica', 'normal');
        r.pdf.setFontSize(8.5);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text(dateStr, PW - M.right, r.y, { align: 'right' });
      }
      r.space(r.lineH(10));

      if (e.company) {
        r.text(e.company, mainX, 8.5, { color: [108, 92, 231] });
        r.space(1.5);
      }

      if (e.description) {
        r.wrappedText(e.description, mainX, mainW, 8.5, { color: [55, 65, 81] });
      }

      if (ei < exp.length - 1) r.space(5);
    }
    r.space(7);
  }

  // Projects
  var proj = (state.projects || []).filter(function(pj) { return pj.name || pj.title; });
  if (proj.length && !del.projects) {
    mainSectionTitle('Projects');
    for (var pi = 0; pi < proj.length; pi++) {
      var pj = proj[pi];
      r.checkBreak(14);

      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(10);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text(pj.name || pj.title || '\u2014', mainX, r.y);

      var pDate = [pj.startDate, pj.endDate].filter(Boolean).join(' \u2013 ');
      if (pDate) {
        r.pdf.setFont('helvetica', 'normal');
        r.pdf.setFontSize(8.5);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text(pDate, PW - M.right, r.y, { align: 'right' });
      }
      r.space(r.lineH(10));

      var subInfo = [pj.type || '', pj.link || pj.liveUrl || ''].filter(Boolean).join(' \u2022 ');
      if (subInfo) {
        r.text(subInfo, mainX, 8.5, { color: [108, 92, 231] });
        r.space(1.5);
      }

      if (pj.description) {
        r.wrappedText(pj.description, mainX, mainW, 8.5, { color: [55, 65, 81] });
      }

      if (pi < proj.length - 1) r.space(5);
    }
    r.space(7);
  }

  // Education
  var edu = (state.education || []).filter(function(e) { return e.degree || e.institution; });
  if (edu.length && !del.education) {
    mainSectionTitle('Education');
    for (var di = 0; di < edu.length; di++) {
      var d = edu[di];
      r.checkBreak(12);

      r.pdf.setFont('helvetica', 'bold');
      r.pdf.setFontSize(10);
      r.pdf.setTextColor(26, 29, 38);
      r.pdf.text(d.degree || '\u2014', mainX, r.y);

      var eduDate = [d.startYear, d.endYear].filter(Boolean).join(' \u2013 ');
      if (eduDate) {
        r.pdf.setFont('helvetica', 'normal');
        r.pdf.setFontSize(8.5);
        r.pdf.setTextColor(120, 120, 128);
        r.pdf.text(eduDate, PW - M.right, r.y, { align: 'right' });
      }
      r.space(r.lineH(10));

      if (d.institution) {
        r.text(d.institution, mainX, 8.5, { color: [100, 100, 110] });
        r.space(1.5);
      }

      if (di < edu.length - 1) r.space(4);
    }
  }

  // Watermark at bottom of page
  r.y = PH - 12;
  r.pdf.setFont('helvetica', 'normal');
  r.pdf.setFontSize(7);
  r.pdf.setTextColor(148, 163, 184);
  r.pdf.text('Built with Resumatic \u2022 resumatic.ai (Free ATS Resume Builder)', PW / 2, r.y, { align: 'center' });
}

/**
 * Main entry point: renders a complete ATS-compatible PDF with real selectable text
 * for any of the supported templates ('classic', 'modern', 'minimal').
 * Returns the jsPDF document instance.
 */
function renderPDFFromState(state, template) {
  var r = createPDFRenderer();
  r.setMetadata(state);

  switch (template) {
    case 'minimal':
      renderMinimalPDF(r, state);
      break;
    case 'modern':
      renderModernPDF(r, state);
      break;
    case 'classic':
    default:
      renderClassicPDF(r, state);
      break;
  }

  return r.pdf;
}

if (typeof window !== 'undefined') {
  window.renderPDFFromState = renderPDFFromState;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderPDFFromState: renderPDFFromState, createPDFRenderer: createPDFRenderer };
}
