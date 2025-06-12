// First 100 digits of PI (excluding "3.")
window.PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

// --- ModeBase helpers ---
const PIModeBase = {
  getPiDigits() {
    return typeof window.PI_DIGITS === "string" ? window.PI_DIGITS : "";
  },
  updateSequence(piSequenceElem, currentIndex) {
    piSequenceElem.textContent = "3." + this.getPiDigits().substring(0, currentIndex);
  },
  updateScore(scoreElem, score) {
    scoreElem.textContent = "Score: " + score;
  },
  updateProgress(progressElem, currentIndex) {
    progressElem.value = currentIndex;
    progressElem.max = this.getPiDigits().length;
  },
  checkLastDigit(input, currentIndex) {
    const PI_DIGITS = this.getPiDigits();
    if (!input.length) return true;
    const lastTyped = input[input.length - 1];
    const expected = PI_DIGITS[currentIndex + input.length - 1];
    return lastTyped === expected;
  }
};

// --- UI Elements ---
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
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const challengesBtn = document.getElementById('challenges-btn');
const challengesModal = document.getElementById('challenges-modal');
const closeChallenges = document.getElementById('close-challenges');
const challengesList = document.getElementById('challenges-list');

// --- Challenge UI ---
const dailyChallengeElem = document.createElement('div');
dailyChallengeElem.id = 'daily-challenge';
dailyChallengeElem.className = 'arcade-daily-challenge';
document.querySelector('.arcade-panel').insertBefore(dailyChallengeElem, document.getElementById('pi-sequence'));

const weeklyChallengeElem = document.createElement('div');
weeklyChallengeElem.id = 'weekly-challenge';
weeklyChallengeElem.className = 'arcade-daily-challenge';
document.querySelector('.arcade-panel').insertBefore(weeklyChallengeElem, document.getElementById('pi-sequence'));

// --- Mode Management ---
let modeCleanup = null;
let highestScore = Number(localStorage.getItem('pi_highest_score')) || 0;
let highestStreak = Number(localStorage.getItem('pi_highest_streak')) || 0;
let speedrunHighScore = Number(localStorage.getItem('pi_speedrun_highscore')) || 0;

// --- Mode Implementations ---
function startNormalMode() {
  let currentIndex = 0;
  let score = 0;
  let ended = false;

  function endNormal() {
    if (ended) return;
    ended = true;
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    if (typeof modeCleanup === "function") modeCleanup = null;
    if (typeof onEndNormal === "function") onEndNormal(score);
  }

  function updateUI() {
    PIModeBase.updateSequence(piSequenceElem, currentIndex);
    PIModeBase.updateScore(scoreElem, score);
    PIModeBase.updateProgress(progressElem, currentIndex);
    if (document.activeElement !== piInputElem) piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    if (input.length === 0) return;

    const PI_DIGITS = PIModeBase.getPiDigits();
    if (!PI_DIGITS || PI_DIGITS.length === 0) {
      endNormal();
      return;
    }
    if (currentIndex + input.length - 1 >= PI_DIGITS.length) {
      endNormal();
      return;
    }
    if (typeof PI_DIGITS[currentIndex] === "undefined") {
      endNormal();
      return;
    }
    if (!PIModeBase.checkLastDigit(input, currentIndex)) {
      endNormal();
      return;
    }
    let accepted = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === PI_DIGITS[currentIndex + i]) {
        accepted++;
      } else {
        break;
      }
    }
    if (accepted > 0) {
      currentIndex += accepted;
      score += accepted;
      piInputElem.value = "";
      updateUI();
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  if (document.activeElement !== piInputElem) piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  function cleanup() {
    piInputElem.removeEventListener('input', handleInput);
  }

  function onEndNormal(finalScore) {
    messageElem.textContent = "Game Over! Score: " + finalScore;
    if (finalScore > highestScore) {
      highestScore = finalScore;
      localStorage.setItem('pi_highest_score', highestScore);
    }
    updateHighestScoreDisplay("normal");
  }

  return cleanup;
}

