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
const copyScoreBtn = document.getElementById('copy-score-btn');
const statisticsBtn = document.getElementById('statistics-btn');
const statisticsModal = document.getElementById('statistics-modal');
const closeStatistics = document.getElementById('close-statistics');
const statisticsContent = document.getElementById('statistics-content');
const resetStatsBtn = document.getElementById('reset-stats-btn');
const languageSelect = document.getElementById('language-select');

// Prevent pasting in the digit input
if (piInputElem) {
  piInputElem.addEventListener('paste', e => e.preventDefault());
}

// --- Challenge UI ---
// Use the new class for weekly challenge
const dailyChallengeElem = document.getElementById('daily-challenge');
const weeklyChallengeElem = document.getElementById('weekly-challenge');

// --- Challenge UI Update ---
window.updateDailyChallengeUI = function() {
  if (!window.getOrCreateDailyChallenge) return;
  const daily = window.getOrCreateDailyChallenge();
  const done = window.isDailyChallengeCompleted && window.isDailyChallengeCompleted();
  dailyChallengeElem.innerHTML = `<span style="font-weight:bold;">📅 Daily:</span> <span style="color:#ffb347">${daily}</span> digits<br>
    <span style="color:${done ? '#39ff14' : '#ff2fd6'};font-size:0.93em;">${done ? 'Completed!' : 'Not completed'}</span>`;
};

