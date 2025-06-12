window.PIModeStreak = function({
  piInputElem,
  piSequenceElem,
  scoreElem,
  progressElem,
  streakCountdownElem,
  onEnd
}) {
  let currentIndex = 0;
  let score = 0;
  let streakCountdown = 5;
  let interval = null;
  let ended = false;

  function endStreak() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    if (typeof onEnd === "function") onEnd(score);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    streakCountdownElem.textContent = "⏳ " + streakCountdown.toFixed(1) + "s left";
  }

  function handleInput() {
    if (ended) return;
    streakCountdown = 5;
    const input = piInputElem.value;
    if (input.length === 0) return;
    if (window.PIModeBase.checkDigit(input, currentIndex)) {
      currentIndex++;
      score++;
      piInputElem.value = "";
      updateUI();
    } else {
      endStreak();
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  interval = setInterval(() => {
    streakCountdown -= 0.1;
    if (streakCountdown <= 0) {
      streakCountdown = 0;
      updateUI();
      endStreak();
    } else {
      updateUI();
    }
  }, 100);

  return function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    streakCountdownElem.textContent = "";
  };
};
