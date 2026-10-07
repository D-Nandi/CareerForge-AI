/**
 * CareerNest — Modal Management System
 * Exposed globally as `window.modal`
 */
(function () {
  'use strict';

  function open(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!el) return;
    el.classList.add('visible');
    el.setAttribute('aria-hidden', 'false');

    // Focus on first actionable button
    const firstFocusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  function close(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!el) return;
    el.classList.remove('visible');
    el.setAttribute('aria-hidden', 'true');
  }

  // Global listeners for backdrop clicks and Escape key
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('modal-backdrop')) {
        close(e.target);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const visibleModals = document.querySelectorAll('.modal-backdrop.visible');
        visibleModals.forEach(m => close(m));
      }
    });
  });

  window.modal = {
    open,
    close
  };
})();