window.updateWeeklyChallengeUI = function() {
  if (!window.getOrCreateWeeklyChallenge) return;
  const weekly = window.getOrCreateWeeklyChallenge();
  const done = window.isWeeklyChallengeCompleted && window.isWeeklyChallengeCompleted();
  weeklyChallengeElem.innerHTML = `<span style="font-weight:bold;">📆 Weekly:</span> <span style="color:#2fd6ff">${weekly}</span> digits<br>
    <span style="color:${done ? '#39ff14' : '#ff2fd6'};font-size:0.93em;">${done ? 'Completed!' : 'Not completed'}</span>`;
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
    showArcadeMessage(hintElem, "Hint: Next digit is " + PI_DIGITS[currentIndex]);
    hintElem.style.color = "#ffb347";
    hintUses++;
    updateHintPowerupButtons();
    setTimeout(() => {
      showArcadeMessage(hintElem, "");
      hintElem.style.color = "";
    }, 2000);
  } else if (hintUses >= maxHints) {
    showArcadeMessage(hintElem, "No hints left!");
    hintElem.style.color = "#ff2fd6";
    setTimeout(() => {
      showArcadeMessage(hintElem, "");
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
  showArcadeMessage(hintElem, "Power-up: Next 3 digits: " + reveal);
  hintElem.style.color = "#2fd6ff";
  setTimeout(() => {
    showArcadeMessage(hintElem, "");
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

// Utility to show/hide message/hint/motivation with proper spacing
function showArcadeMessage(elem, text) {
  elem.textContent = text || "";
  if (text) {
    elem.style.height = "";
    elem.style.opacity = "1";
    elem.style.marginBottom = "8px";
  } else {
    elem.style.height = "0";
    elem.style.opacity = "0";
    elem.style.marginBottom = "0";
  }
}

// --- Motivation helper ---
function showMotivationText(score) {
  if (window.showMotivation) {
    window.showMotivation(score, motivationElem);
    // Also ensure spacing is correct
    if (motivationElem.textContent) {
      motivationElem.style.height = "";
      motivationElem.style.opacity = "1";
      motivationElem.style.marginBottom = "8px";
    } else if (window.showRandomPIFact) {
      // If no motivation, show a PI fact
      window.showRandomPIFact(motivationElem);
      if (motivationElem.textContent) {
        motivationElem.style.height = "";
        motivationElem.style.opacity = "1";
        motivationElem.style.marginBottom = "8px";
      } else {
        motivationElem.style.height = "0";
        motivationElem.style.opacity = "0";
        motivationElem.style.marginBottom = "0";
      }
    } else {
      motivationElem.style.height = "0";
      motivationElem.style.opacity = "0";
      motivationElem.style.marginBottom = "0";
    }
  } else if (window.showRandomPIFact) {
    window.showRandomPIFact(motivationElem);
    if (motivationElem.textContent) {
      motivationElem.style.height = "";
      motivationElem.style.opacity = "1";
      motivationElem.style.marginBottom = "8px";
    } else {
      motivationElem.style.height = "0";
      motivationElem.style.opacity = "0";
      motivationElem.style.marginBottom = "0";
    }
  } else {
    showArcadeMessage(motivationElem, "");
  }
}
window.showMotivationText = showMotivationText;

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
  showArcadeMessage(messageElem, "");
  restartBtn.style.display = "none";
  progressElem.value = 0;
  showArcadeMessage(hintElem, "");
  showArcadeMessage(motivationElem, "");
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

  function checkAndMarkChallenges(finalScore) {
    // Daily Challenge
    const dailyTarget = window.getOrCreateDailyChallenge ? window.getOrCreateDailyChallenge() : null;
    if (dailyTarget && finalScore >= dailyTarget && !window.isDailyChallengeCompleted()) {
      window.markDailyChallengeCompleted();
      if (window.checkChallengeAchievements) window.checkChallengeAchievements();
    }
    // Weekly Challenge
    const weeklyTarget = window.getOrCreateWeeklyChallenge ? window.getOrCreateWeeklyChallenge() : null;
    if (weeklyTarget && finalScore >= weeklyTarget && !window.isWeeklyChallengeCompleted()) {
      window.markWeeklyChallengeCompleted();
      if (window.checkChallengeAchievements) window.checkChallengeAchievements();
    }
  }

  if (mode === "normal" && window.PIModeNormal) {
    let currentIndexRef = { value: 0 };
    modeCleanup = window.PIModeNormal({
      piInputElem,
      piSequenceElem,
      scoreElem,
      progressElem,
      onEnd: patchGameOverForLeaderboard((finalScore) => {
        showArcadeMessage(messageElem, "Game Over! Score: " + finalScore);
        if (finalScore > highestScore) {
          highestScore = finalScore;
          localStorage.setItem('pi_highest_score', highestScore);
        }
        updateHighestScoreDisplay("normal");
        restartBtn.style.display = "inline-block";
        // Check daily/weekly challenge completion and achievements
        checkAndMarkChallenges(finalScore);
        // Show a PI fact if no motivation message
        if (window.showRandomPIFact && !motivationElem.textContent) window.showRandomPIFact(motivationElem);
      }),
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
      onEnd: patchGameOverForLeaderboard((finalScore, finalTime) => {
        showArcadeMessage(messageElem, "Game Over! Score: " + finalScore + " | Time: " + (finalTime || 0) + "s");
        if (finalScore > highestScore) {
          highestScore = finalScore;
          localStorage.setItem('pi_highest_score', highestScore);
        }
        updateHighestScoreDisplay("timed");
        restartBtn.style.display = "inline-block";
        checkAndMarkChallenges(finalScore);
        if (window.showRandomPIFact && !motivationElem.textContent) window.showRandomPIFact(motivationElem);
      }),
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
      onEnd: patchGameOverForLeaderboard((finalScore) => {
        showArcadeMessage(messageElem, "Streak Over! Score: " + finalScore);
        if (finalScore > highestStreak) {
          highestStreak = finalScore;
          localStorage.setItem('pi_highest_streak', highestStreak);
        }
        updateHighestScoreDisplay("streak");
        restartBtn.style.display = "inline-block";
        const streakElem = document.getElementById('streak-countdown');
        if (streakElem) {
          streakElem.textContent = "";
          streakElem.style.display = "none";
        }
        checkAndMarkChallenges(finalScore);
        if (window.showRandomPIFact && !motivationElem.textContent) window.showRandomPIFact(motivationElem);
      }),
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
      onEnd: patchGameOverForLeaderboard((finalScore) => {
        showArcadeMessage(messageElem, "Speedrun Over! Score: " + finalScore);
        if (finalScore > speedrunHighScore) {
          speedrunHighScore = finalScore;
          localStorage.setItem('pi_speedrun_highscore', speedrunHighScore);
        }
        updateHighestScoreDisplay("speedrun");
        restartBtn.style.display = "inline-block";
        checkAndMarkChallenges(finalScore);
        if (window.showRandomPIFact && !motivationElem.textContent) window.showRandomPIFact(motivationElem);
      }),
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

// --- Theme switching logic (add to settings.js or here if not present) ---
const themeSelectElem = document.getElementById('theme-select');
function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light');
  if (theme === 'dark') document.body.classList.add('theme-dark');
  else if (theme === 'light') document.body.classList.add('theme-light');
  // Save theme
  localStorage.setItem('pi_theme', theme);
}

// --- FIX: Always use saved theme and keep select in sync ---
if (themeSelectElem) {
  // Add light theme option if not present
  if (!Array.from(themeSelectElem.options).some(opt => opt.value === 'light')) {
    const opt = document.createElement('option');
    opt.value = 'light';
    opt.textContent = 'Light';
    themeSelectElem.appendChild(opt);
  }
  // Only use saved theme if valid, fallback to 'neon' if not set or invalid
  let savedTheme = localStorage.getItem('pi_theme');
  const validThemes = Array.from(themeSelectElem.options).map(opt => opt.value);
  if (!savedTheme || !validThemes.includes(savedTheme)) {
    savedTheme = themeSelectElem.options[0].value;
    localStorage.setItem('pi_theme', savedTheme);
  }
  // Always set select and apply theme on popup open
  themeSelectElem.value = savedTheme;
  applyTheme(savedTheme);

  // Listen for changes and save/apply immediately
  themeSelectElem.addEventListener('change', () => {
    const selected = themeSelectElem.value;
    applyTheme(selected);
    localStorage.setItem('pi_theme', selected);
  });

  // Always re-sync select value and theme when settings modal is opened
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      const saved = localStorage.getItem('pi_theme');
      if (saved && validThemes.includes(saved)) {
        themeSelectElem.value = saved;
        applyTheme(saved);
      }
    });
  }
} else {
  // fallback: apply saved theme on load
  const savedTheme = localStorage.getItem('pi_theme');
  if (savedTheme) applyTheme(savedTheme);
}

// --- Localization logic ---
// Use window.PI_TRANSLATIONS from js/i18n.js
function setLanguage(lang) {
  localStorage.setItem('pi_language', lang);
  // Set <html lang="..."> and dir for RTL languages
  document.documentElement.setAttribute('lang', lang);
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  applyTranslations(lang);
}

function applyTranslations(lang) {
  const dict = (window.PI_TRANSLATIONS && window.PI_TRANSLATIONS[lang]) || (window.PI_TRANSLATIONS && window.PI_TRANSLATIONS['en']) || {};

  // Translate elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (dict[key]) elem.textContent = dict[key];
  });

  // Translate static labels and buttons (by id/class or label text)
  // Mode select options
  const modeSelect = document.getElementById('mode-select');
  if (modeSelect) {
    const modeMap = [
      { value: 'normal', key: 'modeNormal' },
      { value: 'timed', key: 'modeTimed' },
      { value: 'streak', key: 'modeStreak' },
      { value: 'speedrun', key: 'modeSpeedrun' }
    ];
    modeMap.forEach(({ value, key }) => {
      const opt = modeSelect.querySelector(`option[value="${value}"]`);
      if (opt && dict[key]) opt.textContent = dict[key];
    });
  }

  // Settings modal
  const settingSound = document.querySelector('label[for="setting-sound"] span, #setting-sound + span');
  if (settingSound && dict.soundLabel) settingSound.textContent = dict.soundLabel;
  const settingAnimations = document.querySelector('label[for="setting-animations"] span, #setting-animations + span');
  if (settingAnimations && dict.animationsLabel) settingAnimations.textContent = dict.animationsLabel;
  const settingLeaderboard = document.querySelector('label[for="setting-leaderboard"] span, #setting-leaderboard + span');
  if (settingLeaderboard && dict.leaderboardLabel) settingLeaderboard.textContent = dict.leaderboardLabel;
  const themeLabel = document.querySelector('label.arcade-settings-row > span:not([data-i18n]):not(:has(select))');
  if (themeLabel && dict.themeLabel) themeLabel.textContent = dict.themeLabel;

  // Theme select options
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    const themeMap = [
      { value: 'neon', key: 'themeNeon', fallback: 'Neon' },
      { value: 'dark', key: 'themeDark', fallback: 'Dark' },
      { value: 'light', key: 'themeLight', fallback: 'Light' }
    ];
    // Fix: Only call forEach if themeMap is an array and themeSelect.options exists and is iterable
    if (Array.isArray(themeMap) && themeSelect && typeof themeSelect.querySelector === 'function') {
      themeMap.forEach(({ value, key, fallback }) => {
        const opt = themeSelect.querySelector(`option[value="${value}"]`);
        if (opt) opt.textContent = dict[key] || fallback;
      });
    }
  }

  // Buttons
  const btnMap = [
    { id: 'restart-btn', key: 'restart' },
    { id: 'achievements-btn', key: 'achievements' },
    { id: 'trivia-btn', key: 'piTrivia' },
    { id: 'settings-btn', key: 'settings' },
    { id: 'challenges-btn', key: 'viewChallenges' },
    { id: 'leaderboard-btn', key: 'leaderboard' },
    { id: 'statistics-btn', key: 'statistics' },
    { id: 'share-btn', key: 'shareScore' },
    { id: 'copy-score-btn', key: 'copyScoreText' },
    { id: 'reset-stats-btn', key: 'resetStatistics' },
    { id: 'export-data-btn', key: 'exportData' },
    { id: 'import-data-btn', key: 'importData' },
    { id: 'next-trivia-btn', key: 'nextQuestion' }
  ];
  btnMap.forEach(({ id, key }) => {
    const btn = document.getElementById(id);
    if (btn && dict[key]) btn.textContent = dict[key];
  });

  // Modal titles
  const modalTitleMap = [
    { id: 'settings-title', key: 'settingsTitle' },
    { id: 'achievements-title', key: 'achievementsTitle' },
    { id: 'statistics-title', key: 'statisticsTitle' }
  ];
  modalTitleMap.forEach(({ id, key }) => {
    const elem = document.getElementById(id);
    if (elem && dict[key]) elem.textContent = dict[key];
  });

  // Labels
  const modeLabel = document.querySelector('label[for="mode-select"]');
  if (modeLabel && dict.modeLabel) modeLabel.textContent = dict.modeLabel;
  const piLabel = document.querySelector('label[for="pi-input"]');
  if (piLabel && dict.enterPiDigits) piLabel.textContent = dict.enterPiDigits;

  // Input placeholder
  const piInputElem = document.getElementById('pi-input');
  if (piInputElem && dict.typeNextDigits) {
    piInputElem.placeholder = dict.typeNextDigits;
  }

  // Score and highscore
  if (scoreElem && dict.score) scoreElem.textContent = dict.score + " 0";
  if (highestScoreElem) {
    // This will be overwritten by updateHighestScoreDisplay, but set default
    if (dict.highestScore) highestScoreElem.textContent = dict.highestScore;
  }

  // Modal section headers (if any)
  // ...add more as needed...

  // Keyboard shortcuts section
  const shortcutsLabel = document.querySelector('.arcade-settings-row span[style*="font-weight:bold"]');
  if (shortcutsLabel && dict.keyboardShortcuts) shortcutsLabel.textContent = dict.keyboardShortcuts;

  // Optionally: translate challenge/trivia/achievement modal content dynamically if needed
}

// On language change
if (languageSelect) {
  languageSelect.value = localStorage.getItem('pi_language') || 'en';
  // Set lang and dir on load
  setLanguage(languageSelect.value);
  languageSelect.addEventListener('change', () => {
    setLanguage(languageSelect.value);
  });
} else {
  // fallback: apply saved language on load
  const lang = localStorage.getItem('pi_language') || 'en';
  setLanguage(lang);
}

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
  // Use window.getUnlockedAchievements to get unlocked achievements
  const unlocked = window.getUnlockedAchievements();
  achievementsList.innerHTML = "";
  window.PI_ACHIEVEMENTS.forEach(a => {
    const unlockedBadge = unlocked.some(u => u.id === a.id);
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
  return `🎮 PI Game: I scored ${highestScore} digits!${badges ? ' 🏅 ' + badges : ''}\nTry it: https://github.com/SawsanDaban/PI-Game-Extension`;
}
shareBtn.addEventListener('click', async () => {
  const msg = getShareMessage();
  // Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({
        title: "PI Game Score",
        text: msg,
        url: "https://github.com/SawsanDaban/PI-Game-Extension"
      });
      shareBtn.textContent = 'Shared!';
      setTimeout(() => {
        shareBtn.textContent = 'Share Score';
      }, 1500);
      // Mark achievement for sharing
      localStorage.setItem('pi_shared_score', '1');
      return;
    } catch (e) {
      // fallback to clipboard
    }
  }
  // Fallback: copy to clipboard
  navigator.clipboard.writeText(msg).then(() => {
    shareBtn.textContent = 'Copied!';
    setTimeout(() => {
      shareBtn.textContent = 'Share Score';
    }, 1500);
    localStorage.setItem('pi_shared_score', '1');
  });
});

