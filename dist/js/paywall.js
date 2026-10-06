/**
 * CareerForge AI — Paywall & Upgrade Modal System
 * Exposed globally as `window.paywall`
 */
(function () {
  'use strict';

  const MODAL_ID = 'cfPaywallModal';

  function ensureModal() {
    let modalEl = document.getElementById(MODAL_ID);
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = MODAL_ID;
      modalEl.className = 'modal-backdrop';
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML = `
        <div class="modal-card" style="max-width: 480px; text-align: left; align-items: stretch;">
          <button class="modal-close" id="cfPaywallClose" aria-label="Close modal">✕</button>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <div class="modal-icon" style="margin-bottom: 0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <span class="badge badge-primary" id="cfPaywallTierBadge">Pro Tier</span>
              <h3 class="modal-title" id="cfPaywallTitle" style="font-size: 1.25rem; margin-top: 2px;">Premium Feature</h3>
            </div>
          </div>

          <p class="modal-body" id="cfPaywallMessage" style="text-align: left; margin-bottom: 12px;">
            Unlock advanced AI recommendations, custom roadmap pathways, and high-impact career tooling.
          </p>

          <div style="background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <strong id="cfPaywallTierName" style="color: var(--text); font-size: 0.95rem;">CareerForge Pro</strong>
              <span id="cfPaywallPrice" style="font-family: var(--font-head); font-size: 1.2rem; font-weight: 800; color: var(--accent);">₹299 <small style="font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">/ month</small></span>
            </div>
            <ul style="font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px; padding-left: 18px; list-style: disc;">
              <li id="cfPaywallFeature1">Full ATS In-Depth Diagnosis & Checklist</li>
              <li id="cfPaywallFeature2">Personalized Skill Progression Map</li>
              <li id="cfPaywallFeature3">AI Bullet Rewrites & Role Alignment</li>
            </ul>
          </div>

          <div class="modal-actions" style="margin-top: 0;">
            <a href="/pricing.html" class="btn btn-primary" id="cfPaywallUpgradeBtn" style="flex: 1; justify-content: center; padding: 10px;">View Plans & Upgrade →</a>
            <button class="btn btn-ghost" id="cfPaywallCancelBtn">Maybe Later</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      document.getElementById('cfPaywallClose').addEventListener('click', hide);
      document.getElementById('cfPaywallCancelBtn').addEventListener('click', hide);
    }
    return modalEl;
  }

  function show(options = {}) {
    const modalEl = ensureModal();
    const { feature = 'This Feature', requiredTier = 'pro', title, message } = options;

    const tierBadge = document.getElementById('cfPaywallTierBadge');
    const tierName = document.getElementById('cfPaywallTierName');
    const titleEl = document.getElementById('cfPaywallTitle');
    const msgEl = document.getElementById('cfPaywallMessage');
    const priceEl = document.getElementById('cfPaywallPrice');
    const f1 = document.getElementById('cfPaywallFeature1');
    const f2 = document.getElementById('cfPaywallFeature2');
    const f3 = document.getElementById('cfPaywallFeature3');

    if (requiredTier === 'career_plus') {
      tierBadge.textContent = 'Career+ Tier';
      tierBadge.className = 'badge badge-warning';
      tierName.textContent = 'Career+ Membership';
      priceEl.innerHTML = '₹549 <small style="font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">/ month</small>';
      f1.textContent = 'Unlimited Personalized Roadmaps & Course Links';
      f2.textContent = 'Tailored Interview Prep & Mock Behavioral Drills';
      f3.textContent = 'Full Resume & Portfolio Verification Checklist';
    } else {
      tierBadge.textContent = 'Pro Tier';
      tierBadge.className = 'badge badge-primary';
      tierName.textContent = 'CareerForge Pro';
      priceEl.innerHTML = '₹299 <small style="font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">/ month</small>';
      f1.textContent = 'Full ATS In-Depth Diagnosis & Checklist';
      f2.textContent = 'Targeted Keyword Gap Recommendations';
      f3.textContent = 'High-Precision Resume AI Refactor';
    }

    titleEl.textContent = title || `Unlock ${feature}`;
    msgEl.textContent = message || `${feature} requires a ${requiredTier === 'career_plus' ? 'Career+' : 'Pro'} plan. Upgrade today to accelerate your job search.`;

    const upgradeBtn = document.getElementById('cfPaywallUpgradeBtn');
    if (upgradeBtn) {
      upgradeBtn.href = `pricing.html?tier=${encodeURIComponent(requiredTier)}`;
    }

    if (window.modal) {
      window.modal.open(MODAL_ID);
    } else {
      modalEl.classList.add('visible');
    }
  }

  function hide() {
    const modalEl = document.getElementById(MODAL_ID);
    if (!modalEl) return;
    if (window.modal) {
      window.modal.close(MODAL_ID);
    } else {
      modalEl.classList.remove('visible');
    }
  }

  window.paywall = {
    show,
    hide
  };
})();
