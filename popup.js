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
const emojiFeedbackElem = document.getElementById('emoji-feedback');
const motivationElem = document.getElementById('motivation');
const confettiCanvas = document.getElementById('confetti-canvas');

const MOTIVATION = [
  "Keep going! 🚀",
  "You're on fire! 🔥",
  "Amazing memory! 🧠",
  "Impressive! 🌟",
  "Wow, keep it up! 💪",
  "Math wizard! 🧙‍♂️",
  "Unstoppable! 🏆",
  "Legend! 👑"
];

const PI_FACTS = [
  "Did you know? PI has been calculated to over 62 trillion digits!",
  "PI Day is celebrated on March 14th (3/14).",
  "The symbol π was first used for PI in 1706.",
  "PI is an irrational number, meaning it never ends or repeats.",
  "The world record for memorizing PI is over 70,000 digits!",
  "PI appears in many formulas in physics and engineering.",
  "The first 6 digits of PI are 3.14159.",
  "PI is the ratio of a circle's circumference to its diameter.",
  "No exact fraction equals PI, but 22/7 is a common approximation.",
  "PI is used in probability, statistics, and even music theory!"
];

let timer = null;
let timeElapsed = 0;
let timedMode = false;

const highestScoreElem = document.getElementById('highest-score');
highestScoreElem.style.marginBottom = '8px';

function showEmoji(type) {
  if (type === "correct") emojiFeedbackElem.textContent = "😃";
  else if (type === "wrong") emojiFeedbackElem.textContent = "😢";
  else if (type === "win") emojiFeedbackElem.textContent = "🎉";
  else emojiFeedbackElem.textContent = "";
}

function showMotivation(score) {
  if (score > 0 && score % 10 === 0) {
    motivationElem.textContent = MOTIVATION[(score / 10 - 1) % MOTIVATION.length];
    motivationElem.style.opacity = 1;
  } else {
    motivationElem.textContent = "";
    motivationElem.style.opacity = 0;
  }
}

function showRandomPIFact() {
  const fact = PI_FACTS[Math.floor(Math.random() * PI_FACTS.length)];
  motivationElem.textContent = fact;
  motivationElem.style.opacity = 1;
}

// --- Confetti animation ---
function launchConfetti() {
  confettiCanvas.width = 250;
  confettiCanvas.height = 200;
  confettiCanvas.style.display = 'block';
  const ctx = confettiCanvas.getContext('2d');
  const confettiCount = 80;
  const confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random()*360},70%,60%)`,
      tilt: Math.random() * 10 - 10
    });
  }
  let angle = 0;
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    angle += 0.01;
    for (let i = 0; i < confettiCount; i++) {
      let c = confetti[i];
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, false);
      ctx.fillStyle = c.color;
      ctx.fill();
      c.y += Math.cos(angle + c.d) + 1 + c.r / 2;
      c.x += Math.sin(angle) * 2;
      if (c.y > confettiCanvas.height) {
        c.y = -10;
        c.x = Math.random() * confettiCanvas.width;
      }
    }
    frame++;
    if (frame < 80) {
      requestAnimationFrame(draw);
    } else {
      confettiCanvas.style.display = 'none';
    }
  }
  draw();
}
// --- End confetti ---

function animateCorrectInput() {
  piSequenceElem.style.transition = "transform 0.15s";
  piSequenceElem.style.transform = "scale(1.08)";
  showEmoji("correct");
  setTimeout(() => {
    piSequenceElem.style.transform = "scale(1)";
    showEmoji("");
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
  showEmoji("");
  motivationElem.textContent = "";
  motivationElem.style.opacity = 0;
  confettiCanvas.style.display = 'none';
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
    showEmoji("wrong");
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
    // Show a random PI fact
    showRandomPIFact();
    return;
  }
  // Update sequence and score
  piSequenceElem.textContent = "3." + PI_DIGITS.substring(0, currentIndex + input.length);
  scoreElem.textContent = "Score: " + (currentIndex + input.length);
  progressElem.value = currentIndex + input.length;
  progressElem.max = PI_DIGITS.length;
  hintElem.textContent = "";
  animateCorrectInput();
  showMotivation(currentIndex + input.length);
  if (input.length + currentIndex === PI_DIGITS.length) {
    messageElem.textContent = "Congratulations! You completed all available digits!";
    piInputElem.disabled = true;
    restartBtn.style.display = "inline-block";
    gameOver = true;
    showEmoji("win");
    launchConfetti();
    if (timedMode) {
      stopTimer();
      messageElem.textContent += ` Time: ${timeElapsed}s.`;
    }
    motivationElem.textContent = "You did it! 🎊";
    motivationElem.style.opacity = 1;
    // Show a random PI fact after a short delay
    setTimeout(showRandomPIFact, 2000);
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
