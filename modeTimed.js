window.PIModeTimed = function({
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
  let timeElapsed = 0;
  let interval = null;
  let ended = false;
  let started = false;

  function endTimed() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    if (typeof onEnd === "function") onEnd(score, timeElapsed);
    console.log("[Timed] Game Over at index:", currentIndex, "score:", score, "time:", timeElapsed);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    timerValueElem.textContent = timeElapsed;
    piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    if (!started) {
      started = true;
      timerElem.style.display = "block";
      interval = setInterval(() => {
        timeElapsed++;
        timerValueElem.textContent = timeElapsed;
      }, 1000);
    }
    const input = piInputElem.value;
    console.log("[Timed] Input:", input, "CurrentIndex:", currentIndex, "Score:", score, "Time:", timeElapsed);
    if (input.length === 0) return;

    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      console.log("[Timed] Wrong digit! Input:", input, "Expected:", window.PIModeBase.getPiDigits()[currentIndex + input.length - 1]);
      endTimed();
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
      console.log("[Timed] Accepted:", accepted, "NewIndex:", currentIndex, "NewScore:", score);
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  timerElem.style.display = "block";
  timeElapsed = 0;
  timerValueElem.textContent = "0";
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  return function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    timerElem.style.display = "none";
  };
};