function startTimedMode() {
  let currentIndex = 0;
  let score = 0;
  let timeElapsed = 0;
  let interval = null;
  let ended = false;
  let started = false;

  function endTimed() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    if (typeof modeCleanup === "function") modeCleanup = null;
    if (typeof onEndTimed === "function") onEndTimed(score, timeElapsed);
  }

  function updateUI() {
    PIModeBase.updateSequence(piSequenceElem, currentIndex);
    PIModeBase.updateScore(scoreElem, score);
    PIModeBase.updateProgress(progressElem, currentIndex);
    timerValueElem.textContent = timeElapsed;
    piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    if (!started) {
      started = true;
      timerElem.style.display = "block";
      interval = setInterval(() => {
        timeElapsed++;
        timerValueElem.textContent = timeElapsed;
      }, 1000);
    }
    const input = piInputElem.value;
    if (input.length === 0) return;

    if (!PIModeBase.checkLastDigit(input, currentIndex)) {
      endTimed();
      return;
    }
    let accepted = 0;
    const PI_DIGITS = PIModeBase.getPiDigits();
    for (let i = 0; i < input.length; i++) {
      if (input[i] === PI_DIGITS[currentIndex + i]) {
        accepted++;
      } else {
        break;
      }
    }
    if (accepted > 0) {
      currentIndex += accepted;
      score += accepted;
      piInputElem.value = "";
      updateUI();
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  timerElem.style.display = "block";
  timeElapsed = 0;
  timerValueElem.textContent = "0";
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    timerElem.style.display = "none";
  }

  function onEndTimed(finalScore, finalTime) {
    messageElem.textContent = "Game Over! Score: " + finalScore + " | Time: " + (finalTime || 0) + "s";
    if (finalScore > highestScore) {
      highestScore = finalScore;
      localStorage.setItem('pi_highest_score', highestScore);
    }
    updateHighestScoreDisplay("timed");
  }

  return cleanup;
}

function startStreakMode() {
  let currentIndex = 0;
  let score = 0;
  let streakCountdown = 5;
  let interval = null;
  let ended = false;
  const streakCountdownElem = document.getElementById('streak-countdown');

  function endStreak() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    if (typeof modeCleanup === "function") modeCleanup = null;
    if (typeof onEndStreak === "function") onEndStreak(score);
  }

  function updateUI() {
    PIModeBase.updateSequence(piSequenceElem, currentIndex);
    PIModeBase.updateScore(scoreElem, score);
    PIModeBase.updateProgress(progressElem, currentIndex);
    if (streakCountdownElem) {
      streakCountdownElem.textContent = "⏳ " + streakCountdown.toFixed(1) + "s left";
    }
    piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    streakCountdown = 5;
    const input = piInputElem.value;
    if (input.length === 0) return;

    if (!PIModeBase.checkLastDigit(input, currentIndex)) {
      endStreak();
      return;
    }
    let accepted = 0;
    const PI_DIGITS = PIModeBase.getPiDigits();
    for (let i = 0; i < input.length; i++) {
      if (input[i] === PI_DIGITS[currentIndex + i]) {
        accepted++;
      } else {
        break;
      }
    }
    if (accepted > 0) {
      currentIndex += accepted;
      score += accepted;
      piInputElem.value = "";
      updateUI();
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  interval = setInterval(() => {
    streakCountdown -= 0.1;
    if (streakCountdown <= 0) {
      streakCountdown = 0;
      updateUI();
      endStreak();
    } else {
      updateUI();
    }
  }, 100);

  function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    if (streakCountdownElem) streakCountdownElem.textContent = "";
  }

  function onEndStreak(finalScore) {
    messageElem.textContent = "Streak Over! Score: " + finalScore;
    if (finalScore > highestStreak) {
      highestStreak = finalScore;
      localStorage.setItem('pi_highest_streak', highestStreak);
    }
    updateHighestScoreDisplay("streak");
  }

  return cleanup;
}

