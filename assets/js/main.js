// Analytics and Site Functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Initialize analytics if consent given
  if (localStorage.getItem('analytics-consent') === 'true') {
    initializeAnalytics();
  }

  // Show consent banner if no preference set
  // if (localStorage.getItem('analytics-consent') === null) {
  //   document.getElementById('consent-banner')?.style.display = 'flex';
  // }

  // Initialize flip cards
  initializeFlipCards();

  // Initialize quiz functionality
  initializeQuiz();

  // Initialize badge system
  initializeBadges();

  // Track important interactions
  setupInteractionTracking();
});

// ANALYTICS FUNCTIONS
function initializeAnalytics() {
  // Cloudflare Analytics
  const cfScript = document.createElement('script');
  cfScript.defer = true;
  cfScript.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  cfScript.setAttribute('data-cf-beacon', '{"token": "..."}');
  document.head.appendChild(cfScript);

  // GoatCounter Analytics
  const gcScript = document.createElement('script');
  gcScript.dataset.goatcounter = 'https://bharatyatra.goatcounter.com/count';
  gcScript.async = true;
  gcScript.src = '//gc.zgo.at/count.js';
  document.head.appendChild(gcScript);

  // Track initial pageview
  trackPageView();
}

function trackPageView() {
  if (!hasAnalyticsConsent()) return;

  const path = window.location.pathname + window.location.search + window.location.hash;
  
  // GoatCounter
  if (window.goatcounter?.count) {
    goatcounter.count({
      path: path,
      title: document.title,
      event: false
    });
  }
  
  // Cloudflare
  if (window.cloudflare) {
    cloudflare.track(`Pageview: ${document.title}`);
  }
}

function trackAction(action, label = '', value = null) {
  if (!hasAnalyticsConsent()) return;

  const eventData = {
    path: action,
    title: label || document.title,
    event: true
  };

  // GoatCounter
  if (window.goatcounter?.count) {
    goatcounter.count(eventData);
  }
  
  // Cloudflare
  if (window.cloudflare) {
    cloudflare.track(label || action, value);
  }
}

function hasAnalyticsConsent() {
  return localStorage.getItem('analytics-consent') === 'true';
}

// CONSENT MANAGEMENT
function acceptAnalytics() {
  localStorage.setItem('analytics-consent', 'true');
  document.getElementById('consent-banner').style.display = 'none';
  initializeAnalytics();
  trackAction('consent', 'Analytics Accepted');
}

function rejectAnalytics() {
  localStorage.setItem('analytics-consent', 'false');
  document.getElementById('consent-banner').style.display = 'none';
  trackAction('consent', 'Analytics Rejected');
}

// SITE COMPONENTS
function initializeFlipCards() {
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      trackAction('card-flip', 'Truth Card Flipped');
    });
  });
}

function initializeQuiz() {
  const quizForm = document.getElementById('quiz-form');
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Quiz submission logic
      trackAction('quiz-submit', 'Quiz Submitted');
    });
  }
}

function initializeBadges() {
  // Badge unlocking logic
  document.querySelectorAll('[data-badge-trigger]').forEach(el => {
    el.addEventListener('click', () => {
      const badgeName = el.dataset.badgeTrigger;
      if (badgeName && Math.random() < 0.1) { // 10% chance
        unlockBadge(badgeName);
      }
    });
  });
}

function unlockBadge(badgeName) {
  const unlockedBadges = JSON.parse(localStorage.getItem('badges') || '[]');
  if (!unlockedBadges.includes(badgeName)) {
    unlockedBadges.push(badgeName);
    localStorage.setItem('badges', JSON.stringify(unlockedBadges));
    showBadgeNotification(badgeName);
    trackAction('badge-unlock', `Badge Unlocked: ${badgeName}`);
  }
}

function showBadgeNotification(badgeName) {
  const notification = document.createElement('div');
  notification.className = 'badge-notification';
  notification.innerHTML = `
    <div class="badge-unlocked">
      <span>New Badge Unlocked!</span>
      <h3>${badgeName.toUpperCase()}</h3>
      <p>${getBadgeDescription(badgeName)}</p>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

function getBadgeDescription(badgeName) {
  const descriptions = {
    nalanda: "Learned about Nalanda University destruction",
    pratap: "Discovered truth about Rana Pratap's resistance"
    // Add more badge descriptions
  };
  return descriptions[badgeName] || "Earned by uncovering hidden truths";
}

// INTERACTION TRACKING
function setupInteractionTracking() {
  // PDF downloads
  document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', () => {
      trackAction('download', `PDF Downloaded: ${link.href.split('/').pop()}`);
    });
  });

  // External links
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.href.includes(window.location.host)) {
      link.addEventListener('click', () => {
        trackAction('external-link', `Outbound Link: ${link.href}`);
      });
    }
  });

  // Form submissions
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
      trackAction('form-submit', `Form Submitted: ${form.id || 'anonymous'}`);
    });
  });
}

// THEME SWITCHER
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  trackAction('theme-change', `Theme Switched to ${newTheme}`);
}

// Expose functions to global scope
window.acceptAnalytics = acceptAnalytics;
window.rejectAnalytics = rejectAnalytics;
window.toggleTheme = toggleTheme;