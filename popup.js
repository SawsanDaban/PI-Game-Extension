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
const arcadePanel = document.querySelector('.arcade-panel');
let dailyChallengeElem = document.getElementById('daily-challenge');
if (!dailyChallengeElem) {
  dailyChallengeElem = document.createElement('div');
  dailyChallengeElem.id = 'daily-challenge';
  dailyChallengeElem.className = 'arcade-daily-challenge';
  arcadePanel.insertBefore(dailyChallengeElem, document.getElementById('pi-sequence'));
}
let weeklyChallengeElem = document.getElementById('weekly-challenge');
if (!weeklyChallengeElem) {
  weeklyChallengeElem = document.createElement('div');
  weeklyChallengeElem.id = 'weekly-challenge';
  weeklyChallengeElem.className = 'arcade-daily-challenge';
  arcadePanel.insertBefore(weeklyChallengeElem, document.getElementById('pi-sequence'));
}

// --- Challenge UI Update ---
window.updateDailyChallengeUI = function() {
  if (!window.getOrCreateDailyChallenge) return;
  const daily = window.getOrCreateDailyChallenge();
  const done = window.isDailyChallengeCompleted && window.isDailyChallengeCompleted();
  dailyChallengeElem.innerHTML = `<strong>Daily Challenge:</strong> Type <span style="color:#ffb347">${daily}</span> digits<br>
    <span style="color:${done ? '#39ff14' : '#ff2fd6'}">${done ? 'Completed!' : 'Not completed'}</span>`;
};

window.updateWeeklyChallengeUI = function() {
  if (!window.getOrCreateWeeklyChallenge) return;
  const weekly = window.getOrCreateWeeklyChallenge();
  const done = window.isWeeklyChallengeCompleted && window.isWeeklyChallengeCompleted();
  weeklyChallengeElem.innerHTML = `<strong>Weekly Challenge:</strong> Type <span style="color:#2fd6ff">${weekly}</span> digits<br>
    <span style="color:${done ? '#39ff14' : '#ff2fd6'}">${done ? 'Completed!' : 'Not completed'}</span>`;
};

// --- Mode Management ---
let modeCleanup = null;
let highestScore = Number(localStorage.getItem('pi_highest_score')) || 0;
let highestStreak = Number(localStorage.getItem('pi_highest_streak')) || 0;
let speedrunHighScore = Number(localStorage.getItem('pi_speedrun_highscore')) || 0;

// --- Hints & Power-ups ---
let hintUses = 0;
let maxHints = 3;
let powerupUses = 0;
let maxPowerups = 2;
let powerupActive = false;

function showHint(currentIndex) {
  const PI_DIGITS = PIModeBase.getPiDigits();
  if (hintUses < maxHints && currentIndex < PI_DIGITS.length) {
    hintElem.textContent = "Hint: Next digit is " + PI_DIGITS[currentIndex];
    hintElem.style.color = "#ffb347";
    hintUses++;
    updateHintPowerupButtons();
    setTimeout(() => {
      hintElem.textContent = "";
      hintElem.style.color = "";
    }, 2000);
  } else if (hintUses >= maxHints) {
    hintElem.textContent = "No hints left!";
    hintElem.style.color = "#ff2fd6";
    setTimeout(() => {
      hintElem.textContent = "";
      hintElem.style.color = "";
    }, 1500);
  }
}

function activatePowerup(currentIndex) {
  if (powerupActive || powerupUses >= maxPowerups) return;
  powerupActive = true;
  powerupUses++;
  updateHintPowerupButtons();
  const PI_DIGITS = PIModeBase.getPiDigits();
  let reveal = "";
  for (let i = 0; i < 3 && currentIndex + i < PI_DIGITS.length; i++) {
    reveal += PI_DIGITS[currentIndex + i];
  }
  hintElem.textContent = "Power-up: Next 3 digits: " + reveal;
  hintElem.style.color = "#2fd6ff";
  setTimeout(() => {
    hintElem.textContent = "";
    hintElem.style.color = "";
    powerupActive = false;
    updateHintPowerupButtons();
  }, 2500);
}

