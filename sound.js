// Sound effects for correct, wrong, and game over

// window.PISound = {
//   enabled() {
//     return window.PI_SETTINGS && window.PI_SETTINGS.sound !== false;
//   },
//   correct: new Audio('assets/sound/correct.mp3'),
//   wrong: new Audio('assets/sound/wrong.mp3'),
//   gameover: new Audio('assets/sound/gameover.mp3'),
//   play(type) {
//     if (!this.enabled()) return;
//     try {
//       if (type === 'correct') this.correct.currentTime = 0, this.correct.play();
//       else if (type === 'wrong') this.wrong.currentTime = 0, this.wrong.play();
//       else if (type === 'gameover') this.gameover.currentTime = 0, this.gameover.play();
//     } catch (e) { /* ignore playback errors */ }
//   }
// };
