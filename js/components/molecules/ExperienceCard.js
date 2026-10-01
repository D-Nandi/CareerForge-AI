/**
 * CareerForge AI / Resumatic — Molecule: ExperienceCard Component
 * Safely renders work experience items with safe text nodes and contenteditable bindings.
 */

/**
 * Creates an Experience Card DOM Node
 * @param {Object} exp - Experience item object { role, company, location, startDate, endDate, description }
 * @param {number} index - Item index
 * @returns {HTMLElement} Experience Card DOM node
 */
function createExperienceCard(exp = {}, index = 0) {
  const card = document.createElement('div');
  card.className = 'experience-item resume-entry';
  card.dataset.index = index;

  // Header row: Role and Date
  const header = document.createElement('div');
  header.className = 'entry-header';

  const roleEl = document.createElement('h4');
  roleEl.className = 'entry-role editable-field';
  roleEl.dataset.field = `experience[${index}].role`;
  roleEl.textContent = exp.role || 'Job Title / Role';
  header.appendChild(roleEl);

  const dateEl = document.createElement('span');
  dateEl.className = 'entry-dates editable-field';
  dateEl.dataset.field = `experience[${index}].dates`;
  const start = exp.startDate || '';
  const end = exp.endDate || 'Present';
  dateEl.textContent = (start || end) ? `${start} – ${end}` : '';
  header.appendChild(dateEl);

  card.appendChild(header);

  // Subheader: Company and Location
  const subheader = document.createElement('div');
  subheader.className = 'entry-subheader';

  const companyEl = document.createElement('span');
  companyEl.className = 'entry-company editable-field';
  companyEl.dataset.field = `experience[${index}].company`;
  companyEl.textContent = exp.company || 'Company Name';
  subheader.appendChild(companyEl);

  if (exp.location) {
    const locEl = document.createElement('span');
    locEl.className = 'entry-location editable-field';
    locEl.dataset.field = `experience[${index}].location`;
    locEl.textContent = ` • ${exp.location}`;
    subheader.appendChild(locEl);
  }

  card.appendChild(subheader);

  // Description body
  if (exp.description) {
    const descEl = document.createElement('div');
    descEl.className = 'entry-description editable-field';
    descEl.dataset.field = `experience[${index}].description`;
    
    // Split bullet points safely
    const bullets = String(exp.description).split('\n').filter(b => b.trim());
    if (bullets.length > 1) {
      const ul = document.createElement('ul');
      bullets.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b.replace(/^[\s•\-\*]+/, '');
        ul.appendChild(li);
      });
      descEl.appendChild(ul);
    } else {
      descEl.textContent = exp.description;
    }

    card.appendChild(descEl);
  }

  return card;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createExperienceCard };
} else {
  window.createExperienceCard = createExperienceCard;
}
