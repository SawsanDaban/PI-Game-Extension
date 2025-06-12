window.PIModeBase = {
  getPiDigits() {
    return typeof window.PI_DIGITS === "string" ? window.PI_DIGITS : "";
  },
  updateSequence(piSequenceElem, currentIndex) {
    piSequenceElem.textContent = "3." + this.getPiDigits().substring(0, currentIndex);
  },
  updateScore(scoreElem, score) {
    scoreElem.textContent = "Score: " + score;
  },
  updateProgress(progressElem, currentIndex) {
    progressElem.value = currentIndex;
    progressElem.max = this.getPiDigits().length;
  },
  // Only check the last digit typed
  checkLastDigit(input, currentIndex) {
    const PI_DIGITS = this.getPiDigits();
    if (!input.length) return true;
    // Only check the last character typed
    const lastTyped = input[input.length - 1];
    const expected = PI_DIGITS[currentIndex + input.length - 1];
    return lastTyped === expected;
  }
};