function startSpeedrunMode() {
  let currentIndex = 0;
  let score = 0;
  let timeLeft = 30;
  let interval = null;
  let ended = false;

  function endSpeedrun() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    if (typeof modeCleanup === "function") modeCleanup = null;
    if (typeof onEndSpeedrun === "function") onEndSpeedrun(score);
  }

  function updateUI() {
    PIModeBase.updateSequence(piSequenceElem, currentIndex);
    PIModeBase.updateScore(scoreElem, score);
    PIModeBase.updateProgress(progressElem, currentIndex);
    timerValueElem.textContent = timeLeft;
    piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    if (input.length === 0) return;

    if (!PIModeBase.checkLastDigit(input, currentIndex)) {
      endSpeedrun();
      return;
    }
    let accepted = 0;
    const PI_DIGITS = PIModeBase.getPiDigits();
    for (let i = 0; i < input.length; i++) {
      if (input[i] === PI_DIGITS[currentIndex + i]) {
        accepted++;
      } else {
        break;
      }
    }
    if (accepted > 0) {
      currentIndex += accepted;
      score += accepted;
      piInputElem.value = "";
      updateUI();
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  timerElem.style.display = "block";
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  interval = setInterval(() => {
    timeLeft--;
    timerValueElem.textContent = timeLeft;
    if (timeLeft <= 0) {
      endSpeedrun();
    }
  }, 1000);

  function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    timerElem.style.display = "none";
  }

  function onEndSpeedrun(finalScore) {
    messageElem.textContent = "Speedrun Over! Score: " + finalScore;
    if (finalScore > speedrunHighScore) {
      speedrunHighScore = finalScore;
      localStorage.setItem('pi_speedrun_highscore', speedrunHighScore);
    }
    updateHighestScoreDisplay("speedrun");
  }

  return cleanup;
}

// --- Add this function before resetGame() ---
function updateHighestScoreDisplay(mode) {
  if (mode === "streak") {
    highestScoreElem.textContent = "Highest Streak: " + highestStreak;
  } else if (mode === "speedrun") {
    highestScoreElem.textContent = "Speedrun High Score: " + speedrunHighScore;
  } else {
    highestScoreElem.textContent = "Highest Score: " + highestScore;
  }
}

// --- Mode Initialization ---
function resetGame() {
  // Reset UI and state
  piSequenceElem.textContent = "3.";
  piInputElem.value = "";
  piInputElem.disabled = false;
  scoreElem.textContent = "Score: 0";
  messageElem.textContent = "";
  restartBtn.style.display = "none";
  progressElem.value = 0;
  hintElem.textContent = "";
  window.showEmoji && window.showEmoji("", emojiFeedbackElem);
  motivationElem.textContent = "";
  motivationElem.style.opacity = 0;
  confettiCanvas.style.display = 'none';

  // Clean up previous mode
  if (modeCleanup) {
    modeCleanup();
    modeCleanup = null;
  }

  // Determine mode and initialize
  const mode = modeSelectElem.value;
  updateHighestScoreDisplay(mode);
  if (window.updateDailyChallengeUI) window.updateDailyChallengeUI();
  if (window.updateWeeklyChallengeUI) window.updateWeeklyChallengeUI();

  if (mode === "normal") {
    modeCleanup = startNormalMode();
    return;
  }
  if (mode === "timed") {
    modeCleanup = startTimedMode();
    return;
  }
  if (mode === "streak") {
    modeCleanup = startStreakMode();
    return;
  }
  if (mode === "speedrun") {
    modeCleanup = startSpeedrunMode();
    return;
  }
}

// --- Event Listeners ---
modeSelectElem.addEventListener('change', resetGame);
restartBtn.addEventListener('click', resetGame);

challengesBtn.addEventListener('click', () => {
  renderChallengesList();
  challengesModal.style.display = "flex";
});
closeChallenges.addEventListener('click', () => {
  challengesModal.style.display = "none";
});
challengesModal.addEventListener('click', function(e) {
  if (e.target === challengesModal) challengesModal.style.display = "none";
});

