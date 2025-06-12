window.PI_SETTINGS = {
  sound: true,
  animations: true,
  theme: 'neon'
};

window.loadSettings = function() {
  const saved = JSON.parse(localStorage.getItem('pi_settings') || '{}');
  window.PI_SETTINGS.sound = saved.sound !== false;
  window.PI_SETTINGS.animations = saved.animations !== false;
  window.PI_SETTINGS.theme = saved.theme || 'neon';
  const settingSound = document.getElementById('setting-sound');
  const settingAnimations = document.getElementById('setting-animations');
  const themeSelect = document.getElementById('theme-select');
  if (settingSound) settingSound.checked = window.PI_SETTINGS.sound;
  if (settingAnimations) settingAnimations.checked = window.PI_SETTINGS.animations;
  if (themeSelect) themeSelect.value = window.PI_SETTINGS.theme;
  window.applyTheme(window.PI_SETTINGS.theme);
};

window.saveSettings = function() {
  localStorage.setItem('pi_settings', JSON.stringify(window.PI_SETTINGS));
};

window.applyTheme = function(theme) {
  document.body.classList.remove('theme-neon', 'theme-dark');
  document.body.classList.add('theme-' + theme);
  window.PI_SETTINGS.theme = theme;
  window.saveSettings();
};

window.initSettingsUI = function() {
  const settingSound = document.getElementById('setting-sound');
  const settingAnimations = document.getElementById('setting-animations');
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
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      window.applyTheme(themeSelect.value);
    });
  }
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      window.loadSettings();
      settingsModal.style.display = "flex";
    });
  }
  if (closeSettings && settingsModal) {
    closeSettings.addEventListener('click', () => {
      settingsModal.style.display = "none";
    });
    settingsModal.addEventListener('click', function(e) {
      if (e.target === settingsModal) settingsModal.style.display = "none";
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.initSettingsUI();
  window.loadSettings();
});
