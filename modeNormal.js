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
    console.log("[Normal] Game Over at index:", currentIndex, "score:", score);
  }

  function updateUI() {
    window.PIModeBase.updateSequence(piSequenceElem, currentIndex);
    window.PIModeBase.updateScore(scoreElem, score);
    window.PIModeBase.updateProgress(progressElem, currentIndex);
    if (document.activeElement !== piInputElem) piInputElem.focus();
  }

  function handleInput() {
    if (ended) return;
    const input = piInputElem.value;
    console.log("[Normal] Input:", input, "CurrentIndex:", currentIndex, "Score:", score);

    if (input.length === 0) return;

    const PI_DIGITS = window.PIModeBase.getPiDigits();
    // Fix: Only check if there is a next digit to check (should be <, not >=)
    if (!PI_DIGITS || PI_DIGITS.length === 0) {
      console.log("[Normal] PI_DIGITS is empty or undefined!");
      endNormal();
      return;
    }
    // Only check if there is a digit to check (should be < PI_DIGITS.length)
    if (currentIndex + input.length - 1 >= PI_DIGITS.length) {
      console.log("[Normal] Out of digits! Input:", input, "CurrentIndex:", currentIndex);
      endNormal();
      return;
    }

    // --- FIX: The first digit of PI_DIGITS should be "1" (after "3.")
    // So input[0] should be compared to PI_DIGITS[currentIndex]
    // But if PI_DIGITS[0] is undefined, something is wrong with PI_DIGITS
    if (typeof PI_DIGITS[currentIndex] === "undefined") {
      console.log("[Normal] PI_DIGITS[currentIndex] is undefined!", currentIndex, PI_DIGITS);
      endNormal();
      return;
    }

    // Only check the last digit typed
    if (!window.PIModeBase.checkLastDigit(input, currentIndex)) {
      console.log("[Normal] Wrong digit! Input:", input, "Expected:", PI_DIGITS[currentIndex + input.length - 1]);
      endNormal();
      return;
    }

    // Accept one digit at a time or as many correct as possible if pasted
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
      console.log("[Normal] Accepted:", accepted, "NewIndex:", currentIndex, "NewScore:", score);
    }
  }

  piInputElem.value = "";
  piInputElem.disabled = false;
  if (document.activeElement !== piInputElem) piInputElem.focus();
  updateUI();

  piInputElem.addEventListener('input', handleInput);

  return function cleanup() {
    piInputElem.removeEventListener('input', handleInput);
  };
};
