async function loadComponent(id, path) {
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("hero-section", "components/hero.html");
  loadComponent("overview-section", "components/overview.html");
  loadComponent("share-section", "components/share-section.html");
  loadComponent("quiz-section", "components/quiz-section.html");
  loadComponent("badges-section", "components/badges.html");
  loadComponent("footer-section", "components/footer.html");
});
