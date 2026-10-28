// ══════════════════════════════════════════════════════
//  CareerForge AI / Resumatic — Universal Theme & Nav
//  Rule: Default theme is ALWAYS 'light'
//  Handles theme toggling, persistence, and mobile drawers.
// ══════════════════════════════════════════════════════
(function () {
  'use strict';

  const STORAGE_KEY = 'careernest-theme';

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('careerforge-theme') || localStorage.getItem('resumatic-theme');
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
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    if (current !== finalTheme) {
      document.documentElement.setAttribute('data-theme', finalTheme);
    }

    try {
      localStorage.setItem(STORAGE_KEY, finalTheme);
      localStorage.setItem('careerforge-theme', finalTheme);
      localStorage.setItem('resumatic-theme', finalTheme);
    } catch (e) {}

    if (document.readyState !== 'loading') {
      updateToggleAria(finalTheme);
    }
  }

  // 1. Only apply if differs from initial head inline script to avoid style invalidation
  const initialTheme = getInitialTheme();
  if ((document.documentElement.getAttribute('data-theme') || 'light') !== initialTheme) {
    applyTheme(initialTheme);
  }

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

    ensureDrawerThemeToggle();
  }

  function ensureDrawerThemeToggle() {
    document.querySelectorAll('.tool-drawer, .mobile-menu').forEach(function (drawer) {
      if (!drawer.querySelector('.drawer-theme-btn')) {
        var row = document.createElement('div');
        row.className = drawer.classList.contains('mobile-menu') ? 'mobile-menu-theme' : 'tool-drawer-theme';
        row.innerHTML = '<div class="drawer-theme-meta">' +
          '<span class="drawer-theme-label">Appearance</span>' +
          '<span class="drawer-theme-hint">Switch between light &amp; dark mode</span>' +
        '</div>' +
        '<button class="theme-toggle drawer-theme-btn" aria-label="Toggle theme">' +
          '<span class="drawer-theme-icon">' +
            '<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />' +
              '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />' +
              '<line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />' +
              '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />' +
            '</svg>' +
            '<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />' +
            '</svg>' +
          '</span>' +
          '<span class="drawer-theme-text-light">Dark Mode</span>' +
          '<span class="drawer-theme-text-dark">Light Mode</span>' +
        '</button>';
        drawer.insertBefore(row, drawer.firstChild);
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
