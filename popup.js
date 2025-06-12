// First 100 digits of PI (excluding "3.")
const PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

let currentIndex = 0;
let score = 0;
let gameOver = false;
let highestScore = Number(localStorage.getItem('pi_highest_score')) || 0;

const piSequenceElem = document.getElementById('pi-sequence');
const piInputElem = document.getElementById('pi-input');
const scoreElem = document.getElementById('score');
const messageElem = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const progressElem = document.getElementById('pi-progress');
const hintElem = document.getElementById('hint');
const modeSelectElem = document.getElementById('mode-select');
const timerElem = document.getElementById('timer');
const timerValueElem = document.getElementById('timer-value');
const emojiFeedbackElem = document.getElementById('emoji-feedback');
const motivationElem = document.getElementById('motivation');
const confettiCanvas = document.getElementById('confetti-canvas');
const achievementsBtn = document.getElementById('achievements-btn');
const achievementsModal = document.getElementById('achievements-modal');
const closeAchievements = document.getElementById('close-achievements');
const achievementsList = document.getElementById('achievements-list');
const shareBtn = document.getElementById('share-btn');
const highestScoreElem = document.getElementById('highest-score');

const triviaBtn = document.getElementById('trivia-btn');
const triviaModal = document.getElementById('trivia-modal');
const closeTrivia = document.getElementById('close-trivia');
const triviaQuestionElem = document.getElementById('trivia-question');
const triviaOptionsElem = document.getElementById('trivia-options');
const triviaFeedbackElem = document.getElementById('trivia-feedback');
const nextTriviaBtn = document.getElementById('next-trivia-btn');

let timer = null;
let timeElapsed = 0;
let timedMode = false;
let lastScoreForAchievement = 0;

let currentTrivia = null;
let triviaAnswered = false;
let triviaAskedIndexes = []; // Track asked questions in this session

// Add daily challenge UI
const dailyChallengeElem = document.createElement('div');
dailyChallengeElem.id = 'daily-challenge';
dailyChallengeElem.className = 'arcade-daily-challenge';
document.querySelector('.arcade-panel').insertBefore(dailyChallengeElem, document.getElementById('pi-sequence'));

function updateHighestScoreDisplay() {
  highestScoreElem.textContent = "Highest Score: " + highestScore;
}

function updateDailyChallengeUI() {
  const challenge = window.getOrCreateDailyChallenge();
  const completed = window.isDailyChallengeCompleted();
  dailyChallengeElem.innerHTML = completed
    ? `🌟 <b>Daily Challenge:</b> ${challenge} digits <span style="color:#39ff14;">(Completed!)</span>`
    : `🎯 <b>Daily Challenge:</b> Reach <b>${challenge}</b> digits today!`;
}

