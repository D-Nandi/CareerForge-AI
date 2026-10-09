// ══════════════════════════════════════════════════════════════════════
//  CareerNest — Enterprise Analytics, GA4 Bridge & Visitor Segmentation Engine
// ══════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const STORAGE_EVENTS_KEY = 'careernest_analytics_events';
  const STORAGE_VISITOR_KEY = 'careernest_visitor_profile';
  const STORAGE_SESSION_KEY = 'careernest_session_meta';

  // 1. Detect or Configure GA4 Measurement ID
  // Can be configured via:
  // - window.CAREERNEST_GA_MEASUREMENT_ID
  // - <meta name="google-analytics-id" content="G-XXXXXXXXXX">
  // - localStorage 'careernest_ga_id'
  const metaGa = document.querySelector('meta[name="google-analytics-id"]');
  const GA_MEASUREMENT_ID = 
    window.CAREERNEST_GA_MEASUREMENT_ID || 
    (metaGa ? metaGa.getAttribute('content') : null) || 
    localStorage.getItem('careernest_ga_id') || 
    'G-RR74F3G1E1';

  // 2. Parse UTM & Referrer Data (including AI Chatbot detection)
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmTerm = urlParams.get('utm_term');
  const utmContent = urlParams.get('utm_content');

  let referrerHost = '';
  try {
    if (document.referrer) {
      referrerHost = new URL(document.referrer).hostname.toLowerCase();
    }
  } catch (e) {
    referrerHost = '';
  }

  // Detect AI Chatbot Referrers (ChatGPT, Claude, Perplexity, Gemini, Copilot, etc.)
  function detectAiBot(host) {
    if (!host) return null;
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com') || host.includes('openai.com')) return 'ChatGPT';
    if (host.includes('perplexity.ai')) return 'Perplexity';
    if (host.includes('claude.ai') || host.includes('anthropic.com')) return 'Claude';
    if (host.includes('gemini.google.com') || host.includes('bard.google.com')) return 'Gemini';
    if (host.includes('copilot.microsoft.com') || host.includes('bing.com/chat')) return 'Copilot';
    if (host.includes('poe.com')) return 'Poe';
    if (host.includes('you.com')) return 'You.com';
    return null;
  }

  const aiBotReferrer = detectAiBot(referrerHost);

  // Determine Traffic Channel
  function detectTrafficChannel() {
    if (aiBotReferrer) return 'ai_search';
    if (utmMedium === 'cpc' || utmMedium === 'paid' || utmSource === 'google-ads' || utmSource === 'meta-ads') return 'paid';
    if (referrerHost.includes('google.') || referrerHost.includes('bing.') || referrerHost.includes('duckduckgo.') || referrerHost.includes('yahoo.')) return 'organic_search';
    if (referrerHost.includes('linkedin.') || referrerHost.includes('twitter.') || referrerHost.includes('x.com') || referrerHost.includes('reddit.') || referrerHost.includes('facebook.')) return 'social';
    if (referrerHost && referrerHost !== window.location.hostname) return 'referral';
    if (!document.referrer) return 'direct';
    return 'other';
  }

  const trafficChannel = detectTrafficChannel();

  // 3. Visitor Segmentation Engine
  function getOrCreateVisitorProfile() {
    let profile = null;
    try {
      profile = JSON.parse(localStorage.getItem(STORAGE_VISITOR_KEY));
    } catch(e) {}

    const now = Date.now();
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes session inactivity

    let sessionMeta = null;
    try {
      sessionMeta = JSON.parse(localStorage.getItem(STORAGE_SESSION_KEY));
    } catch(e) {}

    const isNewSession = !sessionMeta || (now - sessionMeta.lastActive > SESSION_TIMEOUT_MS);

    if (!profile) {
      profile = {
        visitorId: 'cn_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36),
        firstSeen: new Date().toISOString(),
        totalVisits: 1,
        totalPageViews: 0,
        toolsUsed: [],
        primaryIntent: 'exploring',
        persona: 'job_seeker',
        lifecycleStage: 'discovery',
        initialSource: {
          channel: trafficChannel,
          aiBot: aiBotReferrer,
          referrer: document.referrer || 'direct',
          utmSource: utmSource || 'none',
          utmCampaign: utmCampaign || 'none'
        }
      };
    } else if (isNewSession) {
      profile.totalVisits = (profile.totalVisits || 1) + 1;
    }

    profile.totalPageViews = (profile.totalPageViews || 0) + 1;
    profile.lastSeen = new Date().toISOString();

    // Map intent from current page
    const path = window.location.pathname.toLowerCase();
    let currentIntent = profile.primaryIntent;
    if (path.includes('ats-score-checker')) currentIntent = 'ats_score_audit';
    else if (path.includes('form-index') || path.includes('preview')) currentIntent = 'resume_builder';
    else if (path.includes('interview-prep')) currentIntent = 'interview_coach';
    else if (path.includes('career-roadmap')) currentIntent = 'career_roadmap';
    else if (path.includes('salary-benchmark')) currentIntent = 'salary_research';
    else if (path.includes('pricing')) currentIntent = 'pricing_evaluation';
    else if (path.includes('cover-letter')) currentIntent = 'cover_letter';
    else if (path.includes('templates')) currentIntent = 'template_browsing';
    else if (path.includes('resume-example')) currentIntent = 'example_research';

    if (currentIntent && !profile.toolsUsed.includes(currentIntent)) {
      profile.toolsUsed.push(currentIntent);
    }
    profile.primaryIntent = currentIntent;

    // Update Lifecycle Stage
    if (profile.lifecycleStage !== 'paid_customer') {
      if (profile.toolsUsed.length >= 2 || profile.totalPageViews >= 5) {
        profile.lifecycleStage = 'highly_engaged';
      } else if (profile.toolsUsed.length >= 1) {
        profile.lifecycleStage = 'tool_activated';
      } else {
        profile.lifecycleStage = 'discovery';
      }
    }

    // Save back to storage
    try {
      localStorage.setItem(STORAGE_VISITOR_KEY, JSON.stringify(profile));
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({
        sessionId: sessionMeta && !isNewSession ? sessionMeta.sessionId : 'sess_' + Math.random().toString(36).substring(2, 9),
        lastActive: now,
        isNewSession: isNewSession
      }));
    } catch(e) {}

    return profile;
  }

  const visitorProfile = getOrCreateVisitorProfile();

  // 4. Initialize Google Analytics (gtag.js)
  function initGoogleAnalytics(measurementId) {
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.log('%c[CareerNest Analytics]%c Running in dev/local mode. Replace G-XXXXXXXXXX with your GA4 Measurement ID in client/analytics.js or <meta name="google-analytics-id" content="G-...">', 'color: #3b82f6; font-weight: bold;', 'color: inherit;');
    }

    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());

    // Configure GA4 with User Properties & Visitor Segmentation
    gtag('config', measurementId, {
      cookie_flags: 'SameSite=None;Secure',
      user_id: visitorProfile.visitorId
    });

    // Set User Properties for Segmentation in GA4
    gtag('set', 'user_properties', {
      visitor_segment: visitorProfile.totalVisits === 1 ? 'new_visitor' : 'returning_visitor',
      session_count_tier: visitorProfile.totalVisits > 3 ? 'frequent' : (visitorProfile.totalVisits > 1 ? 'returning' : 'first_time'),
      traffic_medium: trafficChannel,
      ai_referrer: aiBotReferrer || 'none',
      primary_intent: visitorProfile.primaryIntent,
      lifecycle_stage: visitorProfile.lifecycleStage,
      tool_usage_count: visitorProfile.toolsUsed.length
    });

    // Load gtag.js asynchronously if not already injected
    if (!document.getElementById('google-analytics-gtag') && measurementId && measurementId.startsWith('G-') && measurementId !== 'G-XXXXXXXXXX') {
      const script = document.createElement('script');
      script.id = 'google-analytics-gtag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }
  }

  initGoogleAnalytics(GA_MEASUREMENT_ID);

  // 5. Unified Event Tracking Function
  function getStoredEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_EVENTS_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function trackEvent(eventName, properties = {}) {
    const payload = {
      event_category: properties.category || 'User Engagement',
      event_label: properties.label || document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      visitor_segment: visitorProfile.totalVisits === 1 ? 'new_visitor' : 'returning_visitor',
      primary_intent: visitorProfile.primaryIntent,
      lifecycle_stage: visitorProfile.lifecycleStage,
      traffic_channel: trafficChannel,
      ai_referrer: aiBotReferrer || 'none',
      utm_source: utmSource || 'none',
      utm_medium: utmMedium || 'none',
      utm_campaign: utmCampaign || 'none',
      ...properties
    };

    // 1. Dispatch to GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }

    // 2. Persist to Local Funnel Log (capped at 50 events for debugging)
    const events = getStoredEvents();
    events.push({
      name: eventName,
      timestamp: new Date().toISOString(),
      ...payload
    });
    if (events.length > 50) events.shift();
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    } catch(e) {}

    // 3. Dispatch DOM CustomEvents for UI components & debug tools
    window.dispatchEvent(new CustomEvent('careernest_track', { detail: { name: eventName, properties: payload } }));
    window.dispatchEvent(new CustomEvent('resumatic_track', { detail: { name: eventName, properties: payload } }));

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`%c[CareerNest Analytics]%c ${eventName}`, 'color: #10b981; font-weight: bold;', 'color: inherit;', payload);
    }
  }

  // 6. Automatically Track Page View with Segmentation Metadata
  trackEvent('page_view', {
    page_title: document.title,
    page_path: window.location.pathname,
    initial_channel: trafficChannel,
    ai_bot_source: aiBotReferrer
  });

  // 7. Auto-track High-Intent User Actions (Delegated Click Handlers)
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, [data-track-event]');
    if (!target) return;

    // Explicit data-track-event
    const explicitEvent = target.getAttribute('data-track-event');
    if (explicitEvent) {
      trackEvent(explicitEvent, {
        element_text: target.innerText.trim().substring(0, 50),
        element_id: target.id || null
      });
      return;
    }

    // Outbound Link Click
    if (target.tagName === 'A' && target.href && !target.href.startsWith(window.location.origin) && !target.href.startsWith('/') && !target.href.startsWith('#')) {
      trackEvent('outbound_click', {
        destination_url: target.href,
        link_text: target.innerText.trim().substring(0, 50)
      });
      return;
    }

    // Resume Builder CTAs
    if (target.innerText.toLowerCase().includes('build my resume') || target.innerText.toLowerCase().includes('create resume') || target.id === 'cta-build') {
      trackEvent('funnel_start_resume', { cta_text: target.innerText.trim() });
    }

    // Download/Export PDF
    if (target.innerText.toLowerCase().includes('download pdf') || target.id === 'downloadPdfBtn' || target.id === 'download-pdf') {
      trackEvent('resume_export_pdf', { action: 'download' });
    }

    // ATS Scan Trigger
    if (target.innerText.toLowerCase().includes('check ats score') || target.innerText.toLowerCase().includes('scan resume') || target.id === 'scanBtn') {
      trackEvent('ats_scan_initiated', { source: 'ats_tool' });
    }

    // Pricing / Upgrade CTA
    if (target.innerText.toLowerCase().includes('upgrade') || target.innerText.toLowerCase().includes('get pro') || target.href && target.href.includes('pricing.html')) {
      trackEvent('pricing_cta_click', { plan: target.getAttribute('data-plan') || 'pro' });
    }
  }, { passive: true });

  // 8. Public API Exposure
  const trackerApi = {
    track: trackEvent,
    identify: function(userId, traits = {}) {
      if (!userId) return;
      visitorProfile.userId = userId;
      visitorProfile.traits = { ...(visitorProfile.traits || {}), ...traits };
      try {
        localStorage.setItem(STORAGE_VISITOR_KEY, JSON.stringify(visitorProfile));
      } catch(e) {}
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, { user_id: userId });
        window.gtag('set', 'user_properties', traits);
      }
    },
    setMeasurementId: function(newId) {
      if (newId) {
        localStorage.setItem('careernest_ga_id', newId);
        initGoogleAnalytics(newId);
      }
    },
    getVisitorProfile: function() {
      return { ...visitorProfile };
    },
    getEvents: getStoredEvents,
    getFunnelStats: function() {
      const events = getStoredEvents();
      const counts = {};
      events.forEach(e => { counts[e.name] = (counts[e.name] || 0) + 1; });
      return counts;
    }
  };

  window.careerNestAnalytics = trackerApi;
  window.resumaticAnalytics = trackerApi;
})();
