// Base helpers for all PI Game modes

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
  checkLastDigit(input, currentIndex) {
    const PI_DIGITS = this.getPiDigits();
    if (!input.length) return true;
    const lastTyped = input[input.length - 1];
    const expected = PI_DIGITS[currentIndex + input.length - 1];
    return lastTyped === expected;
  }
};

function onCorrectInput(inputElem) {
    window.soundManager.play('correct');
    if (window.PIUI && inputElem) window.PIUI.flashElement(inputElem);
}

function onWrongInput(inputElem) {
    window.soundManager.play('wrong');
    if (window.PIUI && inputElem) window.PIUI.shakeElement(inputElem);
}

function onGameOver(win = false) {
    window.soundManager.play('gameover');
    if (window.PIUI) window.PIUI.showConfettiOrEmoji(win ? 'win' : 'confetti');
}