if (copyScoreBtn) {
  copyScoreBtn.onclick = function() {
    const msg = getShareMessage();
    navigator.clipboard.writeText(msg).then(() => {
      copyScoreBtn.textContent = "Copied!";
      setTimeout(() => {
        copyScoreBtn.textContent = "Copy Score Text";
      }, 1200);
    });
  };
}

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

// Statistics modal logic
function getStats() {
  return {
    maxDigits: Number(localStorage.getItem('pi_highest_score')) || 0,
    timed: Number(localStorage.getItem('pi_highest_score_timed')) || 0,
    streak: Number(localStorage.getItem('pi_highest_streak')) || 0,
    speedrun: Number(localStorage.getItem('pi_speedrun_highscore')) || 0,
    lastGamePerfect: !!localStorage.getItem('pi_last_game_perfect'),
    usedHint: !!localStorage.getItem('pi_used_hint'),
    usedPowerup: !!localStorage.getItem('pi_used_powerup'),
    dailyChallenge: !!localStorage.getItem('pi_daily_challenge_completed'),
    weeklyChallenge: !!localStorage.getItem('pi_weekly_challenge_completed'),
    answeredTrivia: !!localStorage.getItem('pi_answered_trivia'),
    triviaCorrect: Number(localStorage.getItem('pi_trivia_correct')) || 0,
    sharedScore: !!localStorage.getItem('pi_shared_score')
  };
}

