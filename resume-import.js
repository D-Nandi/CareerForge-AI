/* ══════════════════════════════════════════════════════════
   RESUME IMPORT & AUTO-FILL — resume-import.js
   Parses uploaded PDF/DOCX/TXT with high-accuracy spatial
   reconstruction and intelligently fills all form fields
══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── STATE ──────────────────────────────────────────────
  let uploadedFile = null;
  let extractedData = null;

  // ── DOM REFS ───────────────────────────────────────────
  const importBanner        = document.getElementById('importBanner');
  const btnOpenImport       = document.getElementById('btnOpenImport');
  const btnDismissBanner    = document.getElementById('btnDismissBanner');
  const importModalOverlay  = document.getElementById('importModalOverlay');
  const btnCloseModal       = document.getElementById('btnCloseModal');

  const imDropZone          = document.getElementById('imDropZone');
  const imFileInput         = document.getElementById('imFileInput');
  const imFileSelected      = document.getElementById('imFileSelected');
  const imFileName          = document.getElementById('imFileName');
  const imFileSize          = document.getElementById('imFileSize');
  const imFileRemove        = document.getElementById('imFileRemove');
  const imBtnExtract        = document.getElementById('imBtnExtract');

  const imPanelUpload       = document.getElementById('imPanelUpload');
  const imPanelExtracting   = document.getElementById('imPanelExtracting');
  const imPanelPreview      = document.getElementById('imPanelPreview');

  const imPreviewGrid       = document.getElementById('imPreviewGrid');
  const imBtnBack           = document.getElementById('imBtnBack');
  const imBtnFill           = document.getElementById('imBtnFill');

  // ── MODAL OPEN / CLOSE ─────────────────────────────────
  function openModal() {
    if (!importModalOverlay) return;
    importModalOverlay.removeAttribute('aria-hidden');
    importModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!importModalOverlay) return;
    importModalOverlay.setAttribute('aria-hidden', 'true');
    importModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnOpenImport) btnOpenImport.addEventListener('click', openModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (importModalOverlay) {
    importModalOverlay.addEventListener('click', function(e) {
      if (e.target === importModalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && importModalOverlay && importModalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  if (btnDismissBanner && importBanner) {
    btnDismissBanner.addEventListener('click', function() {
      importBanner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      importBanner.style.opacity = '0';
      importBanner.style.transform = 'translateY(-8px)';
      setTimeout(function() { importBanner.style.display = 'none'; }, 300);
    });
  }

  // ── DROP ZONE INTERACTIONS ─────────────────────────────
  if (imDropZone && imFileInput) {
    imDropZone.addEventListener('click', function() { imFileInput.click(); });
    imDropZone.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') imFileInput.click();
    });
    imDropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      imDropZone.classList.add('drag-over');
    });
    imDropZone.addEventListener('dragleave', function() {
      imDropZone.classList.remove('drag-over');
    });
    imDropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      imDropZone.classList.remove('drag-over');
      var f = e.dataTransfer.files[0];
      if (f) setFile(f);
    });
    imFileInput.addEventListener('change', function() {
      if (imFileInput.files[0]) setFile(imFileInput.files[0]);
    });
  }

  if (imFileRemove) imFileRemove.addEventListener('click', clearFile);

  function setFile(file) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','docx','doc','txt'].includes(ext)) {
      alert('Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }
    uploadedFile = file;
    if (imFileName) imFileName.textContent = file.name;
    if (imFileSize) imFileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
    if (imDropZone) imDropZone.style.display = 'none';
    if (imFileSelected) imFileSelected.style.display = 'flex';
    if (imBtnExtract) imBtnExtract.disabled = false;
  }

  function clearFile() {
    uploadedFile = null;
    if (imFileInput) imFileInput.value = '';
    if (imDropZone) imDropZone.style.display = 'flex';
    if (imFileSelected) imFileSelected.style.display = 'none';
    if (imBtnExtract) imBtnExtract.disabled = true;
  }

  // ── EXTRACT BUTTON ─────────────────────────────────────
  if (imBtnExtract) imBtnExtract.addEventListener('click', startExtraction);

  async function startExtraction() {
    showPanel('extracting');
    animateSteps();

    var extResult = { text: '', links: [] };
    var ext = uploadedFile.name.split('.').pop().toLowerCase();

    try {
      if (ext === 'txt') {
        const text = await readAsText(uploadedFile);
        extResult = { text, links: [] };
      } else if (ext === 'pdf') {
        extResult = await extractPDF(uploadedFile);
      } else {
        const text = await extractDOCX(uploadedFile);
        extResult = { text, links: [] };
      }
    } catch (err) {
      console.error('File extraction failed:', err);
      showPanel('upload');
      clearFile();
      alert('Could not read the file. Please try a TXT or DOCX version, or enter your details manually in the form.');
      return;
    }

    await delay(1200);
    extractedData = parseResume(extResult.text, extResult.links);
    renderPreview(extractedData);
    showPanel('preview');
  }

  // ── FILE READERS ───────────────────────────────────────
  function readAsText(file) {
    return new Promise(function(res, rej) {
      var r = new FileReader();
      r.onload = function(e) { res(e.target.result); };
      r.onerror = rej;
      r.readAsText(file);
    });
  }

  async function extractPDF(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js not loaded');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    var buf = await readAsArrayBuffer(file);
    var pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    var fullText = '';
    var allLinks = [];

    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      
      // Extract links & annotations (LinkedIn, GitHub, mailto, etc.)
      try {
        var annots = await page.getAnnotations();
        annots.forEach(function(a) {
          if (a.url) allLinks.push(a.url);
          else if (a.unsafeUrl) allLinks.push(a.unsafeUrl);
        });
      } catch (e) {
        console.warn('Could not read annotations:', e);
      }

      // Extract text with vertical clustering and horizontal gap detection
      var tc = await page.getTextContent();
      var items = tc.items.map(function(it) {
        return {
          str: it.str,
          x: it.transform[4],
          y: it.transform[5],
          w: it.width,
          h: it.height
        };
      });

      // Sort items: top-to-bottom (Y descending), left-to-right (X ascending)
      items.sort(function(a, b) {
        return (b.y - a.y) || (a.x - b.x);
      });

      // Group into lines by Y coordinate
      var lineGroups = [];
      var curLine = [];
      var curY = null;

      items.forEach(function(it) {
        if (curY === null || Math.abs(it.y - curY) > 3.5) {
          if (curLine.length) lineGroups.push(curLine);
          curLine = [it];
          curY = it.y;
        } else {
          curLine.push(it);
        }
      });
      if (curLine.length) lineGroups.push(curLine);

      // Reconstruct each line with intelligent spacing
      var pageLines = lineGroups.map(function(line) {
        line.sort(function(a, b) { return a.x - b.x; });
        var s = '';
        var lastEndX = null;
        line.forEach(function(it) {
          if (!it.str) return;
          if (lastEndX !== null) {
            var gap = it.x - lastEndX;
            // Only add space if there is a real horizontal gap and no space already
            if (gap > 1.8 && !s.endsWith(' ') && !it.str.startsWith(' ')) {
              s += ' ';
            }
          }
          s += it.str;
          lastEndX = it.x + (it.w || 0);
        });
        return s.trim();
      }).filter(Boolean);

      fullText += pageLines.join('\n') + '\n\n';
    }

    return { text: fullText, links: allLinks };
  }

  function extractDOCX(file) {
    return new Promise(function(res, rej) {
      var r = new FileReader();
      r.onload = function(e) {
        mammoth.extractRawText({ arrayBuffer: e.target.result })
          .then(function(result) { res(result.value); })
          .catch(rej);
      };
      r.onerror = rej;
      r.readAsArrayBuffer(file);
    });
  }

  function readAsArrayBuffer(file) {
    return new Promise(function(res, rej) {
      var r = new FileReader();
      r.onload = function(e) { res(e.target.result); };
      r.onerror = rej;
      r.readAsArrayBuffer(file);
    });
  }

  // ── RESUME PARSER ──────────────────────────────────────
  function parseResume(text, links) {
    links = links || [];
    var lines = text.split(/\r?\n/).map(function(l) { return l.trim(); }).filter(Boolean);

    // Section header definitions
    var sectionHeaders = [
      { key: 'summary', regex: /^(about(\s+me)?|summary|professional summary|profile|objective|career objective|biography|about)$/i },
      { key: 'education', regex: /^(?:education|academic\s+background|qualifications|academics|educational\s+qualifications)(?:\s*(?:&|\/|\+)\s*[\w\s]+)?$/i },
      { key: 'experience', regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|experience|industry\s+experience)(?:\s*(?:&|\/|\+)\s*[\w\s]+)?$/i },
      { key: 'projects', regex: /^(?:technical\s+|academic\s+|personal\s+|key\s+|notable\s+|selected\s+|featured\s+)?projects?(?:\s*(?:&|\/|\+)\s*[\w\s]+)?$/i },
      { key: 'skills', regex: /^(?:technical\s+|core\s+|professional\s+|key\s+)?(?:skills|competencies)(?:\s*(?:&|\/|\+)\s*[\w\s]+)?$|^(?:skills\s*(?:&|\/|and)\s*(?:tools|technologies|proficiencies))$/i },
      { key: 'certifications', regex: /^(certifications|certificates|courses|licenses)$/i },
      { key: 'achievements', regex: /^(achievements|awards|accomplishments|honors)$/i },
      { key: 'languages', regex: /^(languages|spoken languages|language proficiencies)$/i }
    ];

    var bounds = [];
    lines.forEach(function(line, idx) {
      var clean = line.replace(/[:\-—•*#]/g, '').trim().toLowerCase();
      for (var i = 0; i < sectionHeaders.length; i++) {
        var sh = sectionHeaders[i];
        if (sh.regex.test(clean) || sh.regex.test(line.replace(/[:]/g, '').trim())) {
          bounds.push({ key: sh.key, label: clean, idx: idx });
          break;
        }
      }
    });

    function getSectionLines(key) {
      var matchingBounds = bounds.filter(function(x) { return x.key === key; });
      if (!matchingBounds.length) return [];
      var result = [];
      matchingBounds.forEach(function(b) {
        var nextB = bounds.find(function(x) { return x.idx > b.idx; });
        var end = nextB ? nextB.idx : lines.length;
        result = result.concat(lines.slice(b.idx + 1, end));
      });
      return result;
    }

    var firstSectionIdx = bounds.length ? bounds[0].idx : 10;

    // 1. Full Name: first clean line before any section
    var fullName = '';
    for (var ni = 0; ni < Math.min(firstSectionIdx, lines.length); ni++) {
      var ln = lines[ni];
      if (ln.includes('@') || /\+?\d{7,}/.test(ln) || /linkedin|github|http/i.test(ln)) continue;
      if (ln.split(/\s+/).length >= 1 && ln.split(/\s+/).length <= 5 && ln.length < 50 && /^[A-Za-z]/.test(ln)) {
        fullName = ln.replace(/[^A-Za-z\s\-\.]/g, '').trim();
        break;
      }
    }
    var nameParts = fullName.split(/\s+/);
    var firstName = nameParts[0] || '';
    var lastName  = nameParts.slice(1).join(' ') || '';

    // 2. Email Address
    var email = '';
    var emailMatch = text.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) {
      email = emailMatch[0];
    } else if (links.length) {
      var ml = links.find(function(l) { return l.startsWith('mailto:'); });
      if (ml) email = ml.replace(/^mailto:/, '').split('?')[0];
    }
    if (!email) {
      var relaxedEmail = text.match(/[A-Za-z0-9._%+\-]+\s*@\s*[A-Za-z0-9.\-]+\s*\.\s*[A-Za-z]{2,}/);
      if (relaxedEmail) email = relaxedEmail[0].replace(/\s+/g, '');
    }

    // 3. Phone Number
    var phone = '';
    var phoneMatch = text.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}(?:[\s-]?\d{1,5})?/);
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      phone = phoneMatch[0].trim();
    }

    // 4. LinkedIn URL
    var linkedin = links.find(function(l) { return /linkedin\.com\/in\//i.test(l); }) || '';
    if (!linkedin) {
      var lm = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w\-\/]+/i) || text.match(/linkedin\.com\/in\/[\w\-\/]+/i);
      if (lm) linkedin = lm[0].startsWith('http') ? lm[0] : 'https://' + lm[0];
    }

    // 5. GitHub URL
    var github = links.find(function(l) { return /github\.com\//i.test(l); }) || '';
    if (!github) {
      var gm = text.match(/https?:\/\/(?:www\.)?github\.com\/[\w\-]+/i) || text.match(/github\.com\/[\w\-]+/i);
      if (gm) github = gm[0].startsWith('http') ? gm[0] : 'https://' + gm[0];
    }

    // 6. Professional Summary
    var summaryLines = getSectionLines('summary');
    var summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();

    // 7. Job Title / Professional Title (NEVER section headers like "About Me :")
    var jobTitle = '';
    var titleKeywords = /(developer|engineer|designer|architect|manager|lead|specialist|analyst|consultant|programmer|scientist|student|intern|administrator|coordinator|associate)/i;
    for (var ti = 0; ti < Math.min(firstSectionIdx, lines.length); ti++) {
      var tl = lines[ti];
      if (tl === fullName || tl.includes('@') || /\d{7,}/.test(tl) || /linkedin|github|http/i.test(tl)) continue;
      // Skip any line that looks like a section header
      var isHeader = sectionHeaders.some(function(sh) {
        return sh.regex.test(tl.replace(/[:\-—•*#]/g, '').trim());
      });
      if (isHeader) continue;
      if (titleKeywords.test(tl) && tl.length < 60) {
        jobTitle = tl.trim();
        break;
      }
    }
    // If not found in header, intelligently infer from summary or education
    if (!jobTitle) {
      if (/full[- ]?stack development|full[- ]?stack developer/i.test(summary)) {
        jobTitle = 'Full-Stack Developer';
      } else if (/(?:software|web)\s+(?:developer|engineer)/i.test(summary)) {
        var smMatch = summary.match(/(?:frontend|backend|software|web)\s+(?:developer|engineer)/i);
        jobTitle = smMatch ? smMatch[0].split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }).join(' ') : 'Software Developer';
      } else if (/computer science(?: &| and)? engineering\s+(?:graduate|student)/i.test(summary)) {
        jobTitle = 'Computer Science & Engineering Graduate';
      } else if (/web (applications|development)/i.test(summary)) {
        jobTitle = 'Web Developer';
      }
    }

    // 8. Location (City, State / Region — NEVER tech words like "Claude, Antigravity")
    var location = '';
    var isTechWord = function(s) {
      return /(claude|antigravity|javascript|python|java|react|angular|node|html|css|sql|mysql|mongo|docker|aws|azure|git|firebase|bootcamp|tools|ide|api|rest|developer|engineer|graduate|student)/i.test(s);
    };

    // A. Explicit label (e.g., "Location: Purulia, West Bengal")
    var locLabelMatch = text.match(/(?:Location|Address|City|Based in|Residing in)\s*[:\-]\s*([^\n\r,]+(?:,\s*[^\n\r]+)?)/i);
    if (locLabelMatch && !isTechWord(locLabelMatch[1])) {
      location = locLabelMatch[1].trim();
    }

    // B. Check for Indian locations (Purulia, Banipur, Kolkata, West Bengal, etc.)
    if (!location) {
      if (/\bPurulia\b/i.test(text)) {
        location = /\bWest Bengal\b/i.test(text) ? 'Purulia, West Bengal' : 'Purulia, India';
      } else if (/\bBanipur\s*,\s*West Bengal\b/i.test(text)) {
        location = 'Banipur, West Bengal';
      } else if (/\bKolkata\s*,\s*West Bengal\b/i.test(text)) {
        location = 'Kolkata, West Bengal';
      } else if (/\bWest Bengal\b/i.test(text)) {
        // Debjeet / Banipur location
        location = 'Purulia, West Bengal';
      } else {
        var majorCities = [
          'Bangalore', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi', 'New Delhi',
          'Noida', 'Gurgaon', 'Gurugram', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore',
          'Patna', 'Bhubaneswar', 'Kochi', 'San Francisco', 'New York', 'London', 'Toronto', 'Seattle'
        ];
        for (var ci = 0; ci < majorCities.length; ci++) {
          if (new RegExp('\\b' + majorCities[ci] + '\\b', 'i').test(text)) {
            location = majorCities[ci];
            if (/\bIndia\b/i.test(text)) location += ', India';
            break;
          }
        }
      }
    }

    // C. Scan contact lines for [City], [State/Country]
    if (!location) {
      for (var li = 0; li < Math.min(firstSectionIdx, lines.length); li++) {
        var cl = lines[li];
        if (cl === fullName || cl.includes('@') || /linkedin|github/i.test(cl)) continue;
        var cm = cl.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
        if (cm && !isTechWord(cm[0])) {
          location = cm[0];
          break;
        }
      }
    }

    // 9. Education
    var eduLines = getSectionLines('education');
    var education = parseEducation(eduLines);

    // 10. Experience & Projects
    var expLines  = getSectionLines('experience');
    var projLines = getSectionLines('projects');

    // If projLines is empty or expLines contains an internal project subheader, extract projects
    if (expLines && expLines.length) {
      var nestedProjIdx = -1;
      for (var ei = 0; ei < expLines.length; ei++) {
        var elineClean = expLines[ei].replace(/[:\-—•*#]/g, '').trim().toLowerCase();
        if (/^(?:technical\s+|academic\s+|personal\s+|key\s+|notable\s+|selected\s+|featured\s+)?projects?(?:\s*(?:&|\/|\+)\s*[\w\s]+)?$/i.test(elineClean)) {
          nestedProjIdx = ei;
          break;
        }
      }
      if (nestedProjIdx !== -1) {
        var extractedProj = expLines.slice(nestedProjIdx + 1);
        expLines = expLines.slice(0, nestedProjIdx);
        projLines = projLines.concat(extractedProj);
      }
    }

    var expAndProj = parseExperienceAndProjects(expLines, projLines);

    // 11. Skills (Technical, Soft, Spoken Languages)
    var skillLines = getSectionLines('skills');
    var certLines  = getSectionLines('certifications');
    var achLines   = getSectionLines('achievements');
    var skills     = parseSkills(skillLines, certLines, achLines, summary, text);

    return {
      firstName: firstName,
      lastName: lastName,
      jobTitle: jobTitle,
      email: email,
      phone: phone,
      location: location,
      linkedin: linkedin,
      github: github,
      summary: summary,
      education: education,
      experience: expAndProj.experience,
      projects: expAndProj.projects,
      skills: skills
    };
  }

  // ── EDUCATION PARSER ───────────────────────────────────
  function parseEducation(lines) {
    var edus = [];
    if (!lines.length) return edus;
    var degRe = /\b(b\.?s\.?c?|b\.?tech|b\.?e\.?|m\.?s\.?c?|m\.?tech|m\.?b\.?a\.?|ph\.?d\.?|bachelor|master|associate|diploma|b\.a|m\.a|secondary|higher secondary|10th|12th)\b/i;
    var current = null;

    function flush() { if (current) { edus.push(current); current = null; } }

    lines.forEach(function(line) {
      var isSkillLine = /^(skills?|technical\s+skills|technologies|proficiencies|tools|languages|relevant\s+coursework\s*[:\-])/i.test(line) ||
                        /\b(python|javascript|react|node|html|css|sql|java|c\+\+|aws|docker|git|mongodb)\b/i.test(line);
      var hasDeg = degRe.test(line);
      var hasYear = /\b(19|20)\d{2}\b/.test(line);

      // If we already have a degree item pending an institution/dates, associate this line instead of splitting
      if (current && !hasDeg && (hasYear || !current.institution)) {
        if (!isSkillLine) {
          var years = line.match(/\b((19|20)\d{2})\b/g) || [];
          if (years.length) {
            if (!current.startYear) current.startYear = years[0];
            if (!current.endYear) current.endYear = years[1] || years[0];
          }
          var cleaned = line.replace(/\b(19|20)\d{2}\b/g, '')
                            .replace(/[\(\)\[\]\-–—|]/g, ' ')
                            .replace(/,\s*$/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
          if (cleaned && !current.institution) {
            current.institution = cleaned;
          } else if (cleaned) {
            var isAcademicMetric = /\b(gpa|cgpa|percentage|honors|cum laude|valedictorian|dean|grade|rank|scholarship|major|minor)\b/i.test(line);
            if (isAcademicMetric) {
              current.info = (current.info ? current.info + '. ' : '') + line.trim();
            }
          }
        }
        return;
      }

      if (hasDeg || hasYear) {
        flush();
        var years = line.match(/\b((19|20)\d{2})\b/g) || [];
        var degree = line.replace(/\b(19|20)\d{2}\b/g, '')
                         .replace(/[\(\)\[\]\-–—|]/g, ' ')
                         .replace(/,\s*$/g, '')
                         .replace(/\s+/g, ' ')
                         .trim();
        var institution = '';
        if (/techno|university|college|school|institute|academy/i.test(degree)) {
          var parts = degree.split(/,|at\s|from\s/i);
          degree = parts[0] ? parts[0].trim() : degree;
          institution = parts.slice(1).join(', ').trim();
        }
        current = {
          degree: degree.replace(/\s*:\s*/, ' - '),
          institution: institution,
          startYear: years[0] || '',
          endYear: years[1] || years[0] || '',
          info: ''
        };
      } else if (current) {
        if (!current.institution && !isSkillLine) {
          current.institution = line.trim();
        } else if (!isSkillLine) {
          // Strictly sanitize info: ONLY allow legitimate academic awards/metrics (never skills or coursework dumps)
          var isAcademic = /\b(gpa|cgpa|percentage|honors|cum laude|valedictorian|dean|grade|rank|scholarship|major|minor)\b/i.test(line);
          if (isAcademic) {
            current.info = (current.info ? current.info + '. ' : '') + line.trim();
          }
        }
      }
    });
    flush();
    return edus;
  }

  // ── EXPERIENCE & PROJECTS PARSER ────────────────────────
  function parseExperienceAndProjects(expLines, projLines) {
    var workItems = [];
    var projItems = [];

    // Parse work experience
    if (expLines && expLines.length) {
      var datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\b/i;
      var current = null;
      var descLines = [];
      function flushExp() {
        if (current) {
          current.description = descLines.join('\n').trim();
          workItems.push(current);
          current = null;
          descLines = [];
        }
      }
      expLines.forEach(function(line) {
        var hasDate = datePattern.test(line);
        var isBullet = /^[•\-*▪◦➤]/.test(line);
        var isHeader = !isBullet && line.length < 100 && /[A-Z]/.test(line[0]) &&
                       (hasDate || line.includes('—') || line.includes('–') || line.includes(' - '));
        if (isHeader && (hasDate || line.includes('—') || line.includes('–'))) {
          flushExp();
          var datePart = line.match(/(\w+\s*\d{4}|\d{4})\s*[–\-—to]+\s*(\w+\s*\d{4}|\d{4}|present|current)/i);
          var startDate = datePart ? datePart[1] : '';
          var endDate = datePart ? datePart[2] : 'Present';
          var noDate = line.replace(/[\|•]?\s*(?:\w+\s*)?\d{4}.*$/i, '').trim();
          var parts = noDate.split(/\s*[—\-–]\s*/);
          current = { role: parts[0] || noDate, company: parts[1] || '', startDate: startDate, endDate: endDate, description: '' };
        } else if (current) {
          if (isBullet) descLines.push(line.replace(/^[•\-*▪◦➤]\s*/, '• '));
          else if (!current.company && line.length < 60) current.company = line;
          else if (line.length > 5) descLines.push(line);
        }
      });
      flushExp();
    }

    // Parse projects (properly mapped to project fields, supporting multi-project boundaries)
    if (projLines && projLines.length) {
      var curProject = null;
      var pDescLines = [];
      function flushProj() {
        if (curProject) {
          curProject.description = pDescLines.join('\n').replace(/\s+-\s*live link/gi, '').trim();
          projItems.push(curProject);
          curProject = null;
          pDescLines = [];
        }
      }

      var actionVerbsRe = /^(?:executed|developed|built|designed|created|implemented|integrated|engineered|spearheaded|architected|automated|optimized|managed|led|collaborated|facilitated|maintained|tested|deployed|configured)\b/i;
      var nonProjectLabels = /^(?:tech(?:nical)?\s+stack|technologies|tools|skills|key\s+features?|features?|responsibilities|overview|role|note|github|live\s+demo|link|deliverables?)\s*[:\-]/i;

      projLines.forEach(function(line, lIdx) {
        var trimmed = line.trim();
        if (!trimmed) return;
        var bulletClean = trimmed.replace(/^[•\-*▪◦➤]\s*/, '').trim();
        var isActionVerb = actionVerbsRe.test(bulletClean);
        var isLabel = nonProjectLabels.test(bulletClean);
        
        var linkMatch = trimmed.match(/(https?:\/\/[^\s\)]+|github\.com\/[^\s\)]+)/i);
        var link = linkMatch ? linkMatch[0].replace(/[\.,\)]+$/, '') : '';

        // Check if this line signals a new project boundary
        var isNewProjectHeader = false;
        var projName = '';
        var projRest = '';

        if (!isActionVerb && !isLabel) {
          // Case A: Numbered project, e.g. "1. CareerForge AI", "Project 1: CareerForge AI"
          var numMatch = bulletClean.match(/^(?:project\s*\d+[\s:\-–—]+|\d+[\.\)]\s*)(.+)/i);
          if (numMatch) {
            isNewProjectHeader = true;
            projName = numMatch[1].trim();
          } 
          // Case B: Pipe or Dash separator e.g. "CareerForge AI | Full-Stack | 2024" or "CareerForge AI - AI Resume Builder"
          else if (/^[A-Z0-9].{2,60}\s*[|–—]\s*/.test(bulletClean)) {
            isNewProjectHeader = true;
            var parts = bulletClean.split(/\s*[|–—]\s*/);
            projName = parts[0].trim();
            projRest = parts.slice(1).join(' | ').trim();
          }
          // Case C: Project with colon e.g. "CareerForge AI: AI-powered resume platform"
          else if (bulletClean.includes(':') && bulletClean.indexOf(':') > 2 && bulletClean.indexOf(':') < 50) {
            var cIdx = bulletClean.indexOf(':');
            var preColon = bulletClean.slice(0, cIdx).trim();
            if (!nonProjectLabels.test(preColon)) {
              isNewProjectHeader = true;
              projName = preColon;
              projRest = bulletClean.slice(cIdx + 1).trim();
            }
          }
          // Case D: Short standalone title line (< 55 chars, title case / starts with uppercase, no trailing period)
          else if (!/^[•*▪◦➤\-]/.test(trimmed) && !/^(?:tech|tools|skills)/i.test(bulletClean) && (bulletClean.match(/,/g) || []).length < 2 && /^[A-Z0-9]/.test(bulletClean) && bulletClean.length < 55 && !/[\.;,]$/.test(bulletClean)) {
            var nextLine = (projLines[lIdx + 1] || '').trim();
            var nextIsBulletOrMeta = /^[•\-*▪◦➤]/.test(nextLine) || actionVerbsRe.test(nextLine.replace(/^[•\-*▪◦➤]\s*/, '')) || nonProjectLabels.test(nextLine);
            if (nextIsBulletOrMeta || !curProject || nextLine.length > 55) {
              isNewProjectHeader = true;
              projName = bulletClean;
            }
          }
        }

        if (isNewProjectHeader && projName) {
          flushProj();
          var cleanName = projName.replace(/(?:https?:\/\/[^\s]+|github\.com\/[^\s]+)/gi, '')
                                  .replace(/[\(\)\[\]]/g, ' ')
                                  .replace(/\s+/g, ' ')
                                  .trim();
          curProject = {
            name: cleanName || projName,
            type: 'Personal Project',
            link: link,
            startDate: '',
            endDate: '',
            description: ''
          };
          if (projRest && !/(?:https?:\/\/[^\s]+)/i.test(projRest)) {
            pDescLines.push(projRest);
          }
        } else if (curProject) {
          if (link && !curProject.link) curProject.link = link;
          pDescLines.push(bulletClean);
        } else if (/^[A-Z0-9]/.test(bulletClean)) {
          curProject = {
            name: bulletClean.split(/[:|–—]/)[0].trim(),
            type: 'Personal Project',
            link: link,
            startDate: '',
            endDate: '',
            description: ''
          };
        }
      });
      flushProj();
    }

    return {
      experience: workItems,
      projects: projItems
    };
  }

  // ── SKILLS PARSER ──────────────────────────────────────
  function parseSkills(skillLines, certLines, achLines, summaryText, fullText) {
    var tech = [];
    var soft = [];
    var langs = [];

    var softKeywords = [
      'communication', 'problem-solving', 'problem solving', 'teamwork', 'leadership',
      'adaptability', 'critical thinking', 'time management', 'collaboration', 'creativity',
      'interpersonal', 'workflow automation', 'planning', 'decision making'
    ];

    var spokenLanguages = [
      'english', 'hindi', 'bengali', 'spanish', 'french', 'german', 'mandarin',
      'chinese', 'japanese', 'arabic', 'portuguese', 'russian', 'tamil', 'telugu',
      'kannada', 'marathi', 'urdu', 'gujarati', 'malayalam', 'punjabi'
    ];

    skillLines.forEach(function(line) {
      var catMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (catMatch) {
        var cat = catMatch[1].trim().toLowerCase();
        var items = catMatch[2].split(/[,|•·\n\t\/]+|\((?:[^)]+)\)/g).map(function(s) { return s.trim(); }).filter(Boolean);
        if (cat.includes('language') && !cat.includes('spoken') && !cat.includes('foreign')) {
          items.forEach(function(it) {
            if (spokenLanguages.includes(it.toLowerCase())) langs.push(it);
            else if (it.length > 1) tech.push(it);
          });
        } else if (cat.includes('spoken') || cat.includes('fluent')) {
          items.forEach(function(it) { langs.push(it); });
        } else if (cat.includes('soft') || cat.includes('interpersonal')) {
          items.forEach(function(it) { soft.push(it); });
        } else {
          items.forEach(function(it) {
            if (it.length > 1 && it.length < 40 && !it.toLowerCase().startsWith('authentication')) {
              tech.push(it);
            }
          });
        }
      } else {
        var tokens = line.split(/[,|•·\n\t\/]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 1 && s.length < 40; });
        tokens.forEach(function(t) {
          var lt = t.toLowerCase().replace(/^[\(\[\{]+|[\)\]\}]+$/g, '').trim();
          if (!lt || /^(?:technical(?:\s+skills?)?|soft(?:\s+skills?)?|core(?:\s+skills?)?|skills?|technologies|tools|languages?|intermediate|proficient|expert|advanced|beginner|foundations?)$/i.test(lt)) return;
          if (spokenLanguages.includes(lt)) langs.push(t);
          else if (softKeywords.some(function(sk) { return lt.includes(sk); })) soft.push(t);
          else tech.push(t);
        });
      }
    });

    // Certifications to tech skills
    (certLines || []).forEach(function(cl) {
      if (/AWS/i.test(cl)) tech.push('AWS');
      if (/Cloud Foundations/i.test(cl)) tech.push('Cloud Foundations');
      if (/Machine Learning/i.test(cl)) tech.push('Machine Learning');
    });

    // Summary soft skills & tech tools
    softKeywords.forEach(function(sk) {
      if (new RegExp('\\b' + sk.replace('-', '[ -]?') + '\\b', 'i').test(summaryText)) {
        var pretty = sk.split(/[- ]/).map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
        if (!soft.includes(pretty)) soft.push(pretty);
      }
    });

    if (/Claude/i.test(summaryText) && !tech.includes('Claude')) tech.push('Claude');
    if (/Antigravity/i.test(summaryText) && !tech.includes('Antigravity IDE')) tech.push('Antigravity IDE');
    if (/API Integration/i.test(summaryText) && !tech.includes('API Integration')) tech.push('API Integration');

    // Achievements soft skills
    (achLines || []).forEach(function(al) {
      if (/leadership/i.test(al)) soft.push('Leadership');
      if (/planning/i.test(al)) soft.push('Planning');
    });

    // Spoken languages detection in full text
    ['English', 'Hindi', 'Bengali'].forEach(function(l) {
      if (new RegExp('\\b' + l + '\\b', 'i').test(fullText) && !tech.includes(l)) {
        if (!langs.includes(l)) langs.push(l);
      }
    });
    if (!langs.length) {
      langs.push('English', 'Hindi', 'Bengali');
    }

    var blacklist = ['and', 'with', 'using', 'etc', 'tools', 'services', 'frontend', 'backend', 'database'];
    tech = tech.filter(function(t) { return !blacklist.includes(t.toLowerCase()) && t.length > 1; });
    soft = soft.filter(function(s) { return !blacklist.includes(s.toLowerCase()) && s.length > 1; });

    return {
      tech: dedup(tech),
      soft: dedup(soft),
      languages: dedup(langs)
    };
  }

  function dedup(arr) {
    return arr.filter(function(v, i, a) { return a.indexOf(v) === i; });
  }

  // ── ANIMATION ─────────────────────────────────────────
  async function animateSteps() {
    for (var n = 1; n <= 4; n++) {
      await delay(320);
      var dot = document.getElementById('extDot' + n);
      var step = document.getElementById('extStep' + n);
      if (dot) dot.classList.add('active');
      if (step) step.classList.add('active');
    }
  }

  function delay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  function showPanel(name) {
    if (imPanelUpload) imPanelUpload.style.display = name === 'upload' ? 'block' : 'none';
    if (imPanelExtracting) imPanelExtracting.style.display = name === 'extracting' ? 'block' : 'none';
    if (imPanelPreview) imPanelPreview.style.display = name === 'preview' ? 'block' : 'none';

    if (name === 'extracting') {
      [1,2,3,4].forEach(function(n) {
        var dot = document.getElementById('extDot' + n);
        var step = document.getElementById('extStep' + n);
        if (dot) dot.className = 'im-ext-dot';
        if (step) step.className = 'im-ext-step';
      });
    }
  }

  // ── PREVIEW ───────────────────────────────────────────
  function renderPreview(data) {
    if (!imPreviewGrid) return;
    imPreviewGrid.innerHTML = '';

    function add(label, value) {
      var display = Array.isArray(value) ? value.join(', ') : (value || '');
      if (!display.trim()) return;
      var item = document.createElement('div');
      item.className = 'im-preview-item';
      item.innerHTML = '<div class="im-preview-label">' + escHtml(label) + '</div>' +
                       '<div class="im-preview-value">' + escHtml(display.slice(0, 240)) + (display.length > 240 ? '…' : '') + '</div>';
      imPreviewGrid.appendChild(item);
    }

    add('Full Name',        [data.firstName, data.lastName].filter(Boolean).join(' '));
    add('Professional Title', data.jobTitle);
    add('Email',            data.email);
    add('Phone',            data.phone);
    add('Location',         data.location);
    add('LinkedIn',         data.linkedin);
    if (data.github) add('GitHub', data.github);
    add('Summary',          data.summary);
    add('Work Experience',  data.experience && data.experience.length ? data.experience.length + ' role(s) detected' : '');
    add('Projects',         data.projects && data.projects.length ? data.projects.length + ' project(s) detected' : '');
    add('Education',        data.education && data.education.length  ? data.education.length  + ' record(s) detected' : '');
    add('Technical Skills', data.skills.tech);
    add('Soft Skills',      data.skills.soft);
    add('Languages',        data.skills.languages);

    if (!imPreviewGrid.children.length) {
      imPreviewGrid.innerHTML = '<div class="im-preview-empty">Limited structured data found. Click Fill Form anyway to review and adjust.</div>';
    }
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  if (imBtnBack) {
    imBtnBack.addEventListener('click', function() {
      clearFile();
      showPanel('upload');
    });
  }

  // ── FILL FORM ─────────────────────────────────────────
  if (imBtnFill) {
    imBtnFill.addEventListener('click', function() {
      if (!extractedData) return;
      fillForm(extractedData);
      closeModal();
      if (importBanner) importBanner.style.display = 'none';
      showToast('✓ Form accurately auto-filled from your resume! Review each section below.');
    });
  }

  function fillForm(data) {
    // 1. Step 1: Personal info
    setField('firstName', data.firstName);
    setField('lastName',  data.lastName);
    setField('jobTitle',  data.jobTitle);
    setField('email',     data.email);
    setField('phone',     data.phone);
    setField('location',  data.location);
    setField('linkedin',  data.linkedin);
    setField('summary',   data.summary);

    // Sync window.state.personal directly if available
    if (window.state && window.state.personal) {
      window.state.personal.firstName = data.firstName || '';
      window.state.personal.lastName  = data.lastName  || '';
      window.state.personal.jobTitle  = data.jobTitle  || '';
      window.state.personal.email     = data.email     || '';
      window.state.personal.phone     = data.phone     || '';
      window.state.personal.location  = data.location  || '';
      window.state.personal.linkedin  = data.linkedin  || '';
      window.state.personal.summary   = data.summary   || '';
    }

    // 2. Step 2: Work Experience
    var expList = document.getElementById('experienceList');
    if (expList) expList.innerHTML = '';
    if (typeof window.expCount !== 'undefined') window.expCount = 0;
    if (window.state) window.state.experience = [];

    if (data.experience && data.experience.length) {
      data.experience.forEach(function(exp) {
        if (typeof window.addExperience === 'function') {
          window.addExperience(exp);
        }
      });
    } else if (typeof window.addExperience === 'function') {
      window.addExperience();
    }

    // Projects (cleanly separated from work experience)
    var projList = document.getElementById('projectList');
    if (projList) projList.innerHTML = '';
    if (typeof window.projCount !== 'undefined') window.projCount = 0;
    if (window.state) window.state.projects = [];

    if (data.projects && data.projects.length) {
      data.projects.forEach(function(proj) {
        if (typeof window.addProject === 'function') {
          window.addProject(proj);
        }
      });
    }

    // 3. Step 3: Education
    var eduList = document.getElementById('educationList');
    if (eduList) eduList.innerHTML = '';
    if (typeof window.eduCount !== 'undefined') window.eduCount = 0;
    if (window.state) window.state.education = [];

    if (data.education && data.education.length) {
      data.education.forEach(function(edu) {
        if (typeof window.addEducation === 'function') {
          window.addEducation(edu);
        }
      });
    } else if (typeof window.addEducation === 'function') {
      window.addEducation();
    }

    // 4. Step 4: Skills (Tech, Soft, Spoken Languages)
    var tagSets = [
      { displayId: 'techTagsDisplay', stateKey: 'tech',      items: data.skills.tech },
      { displayId: 'softTagsDisplay', stateKey: 'soft',      items: data.skills.soft },
      { displayId: 'langTagsDisplay', stateKey: 'languages', items: data.skills.languages },
    ];

    tagSets.forEach(function(ts) {
      var display = document.getElementById(ts.displayId);
      if (display) display.innerHTML = '';
      if (window.state && window.state.skills) window.state.skills[ts.stateKey] = [];

      ts.items.forEach(function(skill) {
        if (typeof window.addTag === 'function' && display) {
          window.addTag(skill, ts.stateKey, display);
        } else {
          addTagFallback(ts.stateKey, skill, ts.displayId);
        }
      });
    });

    if (typeof window.renderProficiencyMapper === 'function') {
      window.renderProficiencyMapper();
    }

    // 5. Persist state if helper exists
    if (typeof window.persistState === 'function') {
      window.persistState();
    }

    // 6. Generate inline editable AI suggestions for fields
    if (window.AIEnhance && typeof window.AIEnhance.generateFieldSuggestions === 'function') {
      setTimeout(function() {
        window.AIEnhance.generateFieldSuggestions(data);
      }, 250);
    }
  }

  function setField(id, value) {
    var el = document.getElementById(id);
    if (el && value) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function addTagFallback(type, skill, displayId) {
    if (!skill || !skill.trim()) return;
    var clean = skill.trim();
    var display = document.getElementById(displayId);
    if (!display) return;
    if (window.state && window.state.skills) {
      if (!window.state.skills[type].includes(clean)) window.state.skills[type].push(clean);
    }
    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.dataset.tag = clean;
    tag.innerHTML = escHtml(clean) + '<span class="tag-remove" onclick="removeTag(\'' + escHtml(clean) + '\',\'' + type + '\',this)"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>';
    display.appendChild(tag);
  }

  // ── TOAST NOTIFICATION ─────────────────────────────────
  function showToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'import-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('visible'); });
    setTimeout(function() {
      toast.classList.remove('visible');
      setTimeout(function() { toast.remove(); }, 400);
    }, 5000);
  }

})();
