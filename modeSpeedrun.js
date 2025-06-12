window.PIModeSpeedrun = function({
  piInputElem,
  piSequenceElem,
  scoreElem,
  progressElem,
  timerElem,
  timerValueElem,
  onEnd
}) {
  let currentIndex = 0;
  let score = 0;
  let timeLeft = 30;
  let interval = null;
  let ended = false;

  function endSpeedrun() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    if (typeof onEnd === "function") onEnd(score);
    console.log("[Speedrun] Game Over at index:", currentIndex, "score:", score, "timeLeft:", timeLeft);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    timerValueElem.textContent = timeLeft;
    piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    console.log("[Speedrun] Input:", input, "CurrentIndex:", currentIndex, "Score:", score, "TimeLeft:", timeLeft);
    if (input.length === 0) return;

    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      console.log("[Speedrun] Wrong digit! Input:", input, "Expected:", window.PIModeBase.getPiDigits()[currentIndex + input.length - 1]);
      endSpeedrun();
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
      console.log("[Speedrun] Accepted:", accepted, "NewIndex:", currentIndex, "NewScore:", score);
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  timerElem.style.display = "block";
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  interval = setInterval(() => {
    timeLeft--;
    timerValueElem.textContent = timeLeft;
    if (timeLeft <= 0) {
      endSpeedrun();
    }
  }, 1000);

  return function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    timerElem.style.display = "none";
  };
};
