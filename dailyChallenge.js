const DAILY_CHALLENGE_KEY = 'pi_daily_challenge';
const DAILY_CHALLENGE_DATE_KEY = 'pi_daily_challenge_date';
const DAILY_CHALLENGE_MIN = 10;
const DAILY_CHALLENGE_MAX = 50;

window.getTodayString = function() {
  const now = new Date();
  return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
};

window.getOrCreateDailyChallenge = function() {
  const today = window.getTodayString();
  let challengeDate = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY);
  let challenge = Number(localStorage.getItem(DAILY_CHALLENGE_KEY));
  if (challengeDate !== today || !challenge) {
    challenge = Math.floor(Math.random() * (DAILY_CHALLENGE_MAX - DAILY_CHALLENGE_MIN + 1)) + DAILY_CHALLENGE_MIN;
    localStorage.setItem(DAILY_CHALLENGE_KEY, challenge);
    localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today);
    localStorage.removeItem('pi_daily_challenge_completed');
  }
  return challenge;
};

window.markDailyChallengeCompleted = function() {
  localStorage.setItem('pi_daily_challenge_completed', '1');
};

window.isDailyChallengeCompleted = function() {
  return localStorage.getItem('pi_daily_challenge_completed') === '1';
};
