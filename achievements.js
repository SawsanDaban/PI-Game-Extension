window.ACHIEVEMENTS = [
  { digits: 10, badge: "🥉", label: "Bronze: 10 Digits" },
  { digits: 25, badge: "🥈", label: "Silver: 25 Digits" },
  { digits: 50, badge: "🥇", label: "Gold: 50 Digits" },
  { digits: 75, badge: "🏅", label: "Platinum: 75 Digits" },
  { digits: 100, badge: "🏆", label: "Pi Master: 100 Digits" }
];

window.getUnlockedAchievements = function(maxScore) {
  return window.ACHIEVEMENTS.filter(a => maxScore >= a.digits);
};

window.getNewAchievement = function(score, prevScore) {
  return window.ACHIEVEMENTS.find(a => score >= a.digits && prevScore < a.digits);
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
