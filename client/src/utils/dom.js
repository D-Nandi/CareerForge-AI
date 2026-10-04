/**
 * DOM & Security Utilities
 * Provides safe HTML escaping, sanitization, and timing utilities (debounce/throttle)
 */

/**
 * Escapes unsafe characters in a string for safe HTML interpolation.
 * @param {string} str 
 * @returns {string} Safe HTML escaped string
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely sanitizes rich text (e.g. from contenteditable elements),
 * allowing basic safe tags (<b>, <strong>, <i>, <em>, <u>, <ul>, <ol>, <li>, <br>, <p>, <span>)
 * while removing script tags, event handlers, and javascript: links.
 * @param {string} dirty 
 * @returns {string} Sanitized HTML
 */
export function sanitizeRichText(dirty) {
  if (!dirty) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, 'text/html');
  
  const allowedTags = new Set([
    'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR', 'P', 'SPAN', 'DIV', 'A'
  ]);

  function cleanNode(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(child.tagName)) {
          // Replace with its text content or remove if script/style/iframe
          if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(child.tagName)) {
            child.remove();
            continue;
          } else {
            const textNode = document.createTextNode(child.textContent || '');
            node.replaceChild(textNode, child);
            continue;
          }
        }
        
        // Strip dangerous attributes (e.g. onload, onerror, onclick)
        const attrs = Array.from(child.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          const val = attr.value.trim().toLowerCase();
          if (name.startsWith('on') || val.startsWith('javascript:') || val.startsWith('data:')) {
            child.removeAttribute(attr.name);
          }
          // Only allow safe href on <a> tags
          if (child.tagName === 'A' && name === 'href') {
            if (!val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('mailto:') && !val.startsWith('tel:')) {
              child.removeAttribute('href');
            }
          }
        }
        cleanNode(child);
      }
    }
  }

  cleanNode(doc.body);
  return doc.body.innerHTML;
}

/**
 * Standard debounce function to limit execution frequency.
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(fn, delay = 250) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function to guarantee execution at regular intervals.
 * @param {Function} fn 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(fn, limit = 100) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Fast DOM query selector helper
 * @param {string} selector 
 * @param {HTMLElement|Document} context 
 * @returns {HTMLElement|null}
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Fast DOM query selector all helper returning Array
 * @param {string} selector 
 * @param {HTMLElement|Document} context 
 * @returns {HTMLElement[]}
 */
export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
