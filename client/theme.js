// ══════════════════════════════════════════════════════
//  CareerForge AI / Resumatic — Universal Theme & Nav
//  Rule: Default theme is ALWAYS 'light'
//  Handles theme toggling, persistence, and mobile drawers.
// ══════════════════════════════════════════════════════
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

  function updateToggleAria(theme) {
    const isDark = theme === 'dark';
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function applyTheme(theme) {
    const finalTheme = theme === 'dark' ? 'dark' : 'light';
    if (finalTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    try {
      localStorage.setItem(STORAGE_KEY, finalTheme);
      localStorage.setItem('resumatic-theme', finalTheme);
    } catch (e) {}

    updateToggleAria(finalTheme);
  }

  // 1. Apply immediately in head / execution start to prevent flash
  applyTheme(getInitialTheme());

  // 2. Global Delegated Click Handler for Theme Toggles
  document.addEventListener('click', function (e) {
    const toggleBtn = e.target.closest('.theme-toggle');
    if (!toggleBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  // 3. Universal Mobile Drawer / Menu Controller
  function setupMobileNav() {
    // Ensure all theme toggles have correct ARIA on DOM load
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateToggleAria(currentTheme);

    // Global listener for mobile hamburger toggles
    document.addEventListener('click', function (e) {
      const hamburger = e.target.closest('.hamburger, .drawer-toggle, #hamburger');
      if (hamburger) {
        e.preventDefault();
        e.stopPropagation();

        // Check if on standard landing navbar or tool-header
        const navContainer = hamburger.closest('.navbar, .tool-header, .dash-header') || document;
        const menu = navContainer.querySelector('.mobile-menu, .tool-drawer, #mobileMenu') ||
                     document.querySelector('.mobile-menu, .tool-drawer, #mobileMenu');

        if (menu) {
          const willOpen = !menu.classList.contains('open');
          hamburger.classList.toggle('open', willOpen);
          menu.classList.toggle('open', willOpen);
          hamburger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

          if (willOpen) {
            document.body.classList.add('nav-drawer-open');
          } else {
            document.body.classList.remove('nav-drawer-open');
          }
        }
        return;
      }

      // Close mobile menu when clicking any nav link inside it
      const navLink = e.target.closest('.mobile-menu a, .tool-drawer a');
      if (navLink) {
        closeAllMobileMenus();
        return;
      }

      // Close if clicking outside when open
      const openMenu = document.querySelector('.mobile-menu.open, .tool-drawer.open');
      if (openMenu && !e.target.closest('.mobile-menu, .tool-drawer, .navbar, .tool-header, .dash-header')) {
        closeAllMobileMenus();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllMobileMenus();
      }
    });
  }

  function closeAllMobileMenus() {
    document.querySelectorAll('.hamburger.open, .drawer-toggle.open').forEach(function (h) {
      h.classList.remove('open');
      h.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.mobile-menu.open, .tool-drawer.open').forEach(function (m) {
      m.classList.remove('open');
    });
    document.body.classList.remove('nav-drawer-open');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileNav);
  } else {
    setupMobileNav();
  }

  // Public APIs for cross-script or inline access
  window.toggleTheme = function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  };
  window.applyTheme = applyTheme;
  window.closeAllMobileMenus = closeAllMobileMenus;
})();
