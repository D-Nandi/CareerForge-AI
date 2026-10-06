/**
 * CareerForge AI — Salary Benchmark & Market Insights Controller
 * Provides real-time compensation bands across IT Services, Unicorns, and FAANG in India.
 * Built-in dataset ensures instant rendering offline and on static deployments (Vercel).
 */
(function () {
  'use strict';

  const SALARY_DATA = {
    'sde1': {
      roleTitle: 'Software Development Engineer - 1 (0-2 Yrs)',
      cityMultipliers: {
        'Bengaluru': 1.15,
        'Hyderabad': 1.05,
        'Gurgaon / Delhi NCR': 1.08,
        'Pune': 0.95,
        'Chennai': 0.92,
        'Remote (India)': 1.00
      },
      tiers: {
        'it_services': {
          tierName: 'IT Services & Mass Recruiters (TCS, Infosys, Wipro, Cognizant)',
          baseRangeLPA: '3.6 - 7.5 LPA',
          medianLPA: 4.5,
          p25: 3.6,
          p50: 4.5,
          p75: 7.0,
          p90: 9.0,
          bonusPct: '5% - 10%',
          esopValueLPA: 0,
          hiringStatus: 'Moderate',
          interviewFocus: 'Basic Java/Python, DSA arrays/strings, aptitude test, academic project fundamentals.'
        },
        'product_mid': {
          tierName: 'Mid-Tier Product & Enterprise SaaS (Zoho, Freshworks, Jio, Persistent)',
          baseRangeLPA: '8.0 - 16.0 LPA',
          medianLPA: 12.0,
          p25: 8.5,
          p50: 12.0,
          p75: 15.5,
          p90: 18.0,
          bonusPct: '10% - 15%',
          esopValueLPA: 1.5,
          hiringStatus: 'Active',
          interviewFocus: 'Clean code, OOPS, REST API design, medium LeetCode questions, DB indexing.'
        },
        'unicorn': {
          tierName: 'High-Growth Tech Unicorns & Startups (Swiggy, Zomato, Razorpay, CRED)',
          baseRangeLPA: '16.0 - 28.0 LPA',
          medianLPA: 22.0,
          p25: 17.0,
          p50: 22.0,
          p75: 26.0,
          p90: 32.0,
          bonusPct: '10% - 20%',
          esopValueLPA: 5.0,
          hiringStatus: 'Aggressive',
          interviewFocus: 'Fast problem solving, concurrency, low-level design (LLD), system observability.'
        },
        'faang': {
          tierName: 'Tier-1 Tech MNCs & FAANG (Amazon, Microsoft, Google, Uber)',
          baseRangeLPA: '22.0 - 45.0 LPA',
          medianLPA: 32.0,
          p25: 24.0,
          p50: 32.0,
          p75: 42.0,
          p90: 48.0,
          bonusPct: '15% - 25%',
          esopValueLPA: 10.0,
          hiringStatus: 'Selective / Targeted',
          interviewFocus: 'Hard DSA (Graphs/DP), Scalability, rigorous Behavioral Leadership Principles.'
        }
      }
    },
    'sde2': {
      roleTitle: 'Software Development Engineer - 2 (2-5 Yrs)',
      cityMultipliers: {
        'Bengaluru': 1.15,
        'Hyderabad': 1.05,
        'Gurgaon / Delhi NCR': 1.08,
        'Pune': 0.95,
        'Chennai': 0.92,
        'Remote (India)': 1.00
      },
      tiers: {
        'it_services': {
          tierName: 'IT Services & Mass Recruiters (TCS, Infosys, Wipro, Cognizant)',
          baseRangeLPA: '7.5 - 14.0 LPA',
          medianLPA: 10.5,
          p25: 8.0,
          p50: 10.5,
          p75: 13.5,
          p90: 16.0,
          bonusPct: '10%',
          esopValueLPA: 0,
          hiringStatus: 'Moderate',
          interviewFocus: 'Spring Boot/Microservices, SQL tuning, client communication.'
        },
        'product_mid': {
          tierName: 'Mid-Tier Product & Enterprise SaaS (Zoho, Freshworks, Jio, Persistent)',
          baseRangeLPA: '18.0 - 32.0 LPA',
          medianLPA: 24.0,
          p25: 19.0,
          p50: 24.0,
          p75: 29.0,
          p90: 35.0,
          bonusPct: '10% - 15%',
          esopValueLPA: 4.0,
          hiringStatus: 'Active',
          interviewFocus: 'High-Level Design (HLD), caching strategies, distributed transactions.'
        },
        'unicorn': {
          tierName: 'High-Growth Tech Unicorns & Startups (Swiggy, Zomato, Razorpay, CRED)',
          baseRangeLPA: '32.0 - 55.0 LPA',
          medianLPA: 42.0,
          p25: 35.0,
          p50: 42.0,
          p75: 50.0,
          p90: 62.0,
          bonusPct: '15% - 20%',
          esopValueLPA: 12.0,
          hiringStatus: 'Aggressive',
          interviewFocus: 'Microservices architecture, Kafka/RabbitMQ, fault tolerance, team mentoring.'
        },
        'faang': {
          tierName: 'Tier-1 Tech MNCs & FAANG (Amazon, Microsoft, Google, Uber)',
          baseRangeLPA: '45.0 - 85.0 LPA',
          medianLPA: 62.0,
          p25: 50.0,
          p50: 62.0,
          p75: 75.0,
          p90: 92.0,
          bonusPct: '15% - 25%',
          esopValueLPA: 25.0,
          hiringStatus: 'Selective / Targeted',
          interviewFocus: 'Enterprise system scale, multi-region failover, deep engineering ownership.'
        }
      }
    },
    'fullstack': {
      roleTitle: 'Full Stack Engineer (1-4 Yrs)',
      cityMultipliers: {
        'Bengaluru': 1.15,
        'Hyderabad': 1.05,
        'Gurgaon / Delhi NCR': 1.08,
        'Pune': 0.95,
        'Chennai': 0.92,
        'Remote (India)': 1.00
      },
      tiers: {
        'it_services': {
          tierName: 'IT Services & Mass Recruiters (TCS, Infosys, Wipro, Cognizant)',
          baseRangeLPA: '5.0 - 10.0 LPA',
          medianLPA: 7.0,
          p25: 5.5,
          p50: 7.0,
          p75: 9.5,
          p90: 12.0,
          bonusPct: '8%',
          esopValueLPA: 0,
          hiringStatus: 'Moderate',
          interviewFocus: 'HTML/CSS/JS, React or Angular, Node.js or Java, basic SQL.'
        },
        'product_mid': {
          tierName: 'Mid-Tier Product & Enterprise SaaS (Zoho, Freshworks, Jio, Persistent)',
          baseRangeLPA: '14.0 - 26.0 LPA',
          medianLPA: 18.0,
          p25: 14.5,
          p50: 18.0,
          p75: 23.0,
          p90: 28.0,
          bonusPct: '10% - 15%',
          esopValueLPA: 3.0,
          hiringStatus: 'Active',
          interviewFocus: 'Next.js, TypeScript, PostgreSQL, state management, Docker containers.'
        },
        'unicorn': {
          tierName: 'High-Growth Tech Unicorns & Startups (Swiggy, Zomato, Razorpay, CRED)',
          baseRangeLPA: '24.0 - 45.0 LPA',
          medianLPA: 34.0,
          p25: 26.0,
          p50: 34.0,
          p75: 40.0,
          p90: 48.0,
          bonusPct: '12% - 18%',
          esopValueLPA: 8.0,
          hiringStatus: 'Aggressive',
          interviewFocus: 'Web performance, optimistic updates, API security, micro-frontends.'
        },
        'faang': {
          tierName: 'Tier-1 Tech MNCs & FAANG (Amazon, Microsoft, Google, Uber)',
          baseRangeLPA: '35.0 - 70.0 LPA',
          medianLPA: 50.0,
          p25: 38.0,
          p50: 50.0,
          p75: 62.0,
          p90: 78.0,
          bonusPct: '15% - 20%',
          esopValueLPA: 18.0,
          hiringStatus: 'Selective / Targeted',
          interviewFocus: 'Deep JS internals, rendering lifecycles, end-to-end architecture.'
        }
      }
    },
    'devops': {
      roleTitle: 'DevOps & Platform Engineer (1-4 Yrs)',
      cityMultipliers: {
        'Bengaluru': 1.15,
        'Hyderabad': 1.05,
        'Gurgaon / Delhi NCR': 1.08,
        'Pune': 0.95,
        'Chennai': 0.92,
        'Remote (India)': 1.00
      },
      tiers: {
        'it_services': {
          tierName: 'IT Services & Mass Recruiters (TCS, Infosys, Wipro, Cognizant)',
          baseRangeLPA: '5.5 - 11.0 LPA',
          medianLPA: 8.0,
          p25: 6.0,
          p50: 8.0,
          p75: 10.5,
          p90: 13.0,
          bonusPct: '8%',
          esopValueLPA: 0,
          hiringStatus: 'Moderate',
          interviewFocus: 'Jenkins pipelines, basic Docker, AWS EC2/S3, Linux scripting.'
        },
        'product_mid': {
          tierName: 'Mid-Tier Product & Enterprise SaaS (Zoho, Freshworks, Jio, Persistent)',
          baseRangeLPA: '15.0 - 28.0 LPA',
          medianLPA: 20.0,
          p25: 16.0,
          p50: 20.0,
          p75: 25.0,
          p90: 30.0,
          bonusPct: '10%',
          esopValueLPA: 3.5,
          hiringStatus: 'Active',
          interviewFocus: 'Kubernetes CKA level, Terraform IaC, Prometheus/Grafana, Helm.'
        },
        'unicorn': {
          tierName: 'High-Growth Tech Unicorns & Startups (Swiggy, Zomato, Razorpay, CRED)',
          baseRangeLPA: '26.0 - 48.0 LPA',
          medianLPA: 36.0,
          p25: 28.0,
          p50: 36.0,
          p75: 44.0,
          p90: 52.0,
          bonusPct: '15%',
          esopValueLPA: 10.0,
          hiringStatus: 'Aggressive',
          interviewFocus: 'GitOps (ArgoCD), service meshes (Istio), cost optimization, zero-downtime canary.'
        },
        'faang': {
          tierName: 'Tier-1 Tech MNCs & FAANG (Amazon, Microsoft, Google, Uber)',
          baseRangeLPA: '40.0 - 75.0 LPA',
          medianLPA: 55.0,
          p25: 42.0,
          p50: 55.0,
          p75: 68.0,
          p90: 82.0,
          bonusPct: '15% - 25%',
          esopValueLPA: 20.0,
          hiringStatus: 'Selective / Targeted',
          interviewFocus: 'Site Reliability Engineering (SRE), Linux kernel internals, distributed tracing.'
        }
      }
    },
    'data_engineer': {
      roleTitle: 'Data Engineer / Analytics Engineer (1-4 Yrs)',
      cityMultipliers: {
        'Bengaluru': 1.15,
        'Hyderabad': 1.05,
        'Gurgaon / Delhi NCR': 1.08,
        'Pune': 0.95,
        'Chennai': 0.92,
        'Remote (India)': 1.00
      },
      tiers: {
        'it_services': {
          tierName: 'IT Services & Mass Recruiters (TCS, Infosys, Wipro, Cognizant)',
          baseRangeLPA: '4.8 - 9.5 LPA',
          medianLPA: 7.2,
          p25: 5.2,
          p50: 7.2,
          p75: 9.0,
          p90: 11.5,
          bonusPct: '8%',
          esopValueLPA: 0,
          hiringStatus: 'Moderate',
          interviewFocus: 'SQL, Python pandas, basic ETL tools (Informatica/Talend), Data Warehousing.'
        },
        'product_mid': {
          tierName: 'Mid-Tier Product & Enterprise SaaS (Zoho, Freshworks, Jio, Persistent)',
          baseRangeLPA: '14.0 - 25.0 LPA',
          medianLPA: 19.0,
          p25: 15.0,
          p50: 19.0,
          p75: 23.5,
          p90: 28.0,
          bonusPct: '10% - 12%',
          esopValueLPA: 3.0,
          hiringStatus: 'Active',
          interviewFocus: 'Apache Spark, Airflow orchestration, Snowflake / BigQuery, dimensional modeling.'
        },
        'unicorn': {
          tierName: 'High-Growth Tech Unicorns & Startups (Swiggy, Zomato, Razorpay, CRED)',
          baseRangeLPA: '25.0 - 45.0 LPA',
          medianLPA: 33.0,
          p25: 27.0,
          p50: 33.0,
          p75: 39.0,
          p90: 47.0,
          bonusPct: '12% - 18%',
          esopValueLPA: 9.0,
          hiringStatus: 'Aggressive',
          interviewFocus: 'Streaming data (Kafka/Flink), Lakehouse architecture (Delta Lake), real-time OLAP.'
        },
        'faang': {
          tierName: 'Tier-1 Tech MNCs & FAANG (Amazon, Microsoft, Google, Uber)',
          baseRangeLPA: '38.0 - 72.0 LPA',
          medianLPA: 52.0,
          p25: 40.0,
          p50: 52.0,
          p75: 65.0,
          p90: 80.0,
          bonusPct: '15% - 20%',
          esopValueLPA: 22.0,
          hiringStatus: 'Selective / Targeted',
          interviewFocus: 'Petabyte-scale distributed data processing, columnar storage internals, data governance.'
        }
      }
    }
  };

  const NEGOTIATION_TIPS = [
    {
      title: 'Focus on Fixed Base, Not Overinflated CTC',
      description: 'Indian HR recruiters frequently inflate CTC numbers using variable bonuses, retention bonuses (paid across 2 years), and non-monetary perks like insurance. Always compare offers on Fixed Base Monthly In-Hand salary.'
    },
    {
      title: 'Use Multiple Competing Offers as Leverage',
      description: 'Holding an existing offer letter from a product startup or service firm guarantees you a 20-30% premium above standard bandings. Timing your final rounds simultaneously is key.'
    },
    {
      title: 'Understand Indian ESOP Vesting Schedules',
      description: 'Standard Indian startups use 4-year vesting with a 1-year cliff (25% per year). Ask whether ESOPs are granted at nominal face value (₹10) or fair market value (FMV) to avoid surprising tax liability.'
    },
    {
      title: 'Notice Period Buyout Strategy',
      description: 'If you have a 90-day notice period at an IT services firm (TCS/Infy), ask the hiring product company upfront if they sponsor official notice buyout or allow early exit negotiation.'
    }
  ];

  const MARKET_TRENDS = {
    hiringHubs: [
      { city: 'Bengaluru', index: 'Very High', topSkill: 'Go & Kubernetes', growth: '+28%' },
      { city: 'Hyderabad', index: 'High', topSkill: 'Cloud & Snowflake', growth: '+22%' },
      { city: 'Gurgaon / NCR', index: 'High', topSkill: 'React & System Design', growth: '+19%' },
      { city: 'Pune', index: 'Moderate', topSkill: 'Java Spring & Microservices', growth: '+14%' },
      { city: 'Remote (India)', index: 'Selective', topSkill: 'Full Stack TypeScript', growth: '+31%' }
    ],
    topDemandedSkills: [
      { name: 'Golang', demand: 'Surging in Backend Microservices', avgMultiplier: '1.25x' },
      { name: 'Kubernetes & Docker', demand: 'Mandatory for SDE-2+ in Product Companies', avgMultiplier: '1.20x' },
      { name: 'Apache Kafka', demand: 'Critical for high-volume streaming in fintech & food tech', avgMultiplier: '1.18x' },
      { name: 'Next.js & TypeScript', demand: 'Industry standard for modern web engineering', avgMultiplier: '1.15x' },
      { name: 'Generative AI / LLM APIs', demand: 'Fastest growing niche for product engineers', avgMultiplier: '1.30x' }
    ]
  };

  function calculateLocalSalaryBenchmark(role = 'sde1', city = 'Bengaluru') {
    const roleData = SALARY_DATA[role] || SALARY_DATA['sde1'];
    const multiplier = (roleData.cityMultipliers && roleData.cityMultipliers[city]) ? roleData.cityMultipliers[city] : 1.0;

    const result = {
      roleKey: role,
      roleTitle: roleData.roleTitle,
      city,
      multiplier,
      negotiationTips: NEGOTIATION_TIPS,
      tiers: {}
    };

    ['it_services', 'product_mid', 'unicorn', 'faang'].forEach(tKey => {
      const tData = roleData.tiers[tKey];
      if (tData) {
        result.tiers[tKey] = {
          tierName: tData.tierName,
          baseRangeLPA: tData.baseRangeLPA,
          medianLPA: Math.round(tData.medianLPA * multiplier * 10) / 10,
          p25: Math.round(tData.p25 * multiplier * 10) / 10,
          p50: Math.round(tData.p50 * multiplier * 10) / 10,
          p75: Math.round(tData.p75 * multiplier * 10) / 10,
          p90: Math.round(tData.p90 * multiplier * 10) / 10,
          bonusPct: tData.bonusPct,
          esopValueLPA: Math.round(tData.esopValueLPA * multiplier * 10) / 10,
          hiringStatus: tData.hiringStatus,
          interviewFocus: tData.interviewFocus
        };
      }
    });

    return result;
  }

  let selectRole = null;
  let selectCity = null;
  let salaryBandGrid = null;
  let cityTrendsList = null;
  let skillsTrendsList = null;
  let playbookGrid = null;

  function getElements() {
    if (!selectRole) selectRole = document.getElementById('selectRole');
    if (!selectCity) selectCity = document.getElementById('selectCity');
    if (!salaryBandGrid) salaryBandGrid = document.getElementById('salaryBandGrid');
    if (!cityTrendsList) cityTrendsList = document.getElementById('cityTrendsList');
    if (!skillsTrendsList) skillsTrendsList = document.getElementById('skillsTrendsList');
    if (!playbookGrid) playbookGrid = document.getElementById('playbookGrid');
  }

  function init() {
    getElements();
    bindEvents();
    // 1. Immediately render local benchmark dataset for instant display
    const initialRole = selectRole ? selectRole.value : 'sde1';
    const initialCity = selectCity ? selectCity.value : 'Bengaluru';
    const localData = calculateLocalSalaryBenchmark(initialRole, initialCity);
    renderSalaryBands(localData);
    renderPlaybook(localData.negotiationTips);
    renderTrends(MARKET_TRENDS);

    // 2. Synchronize with backend API in background if online
    syncWithBackend(initialRole, initialCity);
  }

  function bindEvents() {
    getElements();
    if (selectRole) {
      selectRole.addEventListener('change', onFilterChange);
    }
    if (selectCity) {
      selectCity.addEventListener('change', onFilterChange);
    }
  }

  function onFilterChange() {
    getElements();
    const role = selectRole ? selectRole.value : 'sde1';
    const city = selectCity ? selectCity.value : 'Bengaluru';

    // Instant local recalculation with zero delay
    const localData = calculateLocalSalaryBenchmark(role, city);
    renderSalaryBands(localData);
    renderPlaybook(localData.negotiationTips);

    // Optional background sync
    syncWithBackend(role, city);
  }

  async function syncWithBackend(role, city) {
    if (!window.api || typeof window.api.get !== 'function') return;

    try {
      const [salaryRes, trendsRes] = await Promise.all([
        window.api.get(`/api/insights/salary-benchmark?role=${encodeURIComponent(role)}&city=${encodeURIComponent(city)}`).catch(() => null),
        window.api.get('/api/insights/market-trends').catch(() => null)
      ]);

      if (salaryRes && salaryRes.success && salaryRes.data) {
        renderSalaryBands(salaryRes.data);
        if (salaryRes.data.negotiationTips) {
          renderPlaybook(salaryRes.data.negotiationTips);
        }
      }

      if (trendsRes && trendsRes.success && trendsRes.data) {
        renderTrends(trendsRes.data);
      }
    } catch (_) {
      // Graceful offline fallback silently active
    }
  }

  function renderSalaryBands(data) {
    getElements();
    if (!salaryBandGrid || !data || !data.tiers) return;
    const tiers = data.tiers;
    const tierOrder = ['it_services', 'product_mid', 'unicorn', 'faang'];

    const tierBadgeMeta = {
      'it_services': {
        badgeLabel: 'IT Services',
        badgeBg: 'rgba(234, 179, 8, 0.15)',
        badgeColor: '#b45309'
      },
      'product_mid': {
        badgeLabel: 'Enterprise SaaS',
        badgeBg: 'rgba(59, 130, 246, 0.15)',
        badgeColor: '#2563eb'
      },
      'unicorn': {
        badgeLabel: 'Tech Unicorns',
        badgeBg: 'rgba(108, 92, 231, 0.15)',
        badgeColor: '#6c5ce7'
      },
      'faang': {
        badgeLabel: 'Tier-1 & FAANG',
        badgeBg: 'rgba(139, 92, 246, 0.15)',
        badgeColor: '#7c3aed'
      }
    };

    salaryBandGrid.innerHTML = tierOrder.map(tKey => {
      const t = tiers[tKey];
      if (!t) return '';

      const isUnicorn = tKey === 'unicorn';
      const sentiment = (t.hiringStatus || 'Active').toLowerCase();
      let sentimentClass = 'sentiment-selective';
      if (sentiment.includes('aggressive') || sentiment.includes('very high')) {
        sentimentClass = 'sentiment-aggressive';
      } else if (sentiment.includes('active') || sentiment.includes('high')) {
        sentimentClass = 'sentiment-active';
      } else if (sentiment.includes('moderate')) {
        sentimentClass = 'sentiment-moderate';
      }

      const parts = (t.tierName || '').split('(');
      const categoryName = parts[0].trim();
      const companyExamples = parts[1] ? parts[1].replace(')', '').trim() : '';

      const meta = tierBadgeMeta[tKey] || {
        badgeLabel: categoryName.length > 18 ? categoryName.substring(0, 15) + '…' : categoryName,
        badgeBg: 'rgba(108, 92, 231, 0.12)',
        badgeColor: 'var(--accent)'
      };

      return `
        <article class="salary-tier-card ${isUnicorn ? 'featured' : ''}">
          <div class="tier-card-header">
            <span class="badge" style="background: ${meta.badgeBg}; color: ${meta.badgeColor}; font-size: 10px; font-weight: 700; border-radius: 99px; padding: 3px 8px;">${meta.badgeLabel}</span>
            <span class="hiring-sentiment-badge ${sentimentClass}">● ${t.hiringStatus}</span>
          </div>

          <h3 class="tier-card-title">${categoryName}</h3>
          ${companyExamples ? `<div class="tier-companies-sub">(${companyExamples})</div>` : ''}

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
              <div class="percentile-bar-fill" style="width: ${Math.min(100, Math.max(15, (t.medianLPA / 70) * 100))}%;"></div>
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
    getElements();
    if (!trends) return;

    if (cityTrendsList && Array.isArray(trends.hiringHubs)) {
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

    if (skillsTrendsList && Array.isArray(trends.topDemandedSkills)) {
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
    getElements();
    if (!playbookGrid || !Array.isArray(tips)) return;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
