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
    console.log("[Streak] Game Over at index:", currentIndex, "score:", score);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    if (streakCountdownElem) {
      streakCountdownElem.textContent = "⏳ " + streakCountdown.toFixed(1) + "s left";
    }
    piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    streakCountdown = 5;
    const input = piInputElem.value;
    console.log("[Streak] Input:", input, "CurrentIndex:", currentIndex, "Score:", score);
    if (input.length === 0) return;

    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      console.log("[Streak] Wrong digit! Input:", input, "Expected:", window.PIModeBase.getPiDigits()[currentIndex + input.length - 1]);
      endStreak();
      return;
    }

    let accepted = 0;
    const PI_DIGITS = window.PIModeBase.getPiDigits();
    for (let i = 0; i < input.length; i++) {
      if (input[i] === PI_DIGITS[currentIndex + i]) {
        accepted++;
      } else {
        break;
      }
    }
    if (accepted > 0) {
      currentIndex += accepted;
      score += accepted;
      piInputElem.value = "";
      updateUI();
      console.log("[Streak] Accepted:", accepted, "NewIndex:", currentIndex, "NewScore:", score);
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
    if (streakCountdownElem) streakCountdownElem.textContent = "";
  };
};
