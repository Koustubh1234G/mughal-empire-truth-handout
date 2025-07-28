// Rotating Hero Quotes
fetch("data/quotes.json")
  .then(res => res.json())
  .then(quotes => {
    let q = 0;
    const el = document.getElementById("hero-quote");
    if (!el) return;
    el.textContent = quotes[0];
    setInterval(() => {
      q = (q + 1) % quotes.length;
      el.textContent = quotes[q];
    }, 5000);
  });

function incrementFlip() {
  let flipCount = parseInt(localStorage.getItem("flipCount") || "0");
  flipCount += 1;
  localStorage.setItem("flipCount", flipCount);

  if (flipCount >= 6 && !localStorage.getItem("truthUnlocked")) {
    alert("You've uncovered 6 truths! Badge unlocking soon...");
    localStorage.setItem("truthUnlocked", "true");
  }
}

function openBadgeGallery() {
  document.getElementById('badgeGalleryOverlay').classList.add('active');
}
function closeBadgeGallery() {
  document.getElementById('badgeGalleryOverlay').classList.remove('active');
}


function copyLink(src = "copylink") {
  const url = `https://koustubh1234g.github.io/mughal-empire-truth-handout/?src=${src}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied to clipboard!");
  });
  if (window.goatcounter) {
    goatcounter.count({ path: `/event/share-${src}` });
  }
}

function copyFloatingLink() {
	const url = "https://koustubh1234g.github.io/mughal-empire-truth-handout/?src=floating-copy";
	navigator.clipboard.writeText(url).then(() => {
		alert("Link copied to clipboard!");
	});
	if (window.goatcounter) {
		goatcounter.count({ path: '/event/floating-copy' });
	}
}