function startTimer() {
  timeElapsed = 0;
  timerValueElem.textContent = timeElapsed;
  timerElem.style.display = 'block';
  timer = setInterval(() => {
    timeElapsed++;
    timerValueElem.textContent = timeElapsed;
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetGame() {
  currentIndex = 0;
  score = 0;
  gameOver = false;
  lastScoreForAchievement = 0;
  piSequenceElem.textContent = "3.";
  piInputElem.value = "";
  piInputElem.disabled = false;
  scoreElem.textContent = "Score: 0";
  messageElem.textContent = "";
  restartBtn.style.display = "none";
  progressElem.value = 0;
  hintElem.textContent = "";
  stopTimer();
  timeElapsed = 0;
  timerValueElem.textContent = "0";
  window.showEmoji("", emojiFeedbackElem);
  motivationElem.textContent = "";
  motivationElem.style.opacity = 0;
  confettiCanvas.style.display = 'none';
  if (timedMode) {
    timerElem.style.display = 'block';
    startTimer();
  } else {
    timerElem.style.display = 'none';
  }
  piInputElem.focus();
  updateHighestScoreDisplay();
  updateDailyChallengeUI();
}

function handleInput() {
  if (gameOver) return;
  if (timedMode && !timer) startTimer();
  const input = piInputElem.value;
  let correct = true;
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== PI_DIGITS[currentIndex + i]) {
      correct = false;
      break;
    }
  }
  if (!correct) {
    gameOver = true;
    messageElem.textContent = "Wrong digit! Game over.";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    window.showEmoji("wrong", emojiFeedbackElem);
    hintElem.textContent = `The next digit was: ${PI_DIGITS[currentIndex]}`;
    if (score > highestScore) {
      highestScore = score;
      localStorage.setItem('pi_highest_score', highestScore);
      updateHighestScoreDisplay();
    }
    if (timedMode) {
      stopTimer();
      messageElem.textContent += ` Time: ${timeElapsed}s.`;
    }
    window.showRandomPIFact(motivationElem);
    lastScoreForAchievement = 0;
    updateDailyChallengeUI();
    return;
  }
  piSequenceElem.textContent = "3." + PI_DIGITS.substring(0, currentIndex + input.length);
  scoreElem.textContent = "Score: " + (currentIndex + input.length);
  progressElem.value = currentIndex + input.length;
  progressElem.max = PI_DIGITS.length;
  hintElem.textContent = "";
  window.animateCorrectInput(piSequenceElem, emojiFeedbackElem);
  window.showMotivation(currentIndex + input.length, motivationElem);

  const newScore = currentIndex + input.length;
  const achievement = window.getNewAchievement(newScore, lastScoreForAchievement);
  if (achievement) {
    window.showAchievement(achievement, messageElem);
  }
  lastScoreForAchievement = newScore;

  // Daily challenge check
  const challenge = window.getOrCreateDailyChallenge();
  if (!window.isDailyChallengeCompleted() && newScore >= challenge) {
    window.markDailyChallengeCompleted();
    updateDailyChallengeUI();
    messageElem.textContent = `🎉 Daily Challenge Complete! (${challenge} digits)`;
    messageElem.style.color = "#39ff14";
    setTimeout(() => {
      messageElem.textContent = "";
      messageElem.style.color = "#ff2fd6";
    }, 2500);
  }

  if (newScore === PI_DIGITS.length) {
    messageElem.textContent = "Congratulations! You completed all available digits!";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    gameOver = true;
    window.showEmoji("win", emojiFeedbackElem);
    window.launchConfetti(confettiCanvas);
    if (timedMode) {
      stopTimer();
      messageElem.textContent += ` Time: ${timeElapsed}s.`;
    }
    motivationElem.textContent = "You did it! 🎊";
    motivationElem.style.opacity = 1;
    setTimeout(() => window.showRandomPIFact(motivationElem), 2000);
    lastScoreForAchievement = 0;
    return;
  }
  if (input.length > 0) {
    score = newScore;
    if (score > highestScore) {
      highestScore = score;
      localStorage.setItem('pi_highest_score', highestScore);
      updateHighestScoreDisplay();
    }
  }
  if (input.length > 0 && input.length + currentIndex < PI_DIGITS.length) {
    if (input.length > 0) {
      currentIndex += input.length;
      piInputElem.value = "";
    }
  }
}

modeSelectElem.addEventListener('change', () => {
  timedMode = modeSelectElem.value === 'timed';
  resetGame();
});

piInputElem.addEventListener('input', handleInput);
restartBtn.addEventListener('click', resetGame);
achievementsBtn.addEventListener('click', showAchievementsModal);
closeAchievements.addEventListener('click', hideAchievementsModal);

// Optional: close modal when clicking outside content
achievementsModal.addEventListener('click', function(e) {
  if (e.target === achievementsModal) hideAchievementsModal();
});

// Achievements modal logic
function showAchievementsModal() {
  const unlocked = window.getUnlockedAchievements(highestScore);
  achievementsList.innerHTML = "";
  window.ACHIEVEMENTS.forEach(a => {
    const unlockedBadge = unlocked.some(u => u.digits === a.digits);
    const row = document.createElement('div');
    row.className = 'arcade-achievement-row' + (unlockedBadge ? '' : ' locked');
    row.innerHTML = `<span class="arcade-badge">${a.badge}</span>
      <span class="arcade-achievement-label">${a.label}</span>`;
    achievementsList.appendChild(row);
  });
  achievementsModal.style.display = "flex";
}

function hideAchievementsModal() {
  achievementsModal.style.display = "none";
}

// Share button logic
function getShareMessage() {
  const unlocked = window.getUnlockedAchievements(highestScore);
  const badges = unlocked.map(a => a.badge).join(' ');
  return `I scored ${highestScore} digits in the PI Game! ${badges ? 'Achievements: ' + badges : ''} Try it: https://github.com/SawsanDaban/PI-Game-Extension`;
}

shareBtn.addEventListener('click', () => {
  const msg = getShareMessage();
  navigator.clipboard.writeText(msg).then(() => {
    shareBtn.textContent = 'Copied!';
    setTimeout(() => {
      shareBtn.textContent = 'Share Score';
    }, 1500);
  });
});

// Trivia modal logic
function showTriviaModal() {
  triviaAskedIndexes = [];
  loadTriviaQuestion();
  triviaModal.style.display = "flex";
}

function hideTriviaModal() {
  triviaModal.style.display = "none";
}

function loadTriviaQuestion() {
  // Get all available indexes
  const total = window.PI_TRIVIA.length;
  // If all questions have been asked, reset the session
  if (triviaAskedIndexes.length === total) {
    triviaAskedIndexes = [];
  }
  // Get available indexes
  const available = [];
  for (let i = 0; i < total; i++) {
    if (!triviaAskedIndexes.includes(i)) available.push(i);
  }
  // Pick a random available index
  const idx = available[Math.floor(Math.random() * available.length)];
  currentTrivia = window.PI_TRIVIA[idx];
  triviaAskedIndexes.push(idx);

  triviaAnswered = false;
  triviaQuestionElem.textContent = currentTrivia.question;
  triviaFeedbackElem.textContent = "";
  nextTriviaBtn.style.display = "none";
  triviaOptionsElem.innerHTML = "";
  currentTrivia.options.forEach((opt, oidx) => {
    const btn = document.createElement('button');
    btn.className = 'arcade-trivia-option-btn';
    btn.textContent = opt;
    btn.onclick = () => handleTriviaAnswer(oidx, btn);
    triviaOptionsElem.appendChild(btn);
  });
}

function handleTriviaAnswer(idx, btn) {
  if (triviaAnswered) return;
  triviaAnswered = true;
  if (idx === currentTrivia.answer) {
    triviaFeedbackElem.textContent = "✅ Correct!";
    triviaFeedbackElem.style.color = "#39ff14";
    btn.style.background = "#39ff14";
    btn.style.color = "#181828";
  } else {
    triviaFeedbackElem.textContent = "❌ Incorrect! The correct answer is: " + currentTrivia.options[currentTrivia.answer];
    triviaFeedbackElem.style.color = "#ff2fd6";
    btn.style.background = "#ff2fd6";
    btn.style.color = "#fff";
    // Highlight correct answer
    Array.from(triviaOptionsElem.children).forEach((b, i) => {
      if (i === currentTrivia.answer) {
        b.style.background = "#39ff14";
        b.style.color = "#181828";
      }
    });
  }
  nextTriviaBtn.style.display = "block";
}

nextTriviaBtn.addEventListener('click', loadTriviaQuestion);
triviaBtn.addEventListener('click', showTriviaModal);
closeTrivia.addEventListener('click', hideTriviaModal);
triviaModal.addEventListener('click', function(e) {
  if (e.target === triviaModal) hideTriviaModal();
});

timedMode = modeSelectElem.value === 'timed';
resetGame();
