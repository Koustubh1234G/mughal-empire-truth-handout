class BadgeManager {
  constructor() {
    this.badges = [];
    this.unlocked = JSON.parse(localStorage.getItem('badges')) || [];
  }

  async init() {
    await this.loadBadges();
    this.showBadges();
  }

  async loadBadges() {
    try {
      const response = await fetch('/_data/badges.json');
      this.badges = await response.json();
    } catch (error) {
      console.error("Couldn't load badges", error);
    }
  }

  showBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    container.innerHTML = `
      <h1>Your Dharmic Badges</h1>
      <div class="badges-grid">
        ${this.badges.map(badge => `
          <div class="badge ${this.hasBadge(badge.id) ? 'unlocked' : 'locked'}">
            <div class="icon">${badge.icon}</div>
            <h3>${badge.name}</h3>
            <p>${badge.description}</p>
            ${this.hasBadge(badge.id) ? 
              '<span class="unlocked">Earned</span>' : 
              '<div class="lock">🔒</div>'}
          </div>
        `).join('')}
      </div>
    `;
  }

  unlock(badgeId) {
    if (this.hasBadge(badgeId)) return false;
    
    this.unlocked.push({
      id: badgeId,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('badges', JSON.stringify(this.unlocked));
    this.showBadges();
    this.showNotification(badgeId);
    return true;
  }

  hasBadge(badgeId) {
    return this.unlocked.some(b => b.id === badgeId);
  }

  showNotification(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (!badge) return;

    const note = document.createElement('div');
    note.className = 'badge-notification';
    note.innerHTML = `
      <div class="badge-notice">
        <h3>New Badge!</h3>
        <div class="icon">${badge.icon}</div>
        <p>${badge.name}</p>
      </div>
    `;
    
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }
}

// Start everything
new BadgeManager().init();