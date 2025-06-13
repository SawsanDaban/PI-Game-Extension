const DAILY_CHALLENGE_KEY = 'pi_daily_challenge';
const DAILY_CHALLENGE_DATE_KEY = 'pi_daily_challenge_date';
const DAILY_CHALLENGE_MIN = 10;
const DAILY_CHALLENGE_MAX = 50;

const WEEKLY_CHALLENGE_KEY = 'pi_weekly_challenge';
const WEEKLY_CHALLENGE_WEEK_KEY = 'pi_weekly_challenge_week';
const WEEKLY_CHALLENGE_MIN = 30;
const WEEKLY_CHALLENGE_MAX = 80;

window.getTodayString = function() {
  const now = new Date();
  return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
};

window.getWeekString = function() {
  const now = new Date();
  // ISO week number
  const firstJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - firstJan) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
  return now.getFullYear() + '-W' + week;
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

window.getOrCreateWeeklyChallenge = function() {
  const week = window.getWeekString();
  let challengeWeek = localStorage.getItem(WEEKLY_CHALLENGE_WEEK_KEY);
  let challenge = Number(localStorage.getItem(WEEKLY_CHALLENGE_KEY));
  if (challengeWeek !== week || !challenge) {
    challenge = Math.floor(Math.random() * (WEEKLY_CHALLENGE_MAX - WEEKLY_CHALLENGE_MIN + 1)) + WEEKLY_CHALLENGE_MIN;
    localStorage.setItem(WEEKLY_CHALLENGE_KEY, challenge);
    localStorage.setItem(WEEKLY_CHALLENGE_WEEK_KEY, week);
    localStorage.removeItem('pi_weekly_challenge_completed');
  }
  return challenge;
};

window.markDailyChallengeCompleted = function() {
  localStorage.setItem('pi_daily_challenge_completed', '1');
};

window.markWeeklyChallengeCompleted = function() {
  localStorage.setItem('pi_weekly_challenge_completed', '1');
};

window.isDailyChallengeCompleted = function() {
  return localStorage.getItem('pi_daily_challenge_completed') === '1';
};

window.isWeeklyChallengeCompleted = function() {
  return localStorage.getItem('pi_weekly_challenge_completed') === '1';
};
