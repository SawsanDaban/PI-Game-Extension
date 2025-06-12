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
  }

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    if (input.length === 0) return;
    if (window.PIModeBase.checkDigit(input, currentIndex)) {
      currentIndex++;
      score++;
      piInputElem.value = "";
      updateUI();
    } else {
      endSpeedrun();
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
