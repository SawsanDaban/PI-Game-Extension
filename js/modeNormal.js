window.PIModeNormal = function({
  piInputElem,
  piSequenceElem,
  scoreElem,
  progressElem,
  onEnd,
  _currentIndexRef
}) {
  let currentIndex = 0;
  let score = 0;
  let ended = false;

  function endNormal() {
    if (ended) return;
    ended = true;
    piInputElem.disabled = true;
    if (typeof onEnd === "function") onEnd(score);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    if (_currentIndexRef) _currentIndexRef.value = currentIndex;
    window._currentIndex = currentIndex;
    if (window.showMotivationText) window.showMotivationText(score);
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

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    if (input.length === 0) return;

    const PI_DIGITS = window.PIModeBase.getPiDigits();
    if (!PI_DIGITS || PI_DIGITS.length === 0) {
      endNormal();
      return;
    }
    if (currentIndex + input.length - 1 >= PI_DIGITS.length) {
      endNormal();
      return;
    }
    if (typeof PI_DIGITS[currentIndex] === "undefined") {
      endNormal();
      return;
    }
    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      endNormal();
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
  if (_currentIndexRef) _currentIndexRef.value = currentIndex;
  window._currentIndex = currentIndex;
  if (document.activeElement !== piInputElem) piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  return function cleanup() {
    piInputElem.removeEventListener('input', handleInput);
  };
};
