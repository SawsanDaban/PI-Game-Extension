window.PIModeNormal = function({
  piInputElem,
  piSequenceElem,
  scoreElem,
  progressElem,
  onEnd
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
      endNormal();
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  return function cleanup() {
    piInputElem.removeEventListener('input', handleInput);
  };
};
