// ── NAVBAR SCROLL (Passive + state-guarded to avoid style recalculation) ──
const navbar = document.getElementById('navbar');
if (navbar) {
  let isScrolled = false;
  window.addEventListener('scroll', () => {
    const shouldBeScrolled = window.scrollY > 20;
    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      navbar.classList.toggle('scrolled', isScrolled);
    }
  }, { passive: true });
}

// ── HAMBURGER & MOBILE MENU (Coordinated with theme.js) ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('nav-drawer-open', isOpen);
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-drawer-open');
    });
  });
}

// ── SCROLL REVEAL (Deferred to idle/frame, zero forced reflow) ──
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  // Batch DOM mutation in animation frame to eliminate layout thrashing
  requestAnimationFrame(() => {
    const targets = document.querySelectorAll('.feature-card, .step, .stat');
    targets.forEach(el => {
      el.classList.add('reveal-init');
      observer.observe(el);
    });
  });
}

// Schedule after initial paint so FCP & LCP are never blocked
if (document.readyState === 'complete') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initScrollReveal, { timeout: 1000 });
  } else {
    setTimeout(initScrollReveal, 200);
  }
} else {
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initScrollReveal, { timeout: 1000 });
    } else {
      setTimeout(initScrollReveal, 200);
    }
  }, { once: true });
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
