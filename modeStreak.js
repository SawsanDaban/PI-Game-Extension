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
  let started = false;

  function endStreak() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    if (streakCountdownElem) {
      streakCountdownElem.textContent = "";
      streakCountdownElem.style.display = "none";
    }
    if (typeof onEnd === "function") onEnd(score);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    if (streakCountdownElem) {
      streakCountdownElem.textContent = "⏳ " + streakCountdown.toFixed(1) + "s left";
      streakCountdownElem.style.display = "";
    }
    if (document.activeElement !== piInputElem) piInputElem.focus();
  }

  function startCountdown() {
    if (interval) return;
    interval = setInterval(() => {
      if (ended) return;
      streakCountdown -= 0.1;
      if (streakCountdownElem) {
        streakCountdownElem.textContent = "⏳ " + streakCountdown.toFixed(1) + "s left";
        streakCountdownElem.style.display = "";
      }
      if (streakCountdown <= 0) {
        streakCountdown = 0;
        updateUI();
        endStreak();
      } else {
        updateUI();
      }
    }, 100);
  }

  function handleInput() {
    if (ended) return;
    if (!started) {
      started = true;
      startCountdown();
    }
    streakCountdown = 5;
    const input = piInputElem.value;
    if (input.length === 0) return;

    const PI_DIGITS = window.PIModeBase.getPiDigits();
    if (!PI_DIGITS || PI_DIGITS.length === 0) {
      endStreak();
      return;
    }
    if (currentIndex + input.length - 1 >= PI_DIGITS.length) {
      endStreak();
      return;
    }
    if (typeof PI_DIGITS[currentIndex] === "undefined") {
      endStreak();
      return;
    }
    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      endStreak();
      return;
    }
    let accepted = 0;
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
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  if (streakCountdownElem) {
    streakCountdownElem.style.display = "";
    streakCountdownElem.textContent = "⏳ 5.0s left";
  }
  if (document.activeElement !== piInputElem) piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  return function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    if (streakCountdownElem) {
      streakCountdownElem.textContent = "";
      streakCountdownElem.style.display = "none";
    }
  };
};