// --- Add hint/power-up buttons to UI only for normal mode ---
function ensureHintButtons() {
  let btnRow = document.getElementById('hint-btn-row');
  if (modeSelectElem.value !== "normal") {
    if (btnRow) btnRow.style.display = "none";
    return;
  }
  if (!btnRow) {
    btnRow = document.createElement('div');
    btnRow.id = 'hint-btn-row';
    btnRow.className = 'arcade-hint-btn-row';
    piInputElem.parentNode.insertBefore(btnRow, piInputElem.nextSibling);
  }
  btnRow.style.display = "flex";
  // Hint button
  let hintBtn = document.getElementById('hint-btn');
  if (!hintBtn) {
    hintBtn = document.createElement('button');
    hintBtn.id = 'hint-btn';
    hintBtn.className = 'arcade-hint-btn';
    btnRow.appendChild(hintBtn);
  }
  // Powerup button
  let powerupBtn = document.getElementById('powerup-btn');
  if (!powerupBtn) {
    powerupBtn = document.createElement('button');
    powerupBtn.id = 'powerup-btn';
    powerupBtn.className = 'arcade-powerup-btn';
    btnRow.appendChild(powerupBtn);
  }
  // Set handlers and update text
  hintBtn.onclick = () => {
    let currentIndex = 0;
    if (modeCleanup && typeof modeCleanup.getCurrentIndex === "function") {
      currentIndex = modeCleanup.getCurrentIndex();
    } else if (window._currentIndex !== undefined) {
      currentIndex = window._currentIndex;
    }
    showHint(currentIndex);
  };
  powerupBtn.onclick = () => {
    let currentIndex = 0;
    if (modeCleanup && typeof modeCleanup.getCurrentIndex === "function") {
      currentIndex = modeCleanup.getCurrentIndex();
    } else if (window._currentIndex !== undefined) {
      currentIndex = window._currentIndex;
    }
    activatePowerup(currentIndex);
  };
  updateHintPowerupButtons();
}

function updateHintPowerupButtons() {
  const hintBtn = document.getElementById('hint-btn');
  const powerupBtn = document.getElementById('powerup-btn');
  if (hintBtn) {
    hintBtn.textContent = `Hint (${Math.max(0, maxHints - hintUses)})`;
    hintBtn.disabled = hintUses >= maxHints;
  }
  if (powerupBtn) {
    powerupBtn.textContent = `Power-up (${Math.max(0, maxPowerups - powerupUses)})`;
    powerupBtn.disabled = powerupUses >= maxPowerups || powerupActive;
  }
}

// --- Patch modeCleanup to expose currentIndex for hints ---
function patchModeCleanupWithIndex(modeObj, getIndexFn) {
  if (typeof modeObj === "function") {
    modeObj.getCurrentIndex = getIndexFn;
  }
}

// --- Mode Initialization ---
function updateHighestScoreDisplay(mode) {
  if (mode === "streak") {
    highestScoreElem.textContent = "Highest Streak: " + highestStreak;
  } else if (mode === "speedrun") {
    highestScoreElem.textContent = "Speedrun High Score: " + speedrunHighScore;
  } else {
    highestScoreElem.textContent = "Highest Score: " + highestScore;
  }
}

