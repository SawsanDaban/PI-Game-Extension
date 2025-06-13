window.MOTIVATION = [
  "Keep going! 🚀",
  "You're on fire! 🔥",
  "Amazing memory! 🧠",
  "Impressive! 🌟",
  "Wow, keep it up! 💪",
  "Math wizard! 🧙‍♂️",
  "Unstoppable! 🏆",
  "Legend! 👑"
];

window.showEmoji = function(type, emojiFeedbackElem) {
  if (type === "correct") {
    emojiFeedbackElem.textContent = "😃";
    // if (window.PISound) window.PISound.play('correct');
  }
  else if (type === "wrong") {
    emojiFeedbackElem.textContent = "😢";
    // if (window.PISound) window.PISound.play('wrong');
  }
  else if (type === "win") {
    emojiFeedbackElem.textContent = "🎉";
    // if (window.PISound) window.PISound.play('gameover');
  }
  else emojiFeedbackElem.textContent = "";
};

window.showMotivation = function(score, motivationElem) {
  if (score > 0 && score % 10 === 0) {
    motivationElem.textContent = window.MOTIVATION[(score / 10 - 1) % window.MOTIVATION.length];
    motivationElem.style.opacity = 1;
  } else {
    motivationElem.textContent = "";
    motivationElem.style.opacity = 0;
  }
};

window.animateCorrectInput = function(piSequenceElem, emojiFeedbackElem) {
  piSequenceElem.style.transition = "transform 0.15s";
  piSequenceElem.style.transform = "scale(1.08)";
  window.showEmoji("correct", emojiFeedbackElem);
  setTimeout(() => {
    piSequenceElem.style.transform = "scale(1)";
    window.showEmoji("", emojiFeedbackElem);
  }, 150);
};

// Confetti animation
window.launchConfetti = function(confettiCanvas) {
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
};
