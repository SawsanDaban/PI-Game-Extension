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
  let started = false;

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

  function animateCorrectInput() {
    if (window.animateCorrectInput) {
      window.animateCorrectInput(piSequenceElem, window.emojiFeedbackElem || {});
    } else {
      piSequenceElem.style.transition = "transform 0.15s";
      piSequenceElem.style.transform = "scale(1.08)";
      setTimeout(() => {
        piSequenceElem.style.transform = "scale(1)";
      }, 150);
    }
  }

  function startCountdown() {
    if (interval) return;
    interval = setInterval(() => {
      if (ended) return;
      timeLeft--;
      timerValueElem.textContent = timeLeft;
      if (timeLeft <= 0) {
        endSpeedrun();
      }
    }, 1000);
  }

  function handleInput() {
    if (ended) return;
    if (!started) {
      started = true;
      startCountdown();
    }
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
      animateCorrectInput();
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

  return function cleanup() {
    clearInterval(interval);
    piInputElem.removeEventListener('input', handleInput);
    timerElem.style.display = "none";
  };
};