function resetGame() {
  // Reset all mode-related state and UI
  hintUses = 0;
  powerupUses = 0;
  powerupActive = false;

  // Stop any running timers/intervals from previous mode
  if (modeCleanup) {
    modeCleanup();
    modeCleanup = null;
  }

  // Reset UI and input
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

  // Hide timer and reset timer value
  timerElem.style.display = "none";
  timerValueElem.textContent = "0";

  // Hide streak countdown
  let streakCountdownElem = document.getElementById('streak-countdown');
  if (streakCountdownElem) {
    streakCountdownElem.style.display = "none";
    streakCountdownElem.textContent = "";
  }

  // Reset hint/powerup buttons
  ensureHintButtons();
  updateHintPowerupButtons();

  // --- Ensure streak countdown element is present and visible for streak mode ---
  if (modeSelectElem.value === "streak") {
    if (!streakCountdownElem) {
      streakCountdownElem = document.createElement('div');
      streakCountdownElem.id = 'streak-countdown';
      streakCountdownElem.className = 'arcade-streak-time';
      scoreElem.parentNode.insertBefore(streakCountdownElem, scoreElem.nextSibling);
    }
    streakCountdownElem.style.display = "";
    streakCountdownElem.textContent = "⏳ 5.0s left";
  } else if (streakCountdownElem) {
    streakCountdownElem.style.display = "none";
    streakCountdownElem.textContent = "";
  }

  const mode = modeSelectElem.value;
  updateHighestScoreDisplay(mode);
  if (window.updateDailyChallengeUI) window.updateDailyChallengeUI();
  if (window.updateWeeklyChallengeUI) window.updateWeeklyChallengeUI();

  if (mode === "normal" && window.PIModeNormal) {
    let currentIndexRef = { value: 0 };
    modeCleanup = window.PIModeNormal({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      onEnd: (finalScore) => {
        messageElem.textContent = "Game Over! Score: " + finalScore;
        if (finalScore > highestScore) {
          highestScore = finalScore;
          localStorage.setItem('pi_highest_score', highestScore);
        }
        updateHighestScoreDisplay("normal");
        restartBtn.style.display = "inline-block";
      },
      _currentIndexRef: currentIndexRef
    });
    patchModeCleanupWithIndex(modeCleanup, () => currentIndexRef.value);
    window._currentIndex = 0;
    return;
  }
  if (mode === "timed" && window.PIModeTimed) {
    let currentIndexRef = { value: 0 };
    modeCleanup = window.PIModeTimed({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      timerElem,
      timerValueElem,
      onEnd: (finalScore, finalTime) => {
        messageElem.textContent = "Game Over! Score: " + finalScore + " | Time: " + (finalTime || 0) + "s";
        if (finalScore > highestScore) {
          highestScore = finalScore;
          localStorage.setItem('pi_highest_score', highestScore);
        }
        updateHighestScoreDisplay("timed");
        restartBtn.style.display = "inline-block";
      },
      _currentIndexRef: currentIndexRef
    });
    patchModeCleanupWithIndex(modeCleanup, () => currentIndexRef.value);
    window._currentIndex = 0;
    return;
  }
  if (mode === "streak" && window.PIModeStreak) {
    let currentIndexRef = { value: 0 };
    modeCleanup = window.PIModeStreak({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      streakCountdownElem: document.getElementById('streak-countdown'),
      onEnd: (finalScore) => {
        messageElem.textContent = "Streak Over! Score: " + finalScore;
        if (finalScore > highestStreak) {
          highestStreak = finalScore;
          localStorage.setItem('pi_highest_streak', highestStreak);
        }
        updateHighestScoreDisplay("streak");
        restartBtn.style.display = "inline-block";
        // Hide countdown after game ends
        const streakElem = document.getElementById('streak-countdown');
        if (streakElem) {
          streakElem.textContent = "";
          streakElem.style.display = "none";
        }
      },
      _currentIndexRef: currentIndexRef
    });
    patchModeCleanupWithIndex(modeCleanup, () => currentIndexRef.value);
    window._currentIndex = 0;
    return;
  }
  if (mode === "speedrun" && window.PIModeSpeedrun) {
    let currentIndexRef = { value: 0 };
    modeCleanup = window.PIModeSpeedrun({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      timerElem,
      timerValueElem,
      onEnd: (finalScore) => {
        messageElem.textContent = "Speedrun Over! Score: " + finalScore;
        if (finalScore > speedrunHighScore) {
          speedrunHighScore = finalScore;
          localStorage.setItem('pi_speedrun_highscore', speedrunHighScore);
        }
        updateHighestScoreDisplay("speedrun");
        restartBtn.style.display = "inline-block";
      },
      _currentIndexRef: currentIndexRef
    });
    patchModeCleanupWithIndex(modeCleanup, () => currentIndexRef.value);
    window._currentIndex = 0;
    return;
  }
}

// --- Challenges List UI ---
window.renderChallengesList = function() {
  const listElem = document.getElementById('challenges-list');
  if (!listElem) return;
  listElem.innerHTML = "";

  // Use a flex column like achievements
  listElem.className = 'arcade-challenges-list';

  const daily = window.getOrCreateDailyChallenge ? window.getOrCreateDailyChallenge() : null;
  const weekly = window.getOrCreateWeeklyChallenge ? window.getOrCreateWeeklyChallenge() : null;
  const dailyDone = window.isDailyChallengeCompleted ? window.isDailyChallengeCompleted() : false;
  const weeklyDone = window.isWeeklyChallengeCompleted ? window.isWeeklyChallengeCompleted() : false;

  if (daily !== null) {
    const dailyDiv = document.createElement('div');
    dailyDiv.className = 'arcade-achievement-row' + (dailyDone ? '' : ' locked');
    dailyDiv.innerHTML = `<span class="arcade-badge">📅</span>
      <span class="arcade-achievement-label"><strong>Daily Challenge:</strong> Type <span style="color:#ffb347">${daily}</span> digits<br>
      <span style="color:${dailyDone ? '#39ff14' : '#ff2fd6'}">${dailyDone ? 'Completed!' : 'Not completed'}</span></span>`;
    listElem.appendChild(dailyDiv);
  }
  if (weekly !== null) {
    const weeklyDiv = document.createElement('div');
    weeklyDiv.className = 'arcade-achievement-row' + (weeklyDone ? '' : ' locked');
    weeklyDiv.innerHTML = `<span class="arcade-badge">📆</span>
      <span class="arcade-achievement-label"><strong>Weekly Challenge:</strong> Type <span style="color:#2fd6ff">${weekly}</span> digits<br>
      <span style="color:${weeklyDone ? '#39ff14' : '#ff2fd6'}">${weeklyDone ? 'Completed!' : 'Not completed'}</span></span>`;
    listElem.appendChild(weeklyDiv);
  }
};

// --- Event Listeners ---
modeSelectElem.addEventListener('change', resetGame);
restartBtn.addEventListener('click', resetGame);

challengesBtn.addEventListener('click', () => {
  if (window.renderChallengesList) window.renderChallengesList();
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
if (window.updateDailyChallengeUI) window.updateDailyChallengeUI();
if (window.updateWeeklyChallengeUI) window.updateWeeklyChallengeUI();
