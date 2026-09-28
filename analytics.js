// ══════════════════════════════════════════════════════════
//  Resumatic — Analytics & Funnel Tracking Engine
// ══════════════════════════════════════════════════════════
(function() {
  const STORAGE_KEY = 'resumatic_analytics_events';

  // Read UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source') || (document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'direct');
  const utmMedium = urlParams.get('utm_medium') || 'organic';
  const utmCampaign = urlParams.get('utm_campaign') || 'none';

  function getEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function trackEvent(eventName, properties = {}) {
    const events = getEvents();
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign },
      properties
    };
    events.push(event);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch(e) {}
    
    // Dispatch custom event for debug viewers
    window.dispatchEvent(new CustomEvent('resumatic_track', { detail: event }));
    console.log(`[Resumatic Analytics] ${eventName}`, event);
  }

  // Auto-track page view
  trackEvent('page_view', { title: document.title });

  // Expose global tracker
  window.resumaticAnalytics = {
    track: trackEvent,
    getEvents: getEvents,
    getFunnelStats: function() {
      const events = getEvents();
      const counts = {};
      events.forEach(e => {
        counts[e.name] = (counts[e.name] || 0) + 1;
      });
      return counts;
    }
  };
})();
