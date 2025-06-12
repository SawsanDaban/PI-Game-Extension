// First 100 digits of PI (excluding "3.")
const PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

let currentIndex = 0;
let score = 0;
let gameOver = false;
let highestScore = Number(localStorage.getItem('pi_highest_score')) || 0;

const piSequenceElem = document.getElementById('pi-sequence');
const piInputElem = document.getElementById('pi-input');
const scoreElem = document.getElementById('score');
const messageElem = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const progressElem = document.getElementById('pi-progress');
const hintElem = document.getElementById('hint');
const modeSelectElem = document.getElementById('mode-select');
const timerElem = document.getElementById('timer');
const timerValueElem = document.getElementById('timer-value');

let timer = null;
let timeElapsed = 0;
let timedMode = false;

const highestScoreElem = document.createElement('div');
highestScoreElem.id = 'highest-score';
highestScoreElem.style.marginBottom = '8px';
scoreElem.parentNode.insertBefore(highestScoreElem, scoreElem.nextSibling);

function animateCorrectInput() {
  piSequenceElem.style.background = "#d4ffd4";
  setTimeout(() => {
    piSequenceElem.style.background = "";
  }, 150);
}

function updateHighestScoreDisplay() {
  highestScoreElem.textContent = "Highest Score: " + highestScore;
}

function startTimer() {
  timeElapsed = 0;
  timerValueElem.textContent = timeElapsed;
  timerElem.style.display = 'block';
  timer = setInterval(() => {
    timeElapsed++;
    timerValueElem.textContent = timeElapsed;
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

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
  progressElem.value = 0;
  hintElem.textContent = "";
  stopTimer();
  timeElapsed = 0;
  timerValueElem.textContent = "0";
  if (timedMode) {
    timerElem.style.display = 'block';
    startTimer();
  } else {
    timerElem.style.display = 'none';
  }
  piInputElem.focus();
  updateHighestScoreDisplay();
}

function handleInput() {
  if (gameOver) return;
  if (timedMode && !timer) startTimer();
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
    // Show the correct next digit as a hint
    hintElem.textContent = `The next digit was: ${PI_DIGITS[currentIndex]}`;
    // Update highest score if needed
    if (score > highestScore) {
      highestScore = score;
      localStorage.setItem('pi_highest_score', highestScore);
      updateHighestScoreDisplay();
    }
    if (timedMode) {
      stopTimer();
      messageElem.textContent += ` Time: ${timeElapsed}s.`;
    }
    return;
  }
  // Update sequence and score
  piSequenceElem.textContent = "3." + PI_DIGITS.substring(0, currentIndex + input.length);
  scoreElem.textContent = "Score: " + (currentIndex + input.length);
  progressElem.value = currentIndex + input.length;
  progressElem.max = PI_DIGITS.length;
  hintElem.textContent = "";
  animateCorrectInput();
  if (input.length + currentIndex === PI_DIGITS.length) {
    messageElem.textContent = "Congratulations! You completed all available digits!";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    gameOver = true;
    if (timedMode) {
      stopTimer();
      messageElem.textContent += ` Time: ${timeElapsed}s.`;
    }
    return;
  }
  if (input.length > 0) {
    score = currentIndex + input.length;
    if (score > highestScore) {
      highestScore = score;
      localStorage.setItem('pi_highest_score', highestScore);
      updateHighestScoreDisplay();
    }
  }
  // If input is correct so far, but not finished, wait for more input
  if (input.length > 0 && input.length + currentIndex < PI_DIGITS.length) {
    if (input.length > 0) {
      currentIndex += input.length;
      piInputElem.value = "";
    }
  }
}

modeSelectElem.addEventListener('change', () => {
  timedMode = modeSelectElem.value === 'timed';
  resetGame();
});

piInputElem.addEventListener('input', handleInput);
restartBtn.addEventListener('click', resetGame);

timedMode = modeSelectElem.value === 'timed';
resetGame();
