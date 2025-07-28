// Load and handle quiz
fetch("data/quiz.json")
  .then(res => res.json())
  .then(quizData => {
    const container = document.getElementById("quiz-container");
    if (!container) return;
    let score = 0;
    quizData.forEach((q, i) => {
      const qDiv = document.createElement("div");
      qDiv.innerHTML = `<p>${q.question}</p>` + q.options.map((opt, j) => 
        `<label><input type="radio" name="q${i}" value="${j}">${opt}</label><br>`
      ).join("");
      container.appendChild(qDiv);
    });
    const btn = document.createElement("button");
    btn.textContent = "Submit Quiz";
    btn.onclick = () => {
      score = quizData.reduce((acc, q, i) => {
        const selected = document.querySelector(`input[name='q${i}']:checked`);
        return acc + (selected && parseInt(selected.value) === q.answer ? 1 : 0);
      }, 0);
      localStorage.setItem("quizCompleted", "true");
      alert(`You scored ${score}/${quizData.length}`);
    };
    container.appendChild(btn);
  });


function saveQuizScore(score) {
  localStorage.setItem("quizScore", score);
  const prev = parseInt(localStorage.getItem("quizHighScore") || "0");
  if (score > prev) {
    localStorage.setItem("quizHighScore", score);
    alert(`New high score! You scored ${score}%`);
  } else {
    alert(`You scored ${score}%. High score: ${prev}%`);
  }
}
