// ══════════════════════════════════════════
//  CareerForge AI — Shared Theme Toggle
//  Rule: Default theme is ALWAYS 'light'
//  Include this script in <head> of every page.
// ══════════════════════════════════════════
(function () {
  'use strict';

  const STORAGE_KEY = 'careerforge-theme';

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('resumatic-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light'; // Rule: default is ALWAYS light
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.setItem('resumatic-theme', theme);
    } catch (e) {}
  }

  // Apply immediately in head to prevent flash
  applyTheme(getInitialTheme());

  // Bind toggle button(s) on any page
  function bindToggles() {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function (toggle) {
      if (toggle.dataset.boundTheme) return;
      toggle.dataset.boundTheme = 'true';
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        applyTheme(isDark ? 'light' : 'dark');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggles);
  } else {
    bindToggles();
  }

  window.toggleTheme = function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  };
})();
