window.ACHIEVEMENTS = [
  { digits: 10, badge: "🥉", label: "Bronze: 10 Digits" },
  { digits: 25, badge: "🥈", label: "Silver: 25 Digits" },
  { digits: 50, badge: "🥇", label: "Gold: 50 Digits" },
  { digits: 75, badge: "🏅", label: "Platinum: 75 Digits" },
  { digits: 100, badge: "🏆", label: "Pi Master: 100 Digits" },
  // --- Mode-based and feature-based achievements ---
  { mode: "timed", badge: "⏱️", label: "Timed Novice: 20+ in Timed Mode", condition: (scores) => scores.timed >= 20 },
  { mode: "timed", badge: "⏱️", label: "Timed Pro: 40+ in Timed Mode", condition: (scores) => scores.timed >= 40 },
  { mode: "streak", badge: "🔥", label: "Streak Starter: 10+ Streak", condition: (scores) => scores.streak >= 10 },
  { mode: "streak", badge: "🔥", label: "Streak Master: 25+ Streak", condition: (scores) => scores.streak >= 25 },
  { mode: "speedrun", badge: "⚡", label: "Speedrunner: 20+ in Speedrun", condition: (scores) => scores.speedrun >= 20 },
  { mode: "speedrun", badge: "⚡", label: "Speedrun Pro: 35+ in Speedrun", condition: (scores) => scores.speedrun >= 35 },
  { feature: "hint", badge: "💡", label: "Used a Hint", condition: (scores) => scores.usedHint },
  { feature: "powerup", badge: "🔋", label: "Used a Power-up", condition: (scores) => scores.usedPowerup },
  { feature: "challenge", badge: "🎯", label: "Completed Daily Challenge", condition: (scores) => scores.dailyChallenge },
  { feature: "challenge", badge: "🏅", label: "Completed Weekly Challenge", condition: (scores) => scores.weeklyChallenge },
  { feature: "trivia", badge: "❓", label: "Answered a Trivia Question", condition: (scores) => scores.answeredTrivia },
  { feature: "share", badge: "📤", label: "Shared Your Score", condition: (scores) => scores.sharedScore }
];

// Helper to get scores from localStorage or defaults
function getAllModeScores() {
  return {
    normal: Number(localStorage.getItem('pi_highest_score')) || 0,
    timed: Number(localStorage.getItem('pi_highest_score_timed')) || 0,
    streak: Number(localStorage.getItem('pi_highest_streak')) || 0,
    speedrun: Number(localStorage.getItem('pi_speedrun_highscore')) || 0,
    usedHint: !!localStorage.getItem('pi_used_hint'),
    usedPowerup: !!localStorage.getItem('pi_used_powerup'),
    dailyChallenge: !!localStorage.getItem('pi_daily_challenge_completed'),
    weeklyChallenge: !!localStorage.getItem('pi_weekly_challenge_completed'),
    answeredTrivia: !!localStorage.getItem('pi_answered_trivia'),
    sharedScore: !!localStorage.getItem('pi_shared_score')
  };
}

window.getUnlockedAchievements = function(maxScore) {
  const scores = getAllModeScores();
  // For legacy digit-based achievements, use maxScore
  return window.ACHIEVEMENTS.filter(a =>
    (a.digits && maxScore >= a.digits) ||
    (a.condition && a.condition(scores))
  );
};

window.getNewAchievement = function(score, prevScore) {
  // Only for digit-based achievements
  return window.ACHIEVEMENTS.find(a => a.digits && score >= a.digits && prevScore < a.digits);
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
