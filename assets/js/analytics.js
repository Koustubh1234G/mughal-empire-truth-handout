// Analytics Configuration
const analyticsConfig = {
  goatcounter: {
    endpoint: "https://bharatyatra.goatcounter.com/count",
    scriptSrc: "//gc.zgo.at/count.js"
  },
  cloudflare: {
    scriptSrc: "https://static.cloudflareinsights.com/beacon.min.js",
    token: "b1467d7d9d4b412d9f8a4c171291fdb5"
  }
};

// Initialize Analytics
function initAnalytics() {
  if (localStorage.getItem('analytics-consent') !== 'true') return;
  
  // Load GoatCounter
  const gcScript = document.createElement('script');
  gcScript.dataset.goatcounter = analyticsConfig.goatcounter.endpoint;
  gcScript.async = true;
  gcScript.src = analyticsConfig.goatcounter.scriptSrc;
  document.head.appendChild(gcScript);

  // Load Cloudflare
  const cfScript = document.createElement('script');
  cfScript.defer = true;
  cfScript.src = analyticsConfig.cloudflare.scriptSrc;
  cfScript.setAttribute('data-cf-beacon', JSON.stringify({
    token: analyticsConfig.cloudflare.token
  }));
  document.head.appendChild(cfScript);
}

// Track Events
function trackEvent(category, action, label = '', value = null) {
  if (localStorage.getItem('analytics-consent') !== 'true') return;

  // GoatCounter
  if (window.goatcounter?.count) {
    goatcounter.count({
      path: `${category}/${action}`,
      title: label || `${category} - ${action}`,
      event: true
    });
  }

  // Cloudflare
  if (window.cloudflare) {
    cloudflare.track(label || action, value);
  }
}

// Common Events
const AnalyticsEvents = {
  PAGE_VIEW: () => trackEvent('page', 'view', document.title),
  LINK_CLICK: (linkText) => trackEvent('ui', 'link-click', linkText),
  BUTTON_CLICK: (buttonId) => trackEvent('ui', 'button-click', buttonId),
  FORM_SUBMIT: (formId) => trackEvent('form', 'submit', formId),
  BADGE_EARNED: (badgeName) => trackEvent('badge', 'earned', badgeName),
  QUIZ_COMPLETED: (score) => trackEvent('quiz', 'completed', `Score: ${score}`)
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initAnalytics();
  AnalyticsEvents.PAGE_VIEW();
});

// Export for other files
window.Analytics = {
  init: initAnalytics,
  track: trackEvent,
  events: AnalyticsEvents
};