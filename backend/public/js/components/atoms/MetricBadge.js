/**
 * CareerForge AI / Resumatic — Atom: MetricBadge Component
 * Creates ATS score badges, status indicators, and metric tags.
 */

/**
 * Creates a Metric Badge DOM element
 * @param {number|string} score - Metric score (0-100) or text label
 * @param {string} [type='ats'] - Type of badge ('ats', 'success', 'warning', 'info')
 * @returns {HTMLElement} Metric Badge DOM node
 */
function createMetricBadge(score, type = 'ats') {
  const badge = document.createElement('div');
  badge.className = `metric-badge badge-${type}`;

  const num = parseInt(score, 10) || 0;
  if (type === 'ats') {
    if (num >= 80) badge.classList.add('badge-high');
    else if (num >= 60) badge.classList.add('badge-mid');
    else badge.classList.add('badge-low');
  }

  const icon = document.createElement('span');
  icon.className = 'badge-icon';
  icon.textContent = num >= 80 ? '⚡' : num >= 60 ? '📈' : '⚠️';
  badge.appendChild(icon);

  const text = document.createElement('span');
  text.className = 'badge-text';
  text.textContent = `${score}% ATS Ready`;
  badge.appendChild(text);

  return badge;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createMetricBadge };
} else {
  window.createMetricBadge = createMetricBadge;
}
