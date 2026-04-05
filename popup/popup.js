const DEFAULTS = {
  level: 100,
  showMinSpeed: false,
  showPlusOne: false,
  showPlusTwo: false,
  showMinusOne: false,
  compactTooltip: false,
  coloredLabels: true,
};

const ids = ['level', 'showMinSpeed', 'showPlusOne', 'showPlusTwo', 'showMinusOne', 'compactTooltip', 'coloredLabels'];
const statusEl = document.getElementById('status');
let statusTimer = null;

function setStatus(text) {
  statusEl.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusEl.textContent = '';
  }, 1400);
}

// Read and sanitize the popup values before saving.
function readForm() {
  const level = Math.max(1, Math.min(100, parseInt(document.getElementById('level').value, 10) || DEFAULTS.level));
  document.getElementById('level').value = String(level);
  return {
    level,
    showMinSpeed: document.getElementById('showMinSpeed').checked,
    showPlusOne: document.getElementById('showPlusOne').checked,
    showPlusTwo: document.getElementById('showPlusTwo').checked,
    showMinusOne: document.getElementById('showMinusOne').checked,
    compactTooltip: document.getElementById('compactTooltip').checked,
    coloredLabels: document.getElementById('coloredLabels').checked,
  };
}

async function save() {
  const settings = readForm();
  await chrome.storage.local.set({ psSpeedHoverSettings: settings });
  setStatus('Synced');
}

async function init() {
  const stored = await chrome.storage.local.get('psSpeedHoverSettings');
  const settings = { ...DEFAULTS, ...(stored.psSpeedHoverSettings || {}) };
  document.getElementById('level').value = String(settings.level);
  document.getElementById('showMinSpeed').checked = !!settings.showMinSpeed;
  document.getElementById('showPlusOne').checked = !!settings.showPlusOne;
  document.getElementById('showPlusTwo').checked = !!settings.showPlusTwo;
  document.getElementById('showMinusOne').checked = !!settings.showMinusOne;
  document.getElementById('compactTooltip').checked = !!settings.compactTooltip;
  document.getElementById('coloredLabels').checked = !!settings.coloredLabels;

  ids.forEach(id => {
    document.getElementById(id).addEventListener('input', save);
    document.getElementById(id).addEventListener('change', save);
  });
}

init();
