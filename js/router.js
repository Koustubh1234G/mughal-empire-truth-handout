const routes = {
  'overview': 'components/overview.html',
  'chapters': 'components/index-chapters.html',
  'truth': 'components/truth-cards.html',
  'quiz': 'components/quiz.html',
  'quotes': 'components/quote.html',
  'download': 'components/download.html',
  'share': 'components/share.html',
  'review': 'components/review.html',
  'connect': 'components/connect.html',
  'badges': 'components/badges.html'
};

function loadRoute() {
  const hash = window.location.hash.replace('#', '');
  const route = routes[hash] || routes['overview'];
  fetch(route)
    .then(res => res.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;

      // Optional: re-trigger scripts if needed
      if (typeof trackShareButtons === 'function') trackShareButtons();
      if (typeof setupQuiz === 'function') setupQuiz();
      if (typeof setupBadges === 'function') setupBadges();
    });
}

window.addEventListener('hashchange', loadRoute);
window.addEventListener('DOMContentLoaded', loadRoute);
