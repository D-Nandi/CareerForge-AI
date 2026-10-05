/**
 * CareerForge AI — Toast Notification System
 * Exposed globally as `window.toast`
 */
(function () {
  'use strict';

  let toastEl = null;
  let toastTimer = null;

  function ensureToastElement() {
    if (!toastEl) {
      toastEl = document.getElementById('toast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
      }
    }
    return toastEl;
  }

  function show(msg, type = '', duration = 3000) {
    const el = ensureToastElement();
    el.textContent = msg;
    el.className = `toast ${type} visible`;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('visible');
    }, duration);
  }

  window.toast = {
    show,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'error', duration),
    info: (msg, duration) => show(msg, 'info', duration)
  };
})();