// Achievements modal logic
achievementsBtn.addEventListener('click', showAchievementsModal);
closeAchievements.addEventListener('click', hideAchievementsModal);
achievementsModal.addEventListener('click', function(e) {
  if (e.target === achievementsModal) hideAchievementsModal();
});
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
triviaBtn.addEventListener('click', showTriviaModal);
closeTrivia.addEventListener('click', hideTriviaModal);
triviaModal.addEventListener('click', function(e) {
  if (e.target === triviaModal) hideTriviaModal();
});
let triviaAskedIndexes = [];
function showTriviaModal() {
  triviaAskedIndexes = [];
  loadTriviaQuestion();
  triviaModal.style.display = "flex";
}
function hideTriviaModal() {
  triviaModal.style.display = "none";
}
function loadTriviaQuestion() {
  const total = window.PI_TRIVIA.length;
  if (triviaAskedIndexes.length === total) {
    triviaAskedIndexes = [];
  }
  const available = [];
  for (let i = 0; i < total; i++) {
    if (!triviaAskedIndexes.includes(i)) available.push(i);
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  const originalTrivia = window.PI_TRIVIA[idx];
  triviaAskedIndexes.push(idx);

  const optionObjs = originalTrivia.options.map((opt, i) => ({
    text: opt,
    isCorrect: i === originalTrivia.answer
  }));
  for (let i = optionObjs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionObjs[i], optionObjs[j]] = [optionObjs[j], optionObjs[i]];
  }
  const shuffledOptions = optionObjs.map(o => o.text);
  const newAnswerIdx = optionObjs.findIndex(o => o.isCorrect);

  const currentTrivia = {
    question: originalTrivia.question,
    options: shuffledOptions,
    answer: newAnswerIdx
  };

  let triviaAnswered = false;
  triviaQuestionElem.textContent = currentTrivia.question;
  triviaFeedbackElem.textContent = "";
  nextTriviaBtn.style.display = "none";
  triviaOptionsElem.innerHTML = "";
  currentTrivia.options.forEach((opt, oidx) => {
    const btn = document.createElement('button');
    btn.className = 'arcade-trivia-option-btn';
    btn.textContent = opt;
    btn.onclick = () => handleTriviaAnswer(oidx, btn, currentTrivia);
    triviaOptionsElem.appendChild(btn);
  });
}
function handleTriviaAnswer(idx, btn, currentTrivia) {
  if (triviaFeedbackElem.textContent) return;
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

// Keyboard shortcuts for navigation and actions
document.addEventListener('keydown', function(e) {
  if (
    document.activeElement.tagName === 'INPUT' ||
    document.querySelector('.arcade-modal[style*="display: flex"]')
  ) return;

  if (e.key === 'r' || e.key === 'R') {
    resetGame();
    e.preventDefault();
  }
  else if (e.key === 'a' || e.key === 'A') {
    showAchievementsModal();
    e.preventDefault();
  }
  else if (e.key === 't' || e.key === 'T') {
    showTriviaModal();
    e.preventDefault();
  }
  else if (e.key === 'c' || e.key === 'C') {
    renderChallengesList();
    challengesModal.style.display = "flex";
    e.preventDefault();
  }
  else if (e.key === 's' || e.key === 'S') {
    if (window.loadSettings) window.loadSettings();
    settingsModal.style.display = "flex";
    e.preventDefault();
  }
  else if (e.key === 'm' || e.key === 'M') {
    const select = modeSelectElem;
    let idx = select.selectedIndex;
    idx = (idx + 1) % select.options.length;
    select.selectedIndex = idx;
    select.dispatchEvent(new Event('change'));
    e.preventDefault();
  }
});

// When the popup is closed/unloaded, clean up
window.addEventListener('beforeunload', () => {
  if (modeCleanup) modeCleanup();
});

// --- Initialize ---
resetGame();
if (window.initSettingsUI) window.initSettingsUI();
if (window.loadSettings) window.loadSettings();
