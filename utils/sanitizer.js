/**
 * CareerForge AI / Resumatic — Security & HTML Sanitization Utility
 * Prevents Cross-Site Scripting (XSS) when interpolating user-provided content.
 */

/**
 * Escapes special HTML characters in a string to prevent XSS.
 * @param {string|any} str 
 * @returns {string} Escaped string safe for HTML interpolation.
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes dirty HTML string by stripping script tags and inline event handlers.
 * @param {string} dirty 
 * @returns {string} Sanitized HTML string
 */
function sanitizeHTML(dirty) {
  if (!dirty) return '';
  return String(dirty)
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Safely sets innerHTML after sanitizing user content, or falls back to textContent.
 * @param {HTMLElement} element 
 * @param {string} content 
 * @param {boolean} allowBasicTags - if true, sanitizes HTML; if false, uses textContent
 */
function setSafeContent(element, content, allowBasicTags = false) {
  if (!element) return;
  if (allowBasicTags) {
    element.innerHTML = sanitizeHTML(content);
  } else {
    element.textContent = content || '';
  }
}

// Export for ES Module and Global scope compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHTML, sanitizeHTML, setSafeContent };
} else {
  window.escapeHTML = escapeHTML;
  window.sanitizeHTML = sanitizeHTML;
  window.setSafeContent = setSafeContent;
}
