/**
 * CareerForge AI — Salary Benchmark & Market Insights Controller
 * Strictly adheres to AGENTS.md standards: IIFE, api.js, toast.js.
 */
(function () {
  'use strict';

  const selectRole = document.getElementById('selectRole');
  const selectCity = document.getElementById('selectCity');
  const salaryBandGrid = document.getElementById('salaryBandGrid');
  const cityTrendsList = document.getElementById('cityTrendsList');
  const skillsTrendsList = document.getElementById('skillsTrendsList');
  const playbookGrid = document.getElementById('playbookGrid');

  async function init() {
    bindEvents();
    await Promise.all([
      loadSalaryData(),
      loadMarketTrends()
    ]);
  }

  function bindEvents() {
    if (selectRole) {
      selectRole.addEventListener('change', loadSalaryData);
    }
    if (selectCity) {
      selectCity.addEventListener('change', loadSalaryData);
    }
  }

  async function loadSalaryData() {
    const role = selectRole ? selectRole.value : 'sde1';
    const city = selectCity ? selectCity.value : 'Bengaluru';

    if (salaryBandGrid) {
      salaryBandGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          Calculating compensation percentiles for ${city}...
        </div>
      `;
    }

    try {
      const res = await window.api.get(`/api/insights/salary-benchmark?role=${encodeURIComponent(role)}&city=${encodeURIComponent(city)}`);
      if (res && res.success && res.data) {
        renderSalaryBands(res.data);
        renderPlaybook(res.data.negotiationTips);
      }
    } catch (err) {
      if (window.toast) window.toast.error('Failed to load salary benchmarks.');
    }
  }

  async function loadMarketTrends() {
    try {
      const res = await window.api.get('/api/insights/market-trends');
      if (res && res.success && res.data) {
        renderTrends(res.data);
      }
    } catch (err) {
      console.warn('Could not load market trends:', err);
    }
  }

  function renderSalaryBands(data) {
    if (!salaryBandGrid) return;
    const tiers = data.tiers;

    const tierOrder = ['it_services', 'product_mid', 'unicorn', 'faang'];

    salaryBandGrid.innerHTML = tierOrder.map(tKey => {
      const t = tiers[tKey];
      if (!t) return '';

      const isUnicornOrFaang = tKey === 'unicorn' || tKey === 'faang';
      const sentimentClass = t.hiringStatus.toLowerCase().includes('aggressive') ? 'sentiment-aggressive' : (t.hiringStatus.toLowerCase().includes('active') ? 'sentiment-active' : 'sentiment-selective');

      const parts = t.tierName.split('(');
      const categoryName = parts[0].trim();
      const companyExamples = parts[1] ? parts[1].replace(')', '').trim() : '';

      const tierShortLabels = {
        'it_services': 'Tier 4 · IT Services',
        'product_mid': 'Tier 3 · Product & SaaS',
        'unicorn': 'Tier 2 · Unicorns',
        'faang': 'Tier 1 · Top MNCs / FAANG'
      };
      const shortBadgeLabel = tierShortLabels[tKey] || 'Tier ' + (4 - tierOrder.indexOf(tKey));

      return `
        <article class="salary-tier-card ${tKey === 'unicorn' ? 'featured' : ''}">
          <div class="tier-card-header">
            <span class="badge ${isUnicornOrFaang ? 'badge-primary' : 'badge-secondary'}" style="font-size: 10.5px;">${shortBadgeLabel}</span>
            <span class="hiring-sentiment-badge ${sentimentClass}">● ${t.hiringStatus}</span>
          </div>

          <h3 class="tier-card-title">${categoryName}</h3>
          ${companyExamples ? `<div class="tier-companies-sub">e.g. ${companyExamples}</div>` : ''}

          <div class="median-stat-wrap">
            <span class="median-label">Estimated Median CTC</span>
            <div class="median-badge">₹${t.medianLPA} <small style="font-size: 14px; font-weight: 600; color: var(--text-muted);">LPA</small></div>
            <div class="base-salary-sub">Base Salary Range: <strong>${t.baseRangeLPA}</strong></div>
          </div>

          <!-- Percentile Track -->
          <div class="percentile-track">
            <div class="percentile-row">
              <div class="percentile-col">
                <span class="p-tag">P25 (Entry)</span>
                <span class="p-val">₹${t.p25}L</span>
              </div>
              <div class="percentile-col">
                <span class="p-tag">P50 (Median)</span>
                <span class="p-val">₹${t.p50}L</span>
              </div>
              <div class="percentile-col">
                <span class="p-tag">P90 (Top 10%)</span>
                <span class="p-val">₹${t.p90}L</span>
              </div>
            </div>
            <div class="percentile-bar-bg">
              <div class="percentile-bar-fill" style="width: ${Math.min(100, (t.medianLPA / 70) * 100)}%;"></div>
            </div>
            <div class="bonus-esop-row">
              <span>Bonus: <strong>${t.bonusPct}</strong></span>
              <span>ESOPs: <strong>${t.esopValueLPA ? '₹' + t.esopValueLPA + 'L/yr' : 'Nil'}</strong></span>
            </div>
          </div>

          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border);">
            <strong style="color: var(--text); display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 3px;">What Panels Evaluate:</strong>
            ${t.interviewFocus}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderTrends(trends) {
    if (cityTrendsList && trends.hiringHubs) {
      cityTrendsList.innerHTML = trends.hiringHubs.map(hub => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px;">
          <div>
            <strong style="color: var(--text);">${hub.city}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">Key Skill: ${hub.topSkill}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge ${hub.index === 'Very High' ? 'badge-success' : 'badge-primary'}" style="font-size: 11px;">${hub.index}</span>
            <div style="font-size: 11px; color: var(--green); font-weight: 700;">${hub.growth}</div>
          </div>
        </div>
      `).join('');
    }

    if (skillsTrendsList && trends.topDemandedSkills) {
      skillsTrendsList.innerHTML = trends.topDemandedSkills.map(skill => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px;">
          <div>
            <strong style="color: var(--text);">${skill.name}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${skill.demand}</div>
          </div>
          <span class="badge badge-success" style="font-size: 11px; font-weight: 800;">${skill.avgMultiplier}</span>
        </div>
      `).join('');
    }
  }

  function renderPlaybook(tips) {
    if (!playbookGrid || !tips) return;
    playbookGrid.innerHTML = tips.map((tip, idx) => `
      <div class="playbook-card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 24px; height: 24px; border-radius: var(--radius-full); background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">${idx + 1}</div>
          <h4 style="font-size: 14px; font-weight: 700; color: var(--text); margin: 0;">${tip.title}</h4>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0;">${tip.description}</p>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
