// First 100 digits of PI (excluding "3.")
const PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

let currentIndex = 0;
let score = 0;
let gameOver = false;

const piSequenceElem = document.getElementById('pi-sequence');
const piInputElem = document.getElementById('pi-input');
const scoreElem = document.getElementById('score');
const messageElem = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');

function resetGame() {
  currentIndex = 0;
  score = 0;
  gameOver = false;
  piSequenceElem.textContent = "3.";
  piInputElem.value = "";
  piInputElem.disabled = false;
  scoreElem.textContent = "Score: 0";
  messageElem.textContent = "";
  restartBtn.style.display = "none";
  piInputElem.focus();
}

function handleInput() {
  if (gameOver) return;
  const input = piInputElem.value;
  let correct = true;
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== PI_DIGITS[currentIndex + i]) {
      correct = false;
      break;
    }
  }
  if (!correct) {
    gameOver = true;
    messageElem.textContent = "Wrong digit! Game over.";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    return;
  }
  // Update sequence and score
  piSequenceElem.textContent = "3." + PI_DIGITS.substring(0, currentIndex + input.length);
  scoreElem.textContent = "Score: " + (currentIndex + input.length);
  if (input.length + currentIndex === PI_DIGITS.length) {
    messageElem.textContent = "Congratulations! You completed all available digits!";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    gameOver = true;
    return;
  }
  if (input.length > 0) {
    score = currentIndex + input.length;
  }
  // If input is correct so far, but not finished, wait for more input
  if (input.length > 0 && input.length + currentIndex < PI_DIGITS.length) {
    // If user typed more than one digit at once, update currentIndex and clear input
    if (input.length > 0) {
      currentIndex += input.length;
      piInputElem.value = "";
    }
  }
}

piInputElem.addEventListener('input', handleInput);
restartBtn.addEventListener('click', resetGame);

resetGame();
