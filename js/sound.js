// Sound effects for correct, wrong, and game over

class SoundManager {
    constructor() {
        this.sounds = {
            correct: new Audio('assets/sound/correct.mp3'),
            wrong: new Audio('assets/sound/wrong.mp3'),
            gameover: new Audio('assets/sound/gameover.mp3')
        };
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || 1.0;
        this.muted = localStorage.getItem('soundMuted') === 'true';
        this._applySettings();
    }

    _applySettings() {
        Object.values(this.sounds).forEach(audio => {
            audio.volume = this.volume;
            audio.muted = this.muted;
        });
    }

    play(type) {
        if (this.sounds[type]) {
            this.sounds[type].currentTime = 0;
            this.sounds[type].play();
        }
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('soundVolume', this.volume);
        this._applySettings();
    }

    setMuted(mute) {
        this.muted = !!mute;
        localStorage.setItem('soundMuted', this.muted);
        this._applySettings();
    }

    toggleMute() {
        this.setMuted(!this.muted);
    }
}

window.soundManager = new SoundManager();
