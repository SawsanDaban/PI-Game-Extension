// Unified achievements list (digit, mode, feature, advanced)
window.PI_ACHIEVEMENTS = [
  { id: 'digits-10', label: '10 Digits', desc: 'Reach 10 digits of PI', badge: '🔟', check: s => s.maxDigits >= 10 },
  { id: 'digits-25', label: '25 Digits', desc: 'Reach 25 digits of PI', badge: '2️⃣5️⃣', check: s => s.maxDigits >= 25 },
  { id: 'digits-50', label: '50 Digits', desc: 'Reach 50 digits of PI', badge: '5️⃣0️⃣', check: s => s.maxDigits >= 50 },
  { id: 'digits-75', label: '75 Digits', desc: 'Reach 75 digits of PI', badge: '7️⃣5️⃣', check: s => s.maxDigits >= 75 },
  { id: 'digits-100', label: '100 Digits', desc: 'Reach 100 digits of PI', badge: '💯', check: s => s.maxDigits >= 100 },
  { id: 'timed-20', label: 'Timed Novice', desc: '20+ in Timed Mode', badge: '⏱️', check: s => s.timed >= 20 },
  { id: 'timed-40', label: 'Timed Pro', desc: '40+ in Timed Mode', badge: '⏱️', check: s => s.timed >= 40 },
  { id: 'streak-10', label: 'Streak Starter', desc: '10+ Streak', badge: '🔥', check: s => s.streak >= 10 },
  { id: 'streak-25', label: 'Streak Master', desc: '25+ Streak', badge: '🔥', check: s => s.streak >= 25 },
  { id: 'speedrun-20', label: 'Speedrunner', desc: '20+ in Speedrun', badge: '⚡', check: s => s.speedrun >= 20 },
  { id: 'speedrun-35', label: 'Speedrun Pro', desc: '35+ in Speedrun', badge: '⚡', check: s => s.speedrun >= 35 },
  { id: 'perfect-game', label: 'Perfect Game', desc: 'Finish a game with no mistakes', badge: '🌟', check: s => s.lastGamePerfect },
  { id: 'used-hint', label: 'Used a Hint', desc: 'Used a Hint', badge: '💡', check: s => s.usedHint },
  { id: 'used-powerup', label: 'Used a Power-up', desc: 'Used a Power-up', badge: '🔋', check: s => s.usedPowerup },
  { id: 'daily-challenge', label: 'Completed Daily Challenge', desc: 'Completed Daily Challenge', badge: '🎯', check: s => s.dailyChallenge },
  { id: 'weekly-challenge', label: 'Completed Weekly Challenge', desc: 'Completed Weekly Challenge', badge: '🏅', check: s => s.weeklyChallenge },
  { id: 'trivia-1', label: 'Answered a Trivia Question', desc: 'Answered a Trivia Question', badge: '❓', check: s => s.answeredTrivia },
  { id: 'trivia-5', label: 'Trivia Buff', desc: 'Answer 5 PI trivia questions correctly', badge: '❓', check: s => s.triviaCorrect >= 5 },
  { id: 'share', label: 'Social Sharer', desc: 'Share your score at least once', badge: '📤', check: s => s.sharedScore }
];

// Achievement state
window.PI_ACHIEVEMENT_STATE = JSON.parse(localStorage.getItem('pi_achievement_state') || '{}');

// Check and unlock achievements
window.checkAchievements = function(stats) {
  let unlocked = [];
  window.PI_ACHIEVEMENTS.forEach(a => {
    if (a.check(stats) && !window.PI_ACHIEVEMENT_STATE[a.id]) {
      window.PI_ACHIEVEMENT_STATE[a.id] = true;
      unlocked.push(a);
    }
  });
  if (unlocked.length) {
    localStorage.setItem('pi_achievement_state', JSON.stringify(window.PI_ACHIEVEMENT_STATE));
    unlocked.forEach(showAchievementNotification);
  }
  return unlocked;
};

// Show achievement notification
function showAchievementNotification(achievement) {
  const notif = document.createElement('div');
  notif.className = 'arcade-achievement-toast';
  notif.innerHTML = `<span class="arcade-badge">${achievement.badge}</span> <strong>${achievement.label}</strong><br><small>${achievement.desc}</small>`;
  notif.style.position = 'fixed';
  notif.style.bottom = '32px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.background = '#23234a';
  notif.style.color = '#39ff14';
  notif.style.padding = '14px 22px';
  notif.style.borderRadius = '12px';
  notif.style.boxShadow = '0 0 18px #39ff14a0, 0 0 18px #ff2fd680';
  notif.style.fontSize = '1em';
  notif.style.zIndex = 9999;
  notif.style.textAlign = 'center';
  notif.style.opacity = 0.98;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3200);
}

// Helper to get scores from localStorage or defaults
function getAllModeScores() {
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

window.getUnlockedAchievements = function() {
  const scores = getAllModeScores();
  return window.PI_ACHIEVEMENTS.filter(a => a.check(scores));
};

window.showAchievement = function(achievement, messageElem) {
  if (!achievement) return;
  messageElem.textContent = `Achievement Unlocked! ${achievement.badge} ${achievement.label}`;
  messageElem.style.color = "#FFD700";
  setTimeout(() => {
    messageElem.textContent = "";
    messageElem.style.color = "#ff2fd6";
  }, 2500);
};
