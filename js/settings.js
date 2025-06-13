// --- SETTINGS STATE ---
window.PI_SETTINGS = {
  sound: true,
  animations: true,
  theme: 'neon',
  leaderboard: false // new: competitive leaderboard toggle
};

// --- SETTINGS LOAD/SAVE ---
window.loadSettings = function() {
  const saved = JSON.parse(localStorage.getItem('pi_settings') || '{}');
  window.PI_SETTINGS.sound = saved.sound !== false;
  window.PI_SETTINGS.animations = saved.animations !== false;
  // Theme: prefer pi_theme if set, else saved.theme, else 'neon'
  const piTheme = localStorage.getItem('pi_theme');
  window.PI_SETTINGS.theme = piTheme || saved.theme || 'neon';
  window.PI_SETTINGS.leaderboard = saved.leaderboard === true; // new

  const settingSound = document.getElementById('setting-sound');
  const settingAnimations = document.getElementById('setting-animations');
  const settingLeaderboard = document.getElementById('setting-leaderboard'); // new
  const themeSelect = document.getElementById('theme-select');
  if (settingSound) settingSound.checked = window.PI_SETTINGS.sound;
  if (settingAnimations) settingAnimations.checked = window.PI_SETTINGS.animations;
  if (settingLeaderboard) settingLeaderboard.checked = window.PI_SETTINGS.leaderboard; // new
  if (themeSelect) themeSelect.value = window.PI_SETTINGS.theme;
};

window.saveSettings = function() {
  localStorage.setItem('pi_settings', JSON.stringify(window.PI_SETTINGS));
  // Also save theme for popup.js to pick up
  localStorage.setItem('pi_theme', window.PI_SETTINGS.theme);
};

// --- THEME HANDLING ---
window.applyTheme = function(theme) {
  document.body.classList.remove('theme-neon', 'theme-dark', 'theme-light');
  if (theme === 'dark') document.body.classList.add('theme-dark');
  else if (theme === 'light') document.body.classList.add('theme-light');
  else document.body.classList.remove('theme-dark', 'theme-light');
  window.PI_SETTINGS.theme = theme;
  window.saveSettings();
};

// --- SETTINGS UI INIT ---
window.initSettingsUI = function() {
  const settingSound = document.getElementById('setting-sound');
  const settingAnimations = document.getElementById('setting-animations');
  const settingLeaderboard = document.getElementById('setting-leaderboard'); // new
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettings = document.getElementById('close-settings');
  const themeSelect = document.getElementById('theme-select');

  if (settingSound) {
    settingSound.addEventListener('change', () => {
      window.PI_SETTINGS.sound = settingSound.checked;
      window.saveSettings();
    });
  }
  if (settingAnimations) {
    settingAnimations.addEventListener('change', () => {
      window.PI_SETTINGS.animations = settingAnimations.checked;
      window.saveSettings();
    });
  }
  if (settingLeaderboard) {
    settingLeaderboard.addEventListener('change', () => {
      window.PI_SETTINGS.leaderboard = settingLeaderboard.checked;
      window.saveSettings();
    });
  }
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      window.applyTheme(themeSelect.value);
    });
  }
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      window.loadSettings();
      settingsModal.style.display = "flex";
      createSoundSettingsUI(); // Call to create sound settings UI
      settingsModal.setAttribute('tabindex', '-1');
      settingsModal.focus();
    });
  }
  if (closeSettings && settingsModal) {
    closeSettings.addEventListener('click', () => {
      settingsModal.style.display = "none";
      settingsBtn && settingsBtn.focus();
    });
    settingsModal.addEventListener('click', function(e) {
      if (e.target === settingsModal) {
        settingsModal.style.display = "none";
        settingsBtn && settingsBtn.focus();
      }
    });
    // Trap focus inside modal
    settingsModal.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        const focusable = settingsModal.querySelectorAll('button, [tabindex="0"], input, select, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        settingsModal.style.display = "none";
        settingsBtn && settingsBtn.focus();
      }
    });
  }
};

// --- SOUND SETTINGS UI ---
function createSoundSettingsUI() {
  const container = document.createElement('div');
  container.className = 'settings-section';

  // Mute toggle
  const muteLabel = document.createElement('label');
  muteLabel.textContent = 'Mute Sound';
  const muteCheckbox = document.createElement('input');
  muteCheckbox.type = 'checkbox';
  muteCheckbox.checked = window.soundManager.muted;
  muteCheckbox.addEventListener('change', () => {
    window.soundManager.setMuted(muteCheckbox.checked);
  });
  muteLabel.appendChild(muteCheckbox);

  // Volume slider
  const volumeLabel = document.createElement('label');
  volumeLabel.textContent = 'Volume';
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = 0;
  volumeSlider.max = 1;
  volumeSlider.step = 0.01;
  volumeSlider.value = window.soundManager.volume;
  volumeSlider.addEventListener('input', () => {
    window.soundManager.setVolume(parseFloat(volumeSlider.value));
  });
  volumeLabel.appendChild(volumeSlider);

  container.appendChild(muteLabel);
  container.appendChild(volumeLabel);

  // Insert into settings modal
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.appendChild(container);
  }
}

// --- INITIALIZE SETTINGS ON DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  window.initSettingsUI();
  window.loadSettings();
  // Always apply theme on load (from pi_theme or settings)
  window.applyTheme(window.PI_SETTINGS.theme);
});
