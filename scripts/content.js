(() => {
  const SETTINGS_KEY = 'psSpeedHoverSettings';
  const DEFAULTS = {
    level: 100,
    showMinSpeed: false,
    showPlusOne: false,
    showPlusTwo: false,
    showMinusOne: false,
    compactTooltip: false,
    coloredLabels: true,
  };

  // Forward popup settings into the page context where Showdown data is available.
  function dispatchSettings(settings) {
    window.dispatchEvent(new CustomEvent('ps-speed-settings', {
      detail: { ...DEFAULTS, ...(settings || {}) }
    }));
  }

  async function sendInitialSettings() {
    try {
      const stored = await chrome.storage.local.get(SETTINGS_KEY);
      dispatchSettings(stored[SETTINGS_KEY] || DEFAULTS);
    } catch {
      dispatchSettings(DEFAULTS);
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[SETTINGS_KEY]) return;
    dispatchSettings(changes[SETTINGS_KEY].newValue || DEFAULTS);
  });

  window.addEventListener('ps-speed-settings-request', sendInitialSettings);

  // Inject into the page so we can read Showdown's own runtime objects.
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('scripts/injected.js');
  script.onload = () => {
    script.remove();
    sendInitialSettings();
  };
  (document.head || document.documentElement).appendChild(script);
})();
