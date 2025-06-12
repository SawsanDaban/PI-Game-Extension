// First 100 digits of PI (excluding "3.")
const PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

const STREAK_IDLE_LIMIT = 5; // seconds for streak mode
let currentIndex = 0;
let score = 0;
let gameOver = false;
let highestScore = Number(localStorage.getItem('pi_highest_score')) || 0;
let highestStreak = Number(localStorage.getItem('pi_highest_streak')) || 0;
let streakMode = false;
let streakCountdown = STREAK_IDLE_LIMIT;
let streakCountdownInterval = null;

let modeCleanup = null;
let speedrunCleanup = null;
let speedrunMode = false;
let speedrunHighScore = Number(localStorage.getItem('pi_speedrun_highscore')) || 0;

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

function renderChallengesList() {
  const daily = window.getOrCreateDailyChallenge();
  const dailyDone = window.isDailyChallengeCompleted();
  const weekly = window.getOrCreateWeeklyChallenge();
  const weeklyDone = window.isWeeklyChallengeCompleted();
  challengesList.innerHTML = `
    <div>
      <b>Daily Challenge:</b> Reach <b>${daily}</b> digits today.<br>
      Status: ${dailyDone ? '<span style="color:#39ff14;">Completed</span>' : '<span style="color:#ffb347;">Incomplete</span>'}
    </div>
    <div>
      <b>Weekly Challenge:</b> Reach <b>${weekly}</b> digits this week.<br>
      Status: ${weeklyDone ? '<span style="color:#39ff14;">Completed</span>' : '<span style="color:#2fd6ff;">Incomplete</span>'}
    </div>
  `;
}

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

let timer = null;
let timeElapsed = 0;
let timedMode = false;
let lastScoreForAchievement = 0;

let currentTrivia = null;
let triviaAnswered = false;
let triviaAskedIndexes = []; // Track asked questions in this session

let idleTimeout = null;
const IDLE_LIMIT = 5000; // 5 seconds

function resetIdleTimer() {
  if (idleTimeout) clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    if (!gameOver && piInputElem.value.length > 0) {
      gameOver = true;
      messageElem.textContent = "⏰ Time's up! You were idle for 5 seconds.";
      piInputElem.disabled = true;
      restartBtn.style.display = "inline-block";
      window.showEmoji("wrong", emojiFeedbackElem);
      hintElem.textContent = `The next digit was: ${PI_DIGITS[currentIndex]}`;
      currentStreak = 0;
      streakTime = 0;
      streakStartTime = null;
      stopStreakTimer();
      updateStreakUI();
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
    }
  }, IDLE_LIMIT);
}

function clearIdleTimer() {
  if (idleTimeout) {
    clearTimeout(idleTimeout);
    idleTimeout = null;
  }
}

// Add daily challenge UI
const dailyChallengeElem = document.createElement('div');
dailyChallengeElem.id = 'daily-challenge';
dailyChallengeElem.className = 'arcade-daily-challenge';
document.querySelector('.arcade-panel').insertBefore(dailyChallengeElem, document.getElementById('pi-sequence'));

// Add weekly challenge UI
const weeklyChallengeElem = document.createElement('div');
weeklyChallengeElem.id = 'weekly-challenge';
weeklyChallengeElem.className = 'arcade-daily-challenge';
document.querySelector('.arcade-panel').insertBefore(weeklyChallengeElem, document.getElementById('pi-sequence'));

function updateWeeklyChallengeUI() {
  const challenge = window.getOrCreateWeeklyChallenge();
  const completed = window.isWeeklyChallengeCompleted();
  weeklyChallengeElem.innerHTML = completed
    ? `🌟 <b>Weekly Challenge:</b> ${challenge} digits <span style="color:#39ff14;">(Completed!)</span>`
    : `📅 <b>Weekly Challenge:</b> Reach <b>${challenge}</b> digits this week!`;
}

// Add streak UI element (move creation below .arcade-panel for conditional display)
const streakElem = document.createElement('div');
streakElem.id = 'streak';
streakElem.className = 'arcade-streak';
streakElem.textContent = "Streak: 0";

const streakTimeElem = document.createElement('div');
streakTimeElem.id = 'streak-time';
streakTimeElem.className = 'arcade-streak-time';
streakTimeElem.textContent = "Streak Time: 0.0s";

const streakCountdownElem = document.createElement('div');
streakCountdownElem.id = 'streak-countdown';
streakCountdownElem.className = 'arcade-streak-time';
streakCountdownElem.textContent = "";

function showStreakUI(show) {
  if (show) {
    if (!streakElem.parentNode) document.querySelector('.arcade-panel').insertBefore(streakElem, document.getElementById('score'));
    if (!streakTimeElem.parentNode) document.querySelector('.arcade-panel').insertBefore(streakTimeElem, document.getElementById('score'));
    if (!streakCountdownElem.parentNode) document.querySelector('.arcade-panel').insertBefore(streakCountdownElem, document.getElementById('score'));
    streakElem.style.display = '';
    streakTimeElem.style.display = '';
    streakCountdownElem.style.display = '';
  } else {
    streakElem.style.display = 'none';
    streakTimeElem.style.display = 'none';
    streakCountdownElem.style.display = 'none';
  }
}

