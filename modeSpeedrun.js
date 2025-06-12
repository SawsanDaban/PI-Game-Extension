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
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    timerValueElem.textContent = timeLeft;
    if (document.activeElement !== piInputElem) piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    if (input.length === 0) return;

    const PI_DIGITS = window.PIModeBase.getPiDigits();
    if (!PI_DIGITS || PI_DIGITS.length === 0) {
      endSpeedrun();
      return;
    }
    if (currentIndex + input.length - 1 >= PI_DIGITS.length) {
      endSpeedrun();
      return;
    }
    if (typeof PI_DIGITS[currentIndex] === "undefined") {
      endSpeedrun();
      return;
    }
    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      endSpeedrun();
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
  timerValueElem.textContent = timeLeft;
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
