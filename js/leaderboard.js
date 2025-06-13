const LEADERBOARD_API_URL = 'https://pigame.irissmile.studio/api/leaderboard';

// Fetch leaderboard from backend (JSON)
window.fetchLeaderboard = async function() {
  try {
    const res = await fetch(LEADERBOARD_API_URL);
    return await res.json();
  } catch (e) {
    return [];
  }
};

// Prompt for a valid name (max 16 chars, not blank)
window.promptLeaderboardName = function() {
  let name = '';
  while (!name || !name.trim()) {
    name = prompt('Enter your name for the leaderboard (max 16 chars):', '');
    if (name === null) return null; // User cancelled
    name = name.trim().substring(0, 16);
  }
  localStorage.setItem('pi_leaderboard_name', name);
  return name;
};

// Submit score to backend (only for streak mode)
window.submitStreakScoreToLeaderboard = async function(score) {
  if (!window.PI_SETTINGS || !window.PI_SETTINGS.leaderboard) return;
  let name = localStorage.getItem('pi_leaderboard_name');
  if (!name || !name.trim()) {
    name = window.promptLeaderboardName();
    if (!name) return; // User cancelled
  }
  try {
    await fetch(LEADERBOARD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
  } catch (e) {
    // Ignore errors for now
  }
};

// Render leaderboard from backend (always show, regardless of mode)
window.renderLeaderboard = async function(leaderboardListElem) {
  leaderboardListElem.innerHTML = '<div style="padding:12px;">Loading...</div>';
  const lb = await window.fetchLeaderboard();
  leaderboardListElem.innerHTML = '';
  if (!lb.length) {
    leaderboardListElem.innerHTML = '<div style="padding:12px;">No leaderboard entries yet.</div>';
    return;
  }
  lb.forEach((entry, idx) => {
    const div = document.createElement('div');
    div.className = 'arcade-achievement-row';
    div.innerHTML = `<span class="arcade-badge">${idx + 1}</span>
      <span class="arcade-achievement-label"><strong>${entry.name}</strong> — <span style="color:#3a6e8d">${entry.score}</span> digits</span>`;
    leaderboardListElem.appendChild(div);
  });
};