function getAchievementsCount() {
  if (window.PI_ACHIEVEMENTS && window.PI_ACHIEVEMENT_STATE) {
    return Object.values(window.PI_ACHIEVEMENT_STATE).filter(Boolean).length + " / " + window.PI_ACHIEVEMENTS.length;
  }
  return "";
}

function renderStatistics() {
  const stats = getStats();
  statisticsContent.innerHTML = `
    <ul style="list-style:none;padding:0;">
      <li><strong>Best Digits (Normal):</strong> ${stats.maxDigits}</li>
      <li><strong>Best Timed:</strong> ${stats.timed}</li>
      <li><strong>Best Streak:</strong> ${stats.streak}</li>
      <li><strong>Best Speedrun:</strong> ${stats.speedrun}</li>
      <li><strong>Perfect Game:</strong> ${stats.lastGamePerfect ? 'Yes' : 'No'}</li>
      <li><strong>Hints Used:</strong> ${stats.usedHint ? 'Yes' : 'No'}</li>
      <li><strong>Powerups Used:</strong> ${stats.usedPowerup ? 'Yes' : 'No'}</li>
      <li><strong>Daily Challenge Completed:</strong> ${stats.dailyChallenge ? 'Yes' : 'No'}</li>
      <li><strong>Weekly Challenge Completed:</strong> ${stats.weeklyChallenge ? 'Yes' : 'No'}</li>
      <li><strong>Trivia Answered:</strong> ${stats.answeredTrivia ? 'Yes' : 'No'}</li>
      <li><strong>Trivia Correct:</strong> ${stats.triviaCorrect}</li>
      <li><strong>Score Shared:</strong> ${stats.sharedScore ? 'Yes' : 'No'}</li>
      <li><strong>Achievements Unlocked:</strong> ${getAchievementsCount()}</li>
    </ul>
  `;
}