let currentStreak = 0;
let streakStartTime = null;
let streakTime = 0;
let streakTimerInterval = null;

function updateStreakUI() {
  streakElem.textContent = "Streak: " + currentStreak;
  streakTimeElem.textContent = "Streak Time: " + streakTime.toFixed(1) + "s";
  if (streakMode) {
    streakCountdownElem.textContent = "⏳ " + streakCountdown.toFixed(1) + "s left";
  } else {
    streakCountdownElem.textContent = "";
  }
}

function startStreakTimer() {
  streakStartTime = Date.now();
  streakTime = 0;
  if (streakTimerInterval) clearInterval(streakTimerInterval);
  streakTimerInterval = setInterval(() => {
    streakTime = (Date.now() - streakStartTime) / 1000;
    streakTimeElem.textContent = "Streak Time: " + streakTime.toFixed(1) + "s";
  }, 100);
}

function stopStreakTimer() {
  if (streakTimerInterval) {
    clearInterval(streakTimerInterval);
    streakTimerInterval = null;
  }
}

// --- Streak mode countdown logic ---
function startStreakCountdown() {
  streakCountdown = STREAK_IDLE_LIMIT;
  updateStreakUI();
  if (streakCountdownInterval) clearInterval(streakCountdownInterval);
  streakCountdownInterval = setInterval(() => {
    streakCountdown -= 0.1;
    if (streakCountdown <= 0) {
      streakCountdown = 0; // Clamp to zero so it doesn't go negative
      updateStreakUI();
      clearInterval(streakCountdownInterval);
      streakCountdownInterval = null;
      // End game due to timeout
      if (!gameOver) {
        gameOver = true;
        messageElem.textContent = "⏰ Time's up! You didn't type in time.";
        piInputElem.disabled = true;
        restartBtn.style.display = "inline-block";
        window.showEmoji("wrong", emojiFeedbackElem);
        hintElem.textContent = `The next digit was: ${PI_DIGITS[currentIndex]}`;
        currentStreak = 0;
        streakTime = 0;
        streakStartTime = null;
        stopStreakTimer();
        updateStreakUI();
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
      }
    } else {
      updateStreakUI();
    }
  }, 100);
}

function stopStreakCountdown() {
  if (streakCountdownInterval) {
    clearInterval(streakCountdownInterval);
    streakCountdownInterval = null;
  }
}

function updateHighestScoreDisplay() {
  if (speedrunMode) {
    updateSpeedrunHighScoreDisplay();
  } else if (streakMode) {
    highestScoreElem.textContent = "Highest Streak: " + highestStreak;
  } else {
    highestScoreElem.textContent = "Highest Score: " + highestScore;
  }
}

function updateSpeedrunHighScoreDisplay() {
  highestScoreElem.textContent = "Speedrun High Score: " + speedrunHighScore;
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
  currentStreak = 0;
  streakTime = 0;
  streakStartTime = null;
  stopStreakTimer();
  stopStreakCountdown();
  clearIdleTimer();
  piSequenceElem.textContent = "3.";
  piInputElem.value = "";
  piInputElem.disabled = false;
  scoreElem.textContent = "Score: 0";
  scoreElem.style.display = streakMode ? "none" : "";
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
  if (modeCleanup) {
    modeCleanup();
    modeCleanup = null;
  }
  const mode = modeSelectElem.value;
  if (mode === "normal" && window.PIModeNormal) {
    modeCleanup = window.PIModeNormal({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      onEnd: (score) => {
        messageElem.textContent = "Game Over! Score: " + score;
        if (score > highestScore) {
          highestScore = score;
          localStorage.setItem('pi_highest_score', highestScore);
        }
        updateHighestScoreDisplay();
      }
    });
    return;
  }
  if (mode === "timed" && window.PIModeTimed) {
    modeCleanup = window.PIModeTimed({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      timerElem,
      timerValueElem,
      onEnd: (score) => {
        messageElem.textContent = "Timed Over! Score: " + score;
        if (score > highestScore) {
          highestScore = score;
          localStorage.setItem('pi_highest_score', highestScore);
        }
        updateHighestScoreDisplay();
      }
    });
    return;
  }
  if (mode === "streak" && window.PIModeStreak) {
    modeCleanup = window.PIModeStreak({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      streakCountdownElem: document.getElementById('streak-countdown'),
      onEnd: (score) => {
        messageElem.textContent = "Streak Over! Score: " + score;
        if (score > highestStreak) {
          highestStreak = score;
          localStorage.setItem('pi_highest_streak', highestStreak);
        }
        updateHighestScoreDisplay();
      }
    });
    return;
  }
  if (mode === "speedrun" && window.PIModeSpeedrun) {
    modeCleanup = window.PIModeSpeedrun({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      timerElem,
      timerValueElem,
      onEnd: (score) => {
        messageElem.textContent = "Speedrun Over! Score: " + score;
        if (score > speedrunHighScore) {
          speedrunHighScore = score;
          localStorage.setItem('pi_speedrun_highscore', speedrunHighScore);
        }
        updateSpeedrunHighScoreDisplay();
      }
    });
    return;
  }
  showStreakUI(streakMode);
  piInputElem.focus();
  updateHighestScoreDisplay();
  updateDailyChallengeUI();
  updateStreakUI();
}

