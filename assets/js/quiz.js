// quiz.js
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const quizContainer = document.getElementById('quiz-container');
    const quizResult = document.getElementById('quiz-result');
    const highScoreElement = document.getElementById('high-score');
    let quizQuestions = [];
    
    // Load high score
    const highScore = parseInt(localStorage.getItem('quizHighScore')) || 0;
    highScoreElement.innerHTML = `High Score: <span>${highScore}%</span>`;
    
    // Load quiz data
    const response = await fetch('/_data/quiz.json');
    if (!response.ok) throw new Error('Failed to load quiz data');
    const allQuestions = await response.json();
    
    // Select random questions
    quizQuestions = getRandomQuestions(allQuestions, 5);
    
    // Render quiz
    renderQuiz(quizQuestions, quizContainer);
    
    // Handle submission
    document.getElementById('submit-quiz').addEventListener('click', async () => {
      const results = calculateScore(quizQuestions);
      showResults(results, quizResult);
      
      // Update high score
      const percentage = Math.round((results.score / results.total) * 100);
      if (percentage > highScore) {
        localStorage.setItem('quizHighScore', percentage);
        highScoreElement.innerHTML = `High Score: <span>${percentage}%</span>`;
      }
      
      // Award badges
      await awardBadges(results.score, results.total);
    });
    
  } catch (error) {
    console.error('Quiz error:', error);
    quizContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load quiz. Please try again later.</p>
      </div>
    `;
  }
});

// Badge Manager Class
class BadgeManager {
  constructor() {
    this.unlockedBadges = JSON.parse(localStorage.getItem('unlockedBadges')) || [];
    this.badgeData = [];
  }

  async init() {
    try {
      const response = await fetch('/_data/badges.json');
      if (!response.ok) throw new Error('Badge data not found');
      this.badgeData = await response.json();
    } catch (error) {
      console.error('Error loading badge data:', error);
    }
  }

  unlockBadge(badgeId) {
    if (this.hasBadge(badgeId)) return false;
    
    const badge = this.badgeData.find(b => b.id === badgeId);
    if (!badge) return false;
    
    const unlockedBadge = {
      ...badge,
      unlockedAt: new Date().toISOString()
    };
    
    this.unlockedBadges.push(unlockedBadge);
    localStorage.setItem('unlockedBadges', JSON.stringify(this.unlockedBadges));
    
    // Show notification
    this.showBadgeNotification(unlockedBadge);
    return true;
  }

  hasBadge(badgeId) {
    return this.unlockedBadges.some(badge => badge.id === badgeId);
  }

  showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = `badge-notification rarity-${badge.rarity}`;
    notification.innerHTML = `
      <div class="badge-notification-content">
        <h4>New Badge Earned!</h4>
        <div class="badge-icon">${badge.icon}</div>
        <h4>${badge.name}</h4>
        <p>${badge.description}</p>
        <small>Rarity: ${badge.rarity}</small>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }
}

// Quiz Functions
function getRandomQuestions(questions, count) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function renderQuiz(questions, container) {
  container.innerHTML = '';
  
  questions.forEach((question, index) => {
    container.innerHTML += `
      <div class="question" data-question-id="${index}">
        <h3>${index + 1}. ${question.question}</h3>
        <div class="options">
          ${question.options.map((option, i) => `
            <label class="option">
              <input type="radio" name="q${index}" value="${i}">
              ${option}
            </label>
          `).join('')}
        </div>
        ${question.explanation ? `
          <div class="explanation" data-explanation-for="q${index}" style="display: none;">
            <strong>Explanation:</strong> ${question.explanation}
          </div>
        ` : ''}
      </div>
    `;
  });
  
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
      const questionDiv = this.closest('.question');
      questionDiv.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });
  
  container.innerHTML += `<button id="submit-quiz">Submit Answers</button>`;
}

function calculateScore(questions) {
  let score = 0;
  const details = [];
  
  questions.forEach((question, index) => {
    const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
    const selectedValue = selectedOption ? parseInt(selectedOption.value) : null;
    const isCorrect = selectedValue === question.answer;
    
    if (isCorrect) score++;
    
    const questionDiv = document.querySelector(`.question[data-question-id="${index}"]`);
    if (questionDiv) {
      const options = questionDiv.querySelectorAll('.option');
      options.forEach((option, i) => {
        if (i === question.answer) {
          option.classList.add('correct');
        } else if (selectedOption && i === selectedValue) {
          option.classList.add('incorrect');
        }
      });
      
      const explanation = questionDiv.querySelector('.explanation');
      if (explanation) explanation.style.display = 'block';
    }
    
    details.push({
      question: question.question,
      selected: selectedValue,
      correct: question.answer,
      explanation: question.explanation,
      isCorrect: isCorrect
    });
  });
  
  return {
    score: score, 
    total: questions.length,
    details: details
  };
}

function showResults(results, resultContainer) {
  const percentage = Math.round((results.score / results.total) * 100);
  const detailsElement = resultContainer.querySelector('.result-details');
  
  detailsElement.innerHTML = `
    <p>You scored <strong>${results.score}/${results.total}</strong> (${percentage}%)</p>
    <div class="answers-details">
      ${results.details.map((detail, i) => `
        <div class="answer-detail ${detail.isCorrect ? 'correct' : 'incorrect'}">
          <p><strong>Q${i+1}:</strong> ${detail.question}</p>
          ${detail.explanation ? `<p class="explanation-text">${detail.explanation}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
  
  resultContainer.style.display = 'block';
  window.scrollTo({
    top: resultContainer.offsetTop - 20,
    behavior: 'smooth'
  });
}

async function awardBadges(score, total) {
  const percentage = (score / total) * 100;
  const badgeManager = new BadgeManager();
  await badgeManager.init();

  if (percentage >= 90) {
    badgeManager.unlockBadge('history_master');
  } 
  else if (percentage >= 70) {
    badgeManager.unlockBadge('history_scholar');
  }
  else if (percentage >= 50) {
    badgeManager.unlockBadge('history_learner');
  }
}