if (statisticsBtn && statisticsModal) {
  statisticsBtn.addEventListener('click', () => {
    renderStatistics();
    statisticsModal.style.display = "flex";
    statisticsModal.focus();
  });
}
if (closeStatistics && statisticsModal) {
  closeStatistics.addEventListener('click', () => {
    statisticsModal.style.display = "none";
    statisticsBtn && statisticsBtn.focus();
  });
  statisticsModal.addEventListener('click', function(e) {
    if (e.target === statisticsModal) {
      statisticsModal.style.display = "none";
      statisticsBtn && statisticsBtn.focus();
    }
  });
  statisticsModal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      statisticsModal.style.display = "none";
      statisticsBtn && statisticsBtn.focus();
    }
  });
}
if (resetStatsBtn) {
  resetStatsBtn.addEventListener('click', () => {
    if (confirm('Reset all your statistics and achievements? This cannot be undone.')) {
      // Clear relevant localStorage keys
      [
        'pi_highest_score',
        'pi_highest_score_timed',
        'pi_highest_streak',
        'pi_speedrun_highscore',
        'pi_last_game_perfect',
        'pi_used_hint',
        'pi_used_powerup',
        'pi_daily_challenge_completed',
        'pi_weekly_challenge_completed',
        'pi_answered_trivia',
        'pi_trivia_correct',
        'pi_shared_score',
        'pi_achievement_state'
      ].forEach(k => localStorage.removeItem(k));
      if (window.PI_ACHIEVEMENT_STATE) {
        Object.keys(window.PI_ACHIEVEMENT_STATE).forEach(k => delete window.PI_ACHIEVEMENT_STATE[k]);
      }
      renderStatistics();
      alert('Statistics and achievements reset!');
    }
  });
}

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

