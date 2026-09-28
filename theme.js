// ══════════════════════════════════════════
//  Resumatic — Shared Theme Toggle
//  Include this script on every page.
// ══════════════════════════════════════════
(function() {
  const STORAGE_KEY = 'resumatic-theme';

  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Apply immediately to prevent flash
  applyTheme(getInitialTheme());

  // Bind toggle button(s) — works on any page
  document.addEventListener('DOMContentLoaded', function() {
    var toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });
  });

  // Listen for system theme changes (when no saved preference)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();
