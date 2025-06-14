// Unified achievements list (digit, mode, feature, advanced)
window.PI_ACHIEVEMENTS = [
  // English and Arabic labels/descriptions for each achievement
  {
    id: 'digits-10',
    label: { en: '10 Digits', ar: '١٠ أرقام' },
    desc: { en: 'Reach 10 digits of PI', ar: 'احصل على ١٠ أرقام من باي' },
    badge: '🔟',
    check: s => s.maxDigits >= 10
  },
  {
    id: 'digits-25',
    label: { en: '25 Digits', ar: '٢٥ رقمًا' },
    desc: { en: 'Reach 25 digits of PI', ar: 'احصل على ٢٥ رقمًا من باي' },
    badge: '2️⃣5️⃣',
    check: s => s.maxDigits >= 25
  },
  {
    id: 'digits-50',
    label: { en: '50 Digits', ar: '٥٠ رقمًا' },
    desc: { en: 'Reach 50 digits of PI', ar: 'احصل على ٥٠ رقمًا من باي' },
    badge: '5️⃣0️⃣',
    check: s => s.maxDigits >= 50
  },
  {
    id: 'digits-75',
    label: { en: '75 Digits', ar: '٧٥ رقمًا' },
    desc: { en: 'Reach 75 digits of PI', ar: 'احصل على ٧٥ رقمًا من باي' },
    badge: '7️⃣5️⃣',
    check: s => s.maxDigits >= 75
  },
  {
    id: 'digits-100',
    label: { en: '100 Digits', ar: '١٠٠ رقم' },
    desc: { en: 'Reach 100 digits of PI', ar: 'احصل على ١٠٠ رقم من باي' },
    badge: '💯',
    check: s => s.maxDigits >= 100
  },
  {
    id: 'timed-20',
    label: { en: 'Timed Novice', ar: 'مبتدئ المؤقت' },
    desc: { en: '20+ in Timed Mode', ar: 'احصل على ٢٠ أو أكثر في وضع المؤقت' },
    badge: '⏱️',
    check: s => s.timed >= 20
  },
  {
    id: 'timed-40',
    label: { en: 'Timed Pro', ar: 'محترف المؤقت' },
    desc: { en: '40+ in Timed Mode', ar: 'احصل على ٤٠ أو أكثر في وضع المؤقت' },
    badge: '⏱️',
    check: s => s.timed >= 40
  },
  {
    id: 'streak-10',
    label: { en: 'Streak Starter', ar: 'بداية السلسلة' },
    desc: { en: '10+ Streak', ar: 'سلسلة من ١٠ أو أكثر' },
    badge: '🔥',
    check: s => s.streak >= 10
  },
  {
    id: 'streak-25',
    label: { en: 'Streak Master', ar: 'سيد السلسلة' },
    desc: { en: '25+ Streak', ar: 'سلسلة من ٢٥ أو أكثر' },
    badge: '🔥',
    check: s => s.streak >= 25
  },
  {
    id: 'speedrun-20',
    label: { en: 'Speedrunner', ar: 'عداء السرعة' },
    desc: { en: '20+ in Speedrun', ar: 'احصل على ٢٠ أو أكثر في سباق السرعة' },
    badge: '⚡',
    check: s => s.speedrun >= 20
  },
  {
    id: 'speedrun-35',
    label: { en: 'Speedrun Pro', ar: 'محترف سباق السرعة' },
    desc: { en: '35+ in Speedrun', ar: 'احصل على ٣٥ أو أكثر في سباق السرعة' },
    badge: '⚡',
    check: s => s.speedrun >= 35
  },
  {
    id: 'perfect-game',
    label: { en: 'Perfect Game', ar: 'لعبة مثالية' },
    desc: { en: 'Finish a game with no mistakes', ar: 'أنهِ اللعبة بدون أخطاء' },
    badge: '🌟',
    check: s => s.lastGamePerfect
  },
  {
    id: 'used-hint',
    label: { en: 'Used a Hint', ar: 'استخدمت تلميحًا' },
    desc: { en: 'Used a Hint', ar: 'استخدمت تلميحًا' },
    badge: '💡',
    check: s => s.usedHint
  },
  {
    id: 'used-powerup',
    label: { en: 'Used a Power-up', ar: 'استخدمت تعزيزًا' },
    desc: { en: 'Used a Power-up', ar: 'استخدمت تعزيزًا' },
    badge: '🔋',
    check: s => s.usedPowerup
  },
  {
    id: 'daily-challenge',
    label: { en: 'Completed Daily Challenge', ar: 'أكملت تحدي اليوم' },
    desc: { en: 'Completed Daily Challenge', ar: 'أكملت تحدي اليوم' },
    badge: '🎯',
    check: s => s.dailyChallenge
  },
  {
    id: 'weekly-challenge',
    label: { en: 'Completed Weekly Challenge', ar: 'أكملت تحدي الأسبوع' },
    desc: { en: 'Completed Weekly Challenge', ar: 'أكملت تحدي الأسبوع' },
    badge: '🏅',
    check: s => s.weeklyChallenge
  },
  {
    id: 'trivia-1',
    label: { en: 'Answered a Trivia Question', ar: 'أجبت على سؤال باي' },
    desc: { en: 'Answered a Trivia Question', ar: 'أجبت على سؤال باي' },
    badge: '❓',
    check: s => s.answeredTrivia
  },
  {
    id: 'trivia-5',
    label: { en: 'Trivia Buff', ar: 'خبير أسئلة باي' },
    desc: { en: 'Answer 5 PI trivia questions correctly', ar: 'أجب على ٥ أسئلة باي بشكل صحيح' },
    badge: '❓',
    check: s => s.triviaCorrect >= 5
  },
  {
    id: 'share',
    label: { en: 'Social Sharer', ar: 'مشارك اجتماعي' },
    desc: { en: 'Share your score at least once', ar: 'شارك نتيجتك مرة واحدة على الأقل' },
    badge: '📤',
    check: s => s.sharedScore
  }
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

// Helper to check and unlock challenge achievements
window.checkChallengeAchievements = function() {
  const stats = getAllModeScores();
  // Daily challenge
  if (stats.dailyChallenge && !window.PI_ACHIEVEMENT_STATE['daily-challenge']) {
    window.PI_ACHIEVEMENT_STATE['daily-challenge'] = true;
    showAchievementNotification(window.PI_ACHIEVEMENTS.find(a => a.id === 'daily-challenge'));
  }
  // Weekly challenge
  if (stats.weeklyChallenge && !window.PI_ACHIEVEMENT_STATE['weekly-challenge']) {
    window.PI_ACHIEVEMENT_STATE['weekly-challenge'] = true;
    showAchievementNotification(window.PI_ACHIEVEMENTS.find(a => a.id === 'weekly-challenge'));
  }
  localStorage.setItem('pi_achievement_state', JSON.stringify(window.PI_ACHIEVEMENT_STATE));
};

// Show achievement notification
function showAchievementNotification(achievement) {
  // Use current language for label/desc
  const lang = document.documentElement.lang || 'en';
  const label = typeof achievement.label === 'object' ? (achievement.label[lang] || achievement.label.en) : achievement.label;
  const desc = typeof achievement.desc === 'object' ? (achievement.desc[lang] || achievement.desc.en) : achievement.desc;
  const notif = document.createElement('div');
  notif.className = 'arcade-achievement-toast';
  notif.innerHTML = `<span class="arcade-badge">${achievement.badge}</span> <strong>${label}</strong><br><small>${desc}</small>`;
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
  // Always check and unlock achievements before returning
  window.checkAchievements(scores);
  window.checkChallengeAchievements();
  return window.PI_ACHIEVEMENTS.filter(a => a.check(scores));
};

window.showAchievement = function(achievement, messageElem) {
  if (!achievement) return;
  const lang = document.documentElement.lang || 'en';
  const label = typeof achievement.label === 'object' ? (achievement.label[lang] || achievement.label.en) : achievement.label;
  messageElem.textContent = `Achievement Unlocked! ${achievement.badge} ${label}`;
  messageElem.style.color = "#FFD700";
  setTimeout(() => {
    messageElem.textContent = "";
    messageElem.style.color = "#ff2fd6";
  }, 2500);
};