// --- Leaderboard logic (API-based, streak mode only for upload) ---
const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardModal = document.getElementById('leaderboard-modal');
const closeLeaderboard = document.getElementById('close-leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

// Patch game over to maybe add to leaderboard (only for streak mode)
function patchGameOverForLeaderboard(origOnEnd) {
  return function(finalScore, ...args) {
    const mode = modeSelectElem.value;
    // Ensure settings are loaded before checking
    if (typeof window.loadSettings === "function") window.loadSettings();
    if (mode === "streak") {
      window.submitStreakScoreToLeaderboard(finalScore);
    }
    origOnEnd(finalScore, ...args);
  };
}

// Show leaderboard modal
if (leaderboardBtn && leaderboardModal) {
  leaderboardBtn.addEventListener('click', () => {
    window.renderLeaderboard(leaderboardList);
    leaderboardModal.style.display = "flex";
  });
}
if (closeLeaderboard && leaderboardModal) {
  closeLeaderboard.addEventListener('click', () => {
    leaderboardModal.style.display = "none";
  });
  leaderboardModal.addEventListener('click', function(e) {
    if (e.target === leaderboardModal) leaderboardModal.style.display = "none";
  });
}

// --- Export/Import Data ---
const exportDataBtn = document.getElementById('export-data-btn');
const importDataBtn = document.getElementById('import-data-btn');
const importDataFile = document.getElementById('import-data-file');

// Keys to backup/restore
const BACKUP_KEYS = [
  'pi_highest_score',
  'pi_highest_score_timed',
  'pi_highest_streak',
  'pi_speedrun_highscore',
  'pi_last_game_perfect',
  'pi_used_hint',
  'pi_used_powerup',
  'pi_daily_challenge_completed',
  'pi_weekly_challenge_completed',
  'pi_answered_trivia',
  'pi_trivia_correct',
  'pi_shared_score',
  'pi_achievement_state',
  'pi_settings',
  'pi_theme'
];

// Export data as JSON file
if (exportDataBtn) {
  exportDataBtn.addEventListener('click', () => {
    const data = {};
    BACKUP_KEYS.forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pi-game-backup.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });
}

// Import data from JSON file
if (importDataBtn && importDataFile) {
  importDataBtn.addEventListener('click', () => {
    importDataFile.value = '';
    importDataFile.click();
  });
  importDataFile.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        let imported = 0;
        BACKUP_KEYS.forEach(k => {
          if (data[k] !== undefined) {
            localStorage.setItem(k, data[k]);
            imported++;
          }
        });
        alert(`Imported ${imported} items. Please reload the extension to see changes.`);
      } catch (err) {
        alert('Failed to import data: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
}

// --- Initialize ---
resetGame();
if (window.initSettingsUI) window.initSettingsUI();
if (window.loadSettings) window.loadSettings();
if (window.updateDailyChallengeUI) window.updateDailyChallengeUI();
if (window.updateWeeklyChallengeUI) window.updateWeeklyChallengeUI();
