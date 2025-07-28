// 🎖️ Check if "Truth Seeker" badge should be awarded
function checkForTruthBadge() {
  const flips = parseInt(localStorage.getItem("flipCount") || "0");
  const quizScore = parseInt(localStorage.getItem("quizScore") || "0");
  const hasBadge = localStorage.getItem("truthBadge") === "yes";

  if (!hasBadge && flips >= 6 && quizScore >= 70) {
    localStorage.setItem("truthBadge", "yes");
    localStorage.setItem("badge-truth_seeker", "true");
    showBadgePopup("truth_seeker");
  }
}

// 🎖️ Show popup when badge earned
function showBadgePopup(badgeId) {
  fetch('/json/badges.json')
    .then(res => res.json())
    .then(badges => {
      const badge = badges.find(b => b.id === badgeId);
      if (!badge) return;

      const badgeEl = document.createElement("div");
      badgeEl.className = "truth-badge-popup";
      badgeEl.innerHTML = `
        <div class="badge-box">
          <h2>🏅 ${badge.name} Badge Earned!</h2>
          <p>${badge.description}</p>
          <button onclick="copyBadgeLink()">📋 Copy Share Link</button>
        </div>
      `;
      document.body.appendChild(badgeEl);

      // ✅ Track badge unlock
      trackBadgeUnlock(badgeId);
    });
}


// 📦 Load and render badges from badges.json
async function loadBadges() {
  const res = await fetch('/json/badges.json');
  const badges = await res.json();

  const container = document.querySelector('.badge-grid');
  if (!container) return;

  badges.forEach(badge => {
    const unlocked = isBadgeUnlocked(badge.id, badge.trigger);
    if (unlocked) localStorage.setItem(`badge-${badge.id}`, 'true');

    const div = document.createElement('div');
    div.className = `badge-card ${unlocked ? 'unlocked' : 'locked'}`;
    div.innerHTML = `
      ${badge.icon_svg || `<div class="badge-icon">${badge.icon}</div>`}
      <p>${badge.name}</p>
    `;
    div.title = badge.description;
    container.appendChild(div);
  });
}

// 🔓 Check if badge is unlocked based on triggers
function isBadgeUnlocked(id, trigger) {
  if (localStorage.getItem(`badge-${id}`) === 'true') return true;

  const user = {
    flipCount: parseInt(localStorage.getItem('flipCount')) || 0,
    quizCompleted: localStorage.getItem('quizCompleted') === 'true',
    quizScore: parseInt(localStorage.getItem('quizScore')) || 0,
    shared: localStorage.getItem('shared') === 'true',
    reviewSubmitted: localStorage.getItem('reviewSubmitted') === 'true',
    daysSinceFirstVisit: calculateDaysSinceVisit()
  };

  for (let key in trigger) {
    const required = trigger[key];
    const actual = user[key];

    if (typeof required === 'number') {
      if (actual < required) return false;
    } else if (required === true && actual !== true) {
      return false;
    }
  }

  return true;
}

// ⏳ Calculate how long user has been on the site
function calculateDaysSinceVisit() {
  const firstVisit = localStorage.getItem('firstVisitDate');
  if (!firstVisit) {
    const today = new Date().toISOString();
    localStorage.setItem('firstVisitDate', today);
    return 0;
  }

  const diffMs = new Date() - new Date(firstVisit);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// 🪟 Badge gallery controls
function openBadgeGallery() {
  document.getElementById("badgeGalleryOverlay")?.classList.add("active");
}

function closeBadgeGallery() {
  document.getElementById("badgeGalleryOverlay")?.classList.remove("active");
}

// 📋 Share helper (dummy for now)
function copyBadgeLink() {
  const link = window.location.href + "?badge=earned";
  navigator.clipboard.writeText(link).then(() => {
    alert("Link copied to clipboard!");
  });
}


// for analytics
function trackBadgeUnlock(badgeId) {
  if (window.goatcounter) {
    goatcounter.count({
      path: `/badge-unlocked/${badgeId}`,
      title: `Badge Unlocked: ${badgeId}`
    });
  }
}