function handleInput() {
  if (gameOver) return;
  if (streakMode) {
    stopStreakCountdown();
    startStreakCountdown();
  } else {
    resetIdleTimer();
  }
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
    if (streakMode) stopStreakCountdown();
    else clearIdleTimer();
    gameOver = true;
    messageElem.textContent = "Wrong digit! Game over.";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    window.showEmoji("wrong", emojiFeedbackElem);
    hintElem.textContent = `The next digit was: ${PI_DIGITS[currentIndex]}`;
    if (streakMode) {
      if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
        localStorage.setItem('pi_highest_streak', highestStreak);
      }
    } else {
      if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('pi_highest_score', highestScore);
      }
    }
    updateHighestScoreDisplay();
    currentStreak = 0;
    streakTime = 0;
    streakStartTime = null;
    stopStreakTimer();
    updateStreakUI();
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
  if (!streakMode) {
    scoreElem.textContent = "Score: " + (currentIndex + input.length);
  }
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
    if (streakMode) stopStreakCountdown();
    else clearIdleTimer();
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
    stopStreakTimer();
    if (streakMode) {
      if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
        localStorage.setItem('pi_highest_streak', highestStreak);
      }
    } else {
      if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('pi_highest_score', highestScore);
      }
    }
    updateHighestScoreDisplay();
    setTimeout(() => window.showRandomPIFact(motivationElem), 2000);
    lastScoreForAchievement = 0;
    return;
  }
  if (input.length > 0) {
    // If starting a new streak, start timer
    if (currentStreak === 0) {
      startStreakTimer();
      if (streakMode) startStreakCountdown();
    }
    currentStreak += input.length;
    updateStreakUI();
    score = newScore;
    if (streakMode) {
      if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
        localStorage.setItem('pi_highest_streak', highestStreak);
        updateHighestScoreDisplay();
      }
    } else {
      if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('pi_highest_score', highestScore);
        updateHighestScoreDisplay();
      }
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
  streakMode = modeSelectElem.value === 'streak';
  speedrunMode = modeSelectElem.value === 'speedrun';
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
  const originalTrivia = window.PI_TRIVIA[idx];
  triviaAskedIndexes.push(idx);

  // Shuffle options and track the new answer index
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

  // Store the shuffled trivia for this round
  currentTrivia = {
    question: originalTrivia.question,
    options: shuffledOptions,
    answer: newAnswerIdx
  };

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

// Keyboard shortcuts for navigation and actions
document.addEventListener('keydown', function(e) {
  // Only trigger if popup is focused and not inside an input/modal
  if (
    document.activeElement.tagName === 'INPUT' ||
    document.querySelector('.arcade-modal[style*="display: flex"]')
  ) return;

  // R: Restart game
  if (e.key === 'r' || e.key === 'R') {
    resetGame();
    e.preventDefault();
  }
  // A: Open Achievements
  else if (e.key === 'a' || e.key === 'A') {
    showAchievementsModal();
    e.preventDefault();
  }
  // T: Open Trivia
  else if (e.key === 't' || e.key === 'T') {
    showTriviaModal();
    e.preventDefault();
  }
  // C: Open Challenges
  else if (e.key === 'c' || e.key === 'C') {
    renderChallengesList();
    challengesModal.style.display = "flex";
    e.preventDefault();
  }
  // S: Open Settings
  else if (e.key === 's' || e.key === 'S') {
    if (window.loadSettings) window.loadSettings();
    settingsModal.style.display = "flex";
    e.preventDefault();
  }
  // M: Switch mode (cycles through modes)
  else if (e.key === 'm' || e.key === 'M') {
    const select = modeSelectElem;
    let idx = select.selectedIndex;
    idx = (idx + 1) % select.options.length;
    select.selectedIndex = idx;
    select.dispatchEvent(new Event('change'));
    e.preventDefault();
  }
});

// When the popup is closed/unloaded, clear the idle timer
window.addEventListener('beforeunload', () => {
  clearIdleTimer();
  stopStreakCountdown();
});

timedMode = modeSelectElem.value === 'timed';
streakMode = modeSelectElem.value === 'streak';
resetGame();
if (window.initSettingsUI) window.initSettingsUI();
if (window.loadSettings) window.loadSettings();
