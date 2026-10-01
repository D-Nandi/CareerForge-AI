/**
 * CareerForge AI / Resumatic — Atom: SkillPill Component
 * Creates sanitized, structured DOM element for skill tags and pills.
 */

/**
 * Creates a Skill Pill element safely
 * @param {string} name - Skill name (e.g., "React", "TypeScript")
 * @param {string} [level] - Optional proficiency level (e.g., "Expert", "Advanced")
 * @param {Object} [options] - Additional options (e.g., removable, onRemove)
 * @returns {HTMLElement} Skill Pill DOM node
 */
function createSkillPill(name, level = '', options = {}) {
  const container = document.createElement('span');
  container.className = 'skill-pill';

  if (options.className) {
    container.className += ' ' + options.className;
  }

  const nameSpan = document.createElement('span');
  nameSpan.className = 'skill-name';
  nameSpan.textContent = name || '';
  container.appendChild(nameSpan);

  if (level) {
    const levelSpan = document.createElement('span');
    levelSpan.className = 'skill-level-badge';
    levelSpan.textContent = `(${level})`;
    container.appendChild(levelSpan);
  }

  if (options.removable) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove-btn';
    removeBtn.setAttribute('aria-label', `Remove ${name}`);
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof options.onRemove === 'function') {
        options.onRemove(name);
      }
      container.remove();
    });
    container.appendChild(removeBtn);
  }

  return container;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createSkillPill };
} else {
  window.createSkillPill = createSkillPill;
}
