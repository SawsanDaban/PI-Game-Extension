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
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    timerValueElem.textContent = timeElapsed;
    if (document.activeElement !== piInputElem) piInputElem.focus();
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
    if (input.length === 0) return;

    const PI_DIGITS = window.PIModeBase.getPiDigits();
    if (!PI_DIGITS || PI_DIGITS.length === 0) {
      endTimed();
      return;
    }
    if (currentIndex + input.length - 1 >= PI_DIGITS.length) {
      endTimed();
      return;
    }
    if (typeof PI_DIGITS[currentIndex] === "undefined") {
      endTimed();
      return;
    }
    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      endTimed();
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
