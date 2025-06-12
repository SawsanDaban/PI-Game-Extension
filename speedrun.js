window.SPEEDRUN_DURATION = 30; // seconds

window.startSpeedrun = function({
  piInputElem,
  piSequenceElem,
  scoreElem,
  timerElem,
  timerValueElem,
  progressElem,
  onEnd
}) {
  let currentIndex = 0;
  let score = 0;
  let timeLeft = window.SPEEDRUN_DURATION;
  let interval = null;
  let ended = false;

  // Always use window.PI_DIGITS (declared in popup.js and available globally)
  function getPiDigits() {
    return typeof window.PI_DIGITS === "string" ? window.PI_DIGITS : "";
  }

  function endSpeedrun() {
    if (ended) return;
    ended = true;
    clearInterval(interval);
    piInputElem.disabled = true;
    if (typeof onEnd === "function") onEnd(score);
  }

  function updateUI() {
    const PI_DIGITS = getPiDigits();
    piSequenceElem.textContent = "3." + PI_DIGITS.substring(0, currentIndex);
    scoreElem.textContent = "Score: " + score;
    progressElem.value = currentIndex;
    progressElem.max = PI_DIGITS.length;
    timerValueElem.textContent = timeLeft;
  }

  function handleInput() {
    if (ended) return;
    const PI_DIGITS = getPiDigits();
    const input = piInputElem.value;
    if (input.length === 0) return;
    if (input[0] === PI_DIGITS[currentIndex]) {
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
  timeLeft = window.SPEEDRUN_DURATION;
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
