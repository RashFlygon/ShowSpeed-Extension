(() => {
  // Shared IDs/keys used by the tooltip and the speed creep UI.
  const STYLE_ID = 'ps-speed-hover-style';
  const TOOLTIP_ID = 'ps-speed-hover-tooltip';
  const BOUND_ATTR = 'data-ps-speed-bound';
  const CREEP_BOX_ID = 'ps-speed-creep-box';
  const CREEP_STATE_KEY = 'psSpeedHoverCreepState';
  const SUGGEST_BOX_ID = 'ps-speed-creep-suggest';
  const JUMP_POINTS_KEY = 'psSpeedHoverShowJumpPoints';
  const JUMP_TOGGLE_ID = 'ps-speed-jump-toggle';
  const JUMP_OVERLAY_CLASS = 'ps-speed-jump-overlay';
  const STAT_ORDER = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const DEFAULTS = {
    level: 100,
    showMinSpeed: false,
    showPlusOne: false,
    showPlusTwo: false,
    showMinusOne: false,
    compactTooltip: false,
    coloredLabels: true,
    defaultChampionsMode: false,
  };
  const CHAMPIONS_LEVEL = 50;
  const CHAMPIONS_IV = 31;
  const CHAMPIONS_MAX_POINTS = 32;
  const CHAMPIONS_MODE_TEXT = 'Champions mode';

  let settings = { ...DEFAULTS };
  let tooltipEl = null;
  let activeTarget = null;
  let raf = 0;

  // Styles
  // Inject the extension styles once so Showdown rerenders do not duplicate them.
  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ps-speed-hover-target { cursor: help; }
      .ps-speed-hover-hint {
        border-bottom: 1px dotted rgba(255,255,255,.55);
        padding-bottom: 1px;
      }
      #${TOOLTIP_ID} {
        position: fixed;
        left: 0;
        top: 0;
        display: none;
        min-width: 154px;
        max-width: min(260px, calc(100vw - 16px));
        background: rgba(20, 20, 20, 0.96);
        color: #fff;
        padding: 6px 8px;
        border-radius: 7px;
        font-family: Verdana, Helvetica, Arial, sans-serif;
        font-size: 10.5px;
        line-height: 1.18;
        z-index: 2147483647;
        box-shadow: 0 5px 14px rgba(0, 0, 0, 0.26);
        pointer-events: none;
      }
      #${TOOLTIP_ID}.compact {
        min-width: 146px;
        max-width: min(240px, calc(100vw - 16px));
        padding: 5px 7px;
        font-size: 10px;
        line-height: 1.15;
      }
      #${TOOLTIP_ID} .psh-header {
        font-weight: 700;
        margin-bottom: 2px;
        white-space: nowrap;
      }
      #${TOOLTIP_ID}.compact .psh-header {
        margin-bottom: 2px;
      }
      #${TOOLTIP_ID} .psh-section { margin-top: 3px; }
      #${TOOLTIP_ID} .psh-section:first-of-type { margin-top: 0; }
      #${TOOLTIP_ID}.compact .psh-section { margin-top: 2px; }
      #${TOOLTIP_ID} .psh-section-title {
        font-weight: 700;
        margin-bottom: 1px;
        opacity: .95;
        font-size: 10px;
      }
      #${TOOLTIP_ID}.compact .psh-section-title {
        font-size: 9.5px;
      }
      #${TOOLTIP_ID} .psh-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 7px;
        margin: 0;
      }
      #${TOOLTIP_ID}.compact .psh-row {
        gap: 6px;
        margin: 0;
      }
      #${TOOLTIP_ID} .psh-label { opacity: .96; }
      #${TOOLTIP_ID} .psh-value {
        font-weight: 700;
        white-space: nowrap;
      }
      #${TOOLTIP_ID} .psh-num-plus-spe { color: #bbf7d0; }
      #${TOOLTIP_ID} .psh-num-neutral { color: #bfdbfe; }
      #${TOOLTIP_ID} .psh-num-unboosted { color: #fde68a; }
      #${TOOLTIP_ID} .psh-num-minimum { color: #fecaca; }
      #${TOOLTIP_ID} .psh-num-current { color: #ddd6fe; }

      #${CREEP_BOX_ID} {
        --pssc-bg: rgba(12, 18, 26, 0.74);
        --pssc-surface: rgba(255,255,255,.06);
        --pssc-surface-strong: rgba(255,255,255,.1);
        --pssc-border: rgba(255,255,255,.14);
        --pssc-text: #f4f8fc;
        --pssc-muted: rgba(244,248,252,.82);
        --pssc-placeholder: rgba(244,248,252,.45);
        --pssc-input-bg: rgba(0,0,0,.24);
        --pssc-input-border: rgba(255,255,255,.14);
        --pssc-status: #dbeafe;
        --pssc-help: #ffb1b1;
        --pssc-targetspeed: #dbeafe;
        --pssc-button-text: #143019;
        --pssc-button-border: #84b789;
        --pssc-button-bg-top: #dff8d8;
        --pssc-button-bg-bottom: #bfe7b9;
        margin-top: 8px;
        padding: 8px 10px 9px;
        border: 1px solid var(--pssc-border);
        border-radius: 10px;
        background: var(--pssc-bg);
        color: var(--pssc-text);
        font: 11px Verdana, Helvetica, Arial, sans-serif;
        max-width: 560px;
        box-shadow: 0 10px 24px rgba(0,0,0,.12);
        backdrop-filter: blur(6px);
      }
      #${CREEP_BOX_ID} .pssc-title {
        font-weight: 700;
        color: var(--pssc-text);
        white-space: nowrap;
        font-size: 11px;
        min-width: 72px;
      }
      #${CREEP_BOX_ID} .pssc-row {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
      }
      #${CREEP_BOX_ID} .pssc-row + .pssc-row {
        margin-top: 6px;
      }
      #${CREEP_BOX_ID} input,
      #${CREEP_BOX_ID} select,
      #${CREEP_BOX_ID} button {
        font: 11px Verdana, Arial, sans-serif;
        border-radius: 4px;
        box-sizing: border-box;
      }
      #${CREEP_BOX_ID} input,
      #${CREEP_BOX_ID} select {
        height: 28px;
        padding: 2px 7px;
        color: var(--pssc-text);
        border: 1px solid var(--pssc-input-border);
        background: var(--pssc-input-bg);
        min-width: 0;
      }
      #${CREEP_BOX_ID} input::placeholder {
        color: var(--pssc-placeholder);
      }
      #${CREEP_BOX_ID} .pssc-target-wrap {
        flex: 1 1 180px;
        min-width: 160px;
      }
      #${CREEP_BOX_ID} .pssc-target {
        width: 100%;
      }
      #${CREEP_BOX_ID} .pssc-level { width: 64px; }
      #${CREEP_BOX_ID} .pssc-tier { width: 154px; }
      #${CREEP_BOX_ID} .pssc-targetspeed {
        color: var(--pssc-targetspeed);
        white-space: nowrap;
        font-weight: 700;
        min-width: 0;
      }
      #${CREEP_BOX_ID} .pssc-selfboost-wrap {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }
      #${CREEP_BOX_ID} .pssc-selfboost-wrap span {
        color: var(--pssc-muted);
      }
      #${CREEP_BOX_ID} .pssc-selfboost { width: 86px; }
      #${CREEP_BOX_ID} .pssc-actions {
        display: inline-flex;
        align-items: center;
        margin-left: auto;
      }
      #${CREEP_BOX_ID} button {
        height: 30px;
        padding: 0 10px;
        min-width: 0;
        width: auto;
        color: var(--pssc-button-text);
        font-weight: 700;
        border: 1px solid var(--pssc-button-border);
        background: linear-gradient(to bottom, var(--pssc-button-bg-top), var(--pssc-button-bg-bottom));
        cursor: pointer;
      }
      #${CREEP_BOX_ID} button:hover {
        filter: brightness(1.06);
      }
      #${CREEP_BOX_ID} .pssc-apply {
        min-width: 62px;
      }
      #${CREEP_BOX_ID} .pssc-boosts {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--pssc-muted);
      }
      #${CREEP_BOX_ID} .pssc-boosts label {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      }
      #${CREEP_BOX_ID} .pssc-boosts input {
        width: 12px;
        height: 12px;
        margin: 0;
      }
      #${CREEP_BOX_ID} .pssc-mode {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--pssc-muted);
        white-space: nowrap;
      }
      #${CREEP_BOX_ID} .pssc-mode input {
        width: 12px;
        height: 12px;
        margin: 0;
      }
      #${CREEP_BOX_ID} .pssc-suggest-wrap { position: relative; }
      .pssc-suggest {
        position: fixed;
        min-width: 180px;
        z-index: 2147483646;
        background: var(--pssc-bg);
        color: var(--pssc-text);
        border: 1px solid var(--pssc-border);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,.18);
        backdrop-filter: blur(8px);
        display: none;
        max-height: 180px;
        overflow: auto;
      }
      .pssc-suggest.is-open { display: block; }
      .pssc-suggest-item {
        padding: 4px 7px;
        cursor: pointer;
        font: 11px Verdana, Arial, sans-serif;
      }
      .pssc-suggest-item:hover,
      .pssc-suggest-item.is-active {
        background: rgba(255,255,255,.13);
        color: #fde68a;
      }
      .pssc-suggest-item.is-current {
        background: rgba(194,100,28,.14);
        color: #d97706;
        font-weight: 700;
      }
      .pssc-suggest-item.is-current:hover,
      .pssc-suggest-item.is-current.is-active {
        background: rgba(194,100,28,.22);
        color: #f59e0b;
      }
      #${CREEP_BOX_ID} .pssc-help {
        margin-top: 4px;
        min-height: 12px;
        color: var(--pssc-help);
        font-size: 10px;
      }
      #${CREEP_BOX_ID} .pssc-status {
        margin-top: 2px;
        min-height: 12px;
        color: var(--pssc-status);
        font-size: 10px;
      }
      #${CREEP_BOX_ID} .pssc-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 8px;
        margin-top: 4px;
      }
      #${CREEP_BOX_ID} .pssc-messages {
        min-width: 0;
        flex: 1 1 auto;
      }
      #${CREEP_BOX_ID} .pssc-footer-left {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        min-width: 0;
        flex: 1 1 auto;
      }
      #${CREEP_BOX_ID}.compact-ui .pssc-row {
        gap: 5px;
      }
      #${CREEP_BOX_ID}.compact-ui .pssc-title {
        min-width: 0;
        width: 100%;
      }
      #${CREEP_BOX_ID}.compact-ui .pssc-target-wrap {
        flex-basis: 100%;
      }
      #${CREEP_BOX_ID}.compact-ui .pssc-tier {
        width: 146px;
      }
      #${CREEP_BOX_ID}.compact-ui .pssc-selfboost-wrap {
        gap: 4px;
      }
      #${CREEP_BOX_ID}.compact-ui .pssc-selfboost {
        width: 82px;
      }
      .ps-speed-scarf-indicator {
        margin-left: 6px;
        color: #9ee37d;
        font-weight: 700;
      }
      #${JUMP_TOGGLE_ID} {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        padding: 4px 8px;
        border: 1px solid rgba(159,202,228,.12);
        border-radius: 8px;
        background: rgba(255,255,255,.04);
        color: rgba(255,255,255,.9);
        font: 11px Verdana, Arial, sans-serif;
        white-space: nowrap;
        user-select: none;
        cursor: pointer;
      }
      #${JUMP_TOGGLE_ID} input {
        width: 12px;
        height: 12px;
        margin: 0;
        cursor: pointer;
      }
      #${JUMP_TOGGLE_ID}:hover {
        background: rgba(255,255,255,.06);
        border-color: rgba(126,227,255,.22);
      }
      .${JUMP_OVERLAY_CLASS} {
        position: absolute;
        height: 14px;
        pointer-events: none;
        z-index: 3;
      }
      .${JUMP_OVERLAY_CLASS} .ps-speed-jump-marker {
        position: absolute;
        top: 50%;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #63d6e8;
        transform: translate(-50%, -50%);
        cursor: pointer;
        pointer-events: auto;
        transition:
          transform 150ms cubic-bezier(.2, 1.2, .35, 1),
          border-color 120ms ease,
          box-shadow 170ms ease,
          background 120ms ease;
        border: 1px solid rgba(0,0,0,.32);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.38),
          0 0 4px rgba(99,214,232,.42);
      }
      .${JUMP_OVERLAY_CLASS} .ps-speed-jump-marker::before {
        content: '';
        position: absolute;
        inset: -5px;
        border-radius: 50%;
      }
      .${JUMP_OVERLAY_CLASS} .ps-speed-jump-marker:hover {
        background: #85e5f1;
        border-color: #000;
        box-shadow:
          0 0 0 1px rgba(255,255,255,.58),
          0 0 6px rgba(99,214,232,.5);
        transform: translate(-50%, -50%) scale(1.25);
      }
      .${JUMP_OVERLAY_CLASS} .ps-speed-jump-marker:active {
        transform: translate(-50%, -50%) scale(1.12);
      }
      .${JUMP_OVERLAY_CLASS} .ps-speed-jump-marker.is-snapping {
        animation: ps-speed-jump-snap 260ms cubic-bezier(.2, 1.15, .35, 1);
      }
      @keyframes ps-speed-jump-snap {
        0% { transform: translate(-50%, -50%) scale(1); }
        45% { transform: translate(-50%, -50%) scale(1.32); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTooltip() {
    if (tooltipEl && document.contains(tooltipEl)) return tooltipEl;
    tooltipEl = document.createElement('div');
    tooltipEl.id = TOOLTIP_ID;
    document.documentElement.appendChild(tooltipEl);
    return tooltipEl;
  }

  // Showdown data and speed math
  function getDex() {
    return window.Dex || null;
  }

  function getSpeciesFromName(name) {
    const dex = getDex();
    if (!dex?.species?.get || !name) return null;
    try {
      const species = dex.species.get(name);
      if (species?.exists && species.baseStats?.spe != null) return species;
    } catch {}
    return null;
  }

  function getCurrentSpecies() {
    const selectors = [
      'input[name="pokemon"]',
      '.setcell-pokemon input',
      '.setcell-pokemon .chartinput',
      '.teamchart input[name="pokemon"]',
      '.teambuilder-results input[name="pokemon"]'
    ];
    for (const selector of selectors) {
      const input = document.querySelector(selector);
      const value = input?.value?.trim();
      const species = getSpeciesFromName(value);
      if (species) return species;
    }
    return null;
  }

  function getCurrentItemName() {
    const selectors = [
      'input[name="item"]',
      '.setcell-item input',
      '.setcell-item .chartinput',
      '.teamchart input[name="item"]'
    ];
    for (const selector of selectors) {
      const input = document.querySelector(selector);
      const value = input?.value?.trim();
      if (value) return value;
    }
    return '';
  }

  function hasChoiceScarf() {
    return toID(getCurrentItemName()) === 'choicescarf';
  }

  function isChampionsFormatName(text) {
    return /\[champions\]|^champions/i.test(String(text || '').trim());
  }

  function getTextValue(el) {
    if (!el) return '';
    if (el.tagName === 'SELECT') {
      return el.selectedOptions?.[0]?.textContent?.trim() || el.value || '';
    }
    const text = el.textContent?.trim() || '';
    if (isChampionsFormatName(text)) return text;
    if (el.tagName === 'BUTTON') return text || el.value || '';
    if ('value' in el && typeof el.value === 'string' && el.value.trim()) return el.value.trim();
    return text;
  }

  function getCurrentTeambuilderRoom() {
    const rooms = window.app?.rooms || {};
    for (const id of Object.keys(rooms)) {
      const room = rooms[id];
      if (room?.type === 'teambuilder' && room.curTeam) return room;
    }
    return null;
  }

  function getFormatCandidatesFromId(formatId) {
    const id = String(formatId || '').trim();
    if (!id) return [];
    const candidates = [id];
    const format = window.BattleFormats?.[id] || window.BattleFormats?.[toID(id)];
    if (format) {
      candidates.push(format.name, format.section, format.searchShow, format.team, format.challengeShow);
    }
    try {
      if (window.BattleLog?.escapeFormat) candidates.push(window.BattleLog.escapeFormat(id));
    } catch {}
    return candidates.filter(Boolean).map(value => String(value).replace(/<[^>]*>/g, '').trim());
  }

  function getCurrentFormatName() {
    let fallback = '';
    const teambuilderRoom = getCurrentTeambuilderRoom();
    for (const text of getFormatCandidatesFromId(teambuilderRoom?.curTeam?.format)) {
      if (isChampionsFormatName(text)) return text;
      if (!fallback) fallback = text;
    }

    const selectors = [
      'input[name="format"]',
      'select[name="format"]',
      'select',
      'button[name="format"]',
      'button.formatselect',
      '.formatselect',
      '.teambuilder-format input',
      '.teambuilder-format button',
      '.teamedit input[name="format"]',
      '.teamedit button[name="format"]',
      '.folderlist .cur',
      '.folderpane .cur'
    ];
    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        const text = getTextValue(el);
        if (!text) continue;
        if (isChampionsFormatName(text)) return text;
        if (!fallback) fallback = text;
      }
    }
    return fallback;
  }

  function isChampionsModeActive() {
    return isChampionsFormatName(getCurrentFormatName()) || !!settings.defaultChampionsMode;
  }

  function isCurrentChampionsFormat() {
    return isChampionsFormatName(getCurrentFormatName());
  }

  function clampLevel(level) {
    return Math.max(1, Math.min(100, Number(level) || 100));
  }

  function clampEv(ev) {
    return Math.max(0, Math.min(252, Number(ev) || 0));
  }

  function clampIv(iv) {
    return Math.max(0, Math.min(31, Number(iv) || 0));
  }

  function clampChampionsPoints(points) {
    return Math.max(0, Math.min(CHAMPIONS_MAX_POINTS, Number(points) || 0));
  }

  function championsPointsToEv(points) {
    return Math.floor((clampChampionsPoints(points) * 252) / CHAMPIONS_MAX_POINTS);
  }

  function getModeState(options = {}) {
    const championsMode = options.championsMode ?? isChampionsModeActive();
    return {
      championsMode,
      level: championsMode ? CHAMPIONS_LEVEL : clampLevel(options.level ?? settings.level ?? 100),
      iv: championsMode ? CHAMPIONS_IV : clampIv(options.iv ?? 31),
      maxInvestment: championsMode ? CHAMPIONS_MAX_POINTS : 252,
      investmentLabel: championsMode ? 'Stat Points' : 'EVs',
    };
  }

  function investmentToEv(investment, mode) {
    return mode.championsMode ? championsPointsToEv(investment) : clampEv(investment);
  }

  function calcSpeed(base, investment = 0, iv = 31, nature = 1, options = {}) {
    const mode = getModeState({ ...options, iv });
    const lvl = mode.level;
    const actualIv = mode.iv;
    const ev = investmentToEv(investment, mode);
    const raw = Math.floor(((2 * base + actualIv + Math.floor(ev / 4)) * lvl) / 100) + 5;
    return Math.floor(raw * nature);
  }

  function calcRawNonHpStat(base, investment = 0, iv = 31, options = {}) {
    const mode = getModeState({ ...options, iv });
    const ev = investmentToEv(investment, mode);
    return Math.floor(((2 * base + mode.iv + Math.floor(ev / 4)) * mode.level) / 100) + 5;
  }

  function applyModifier(speed, key) {
    switch (key) {
      case 'plusOne': return Math.floor(speed * 1.5);
      case 'plusTwo': return Math.floor(speed * 2);
      case 'minusOne': return Math.floor(speed * 2 / 3);
      default: return speed;
    }
  }

  function getNatureMultiplier(natureName, stat) {
    const natures = window.BattleNatures || {};
    const nature = natures[natureName || 'Serious'] || {};
    if (nature.plus === stat) return 1.1;
    if (nature.minus === stat) return 0.9;
    return 1.0;
  }

  function baseLines(species) {
    const base = species.baseStats.spe;
    const lines = [
      { label: 'Positive 252 speed', value: calcSpeed(base, 252, 31, 1.1) },
      { label: 'Neutral 252', value: calcSpeed(base, 252, 31, 1.0) },
      { label: 'Unboosted', value: calcSpeed(base, 0, 31, 1.0) },
    ];
    if (settings.showMinSpeed) lines.push({ label: 'Minimum', value: calcSpeed(base, 0, 0, 0.9) });
    return lines;
  }

  function valueClass(label) {
    return {
      'Positive 252 speed': 'psh-num-plus-spe',
      'Neutral 252': 'psh-num-neutral',
      'Unboosted': 'psh-num-unboosted',
      'Minimum': 'psh-num-minimum',
      'Current set': 'psh-num-current',
    }[label] || '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderRows(rows) {
    return rows.map(row => {
      const cls = settings.coloredLabels ? valueClass(row.label) : '';
      const valueHtml = cls
        ? `<span class="${cls}">${escapeHtml(row.value)}</span>`
        : escapeHtml(row.value);
      return `<div class="psh-row"><div class="psh-label">${escapeHtml(row.label)}</div><div class="psh-value">${valueHtml}</div></div>`;
    }).join('');
  }

  function buildTooltip(species, currentSpeed = null) {
    const level = clampLevel(settings.level);
    const tiers = baseLines(species);
    let html = `<div class="psh-header">${escapeHtml(species.name)} — Base Spe ${escapeHtml(species.baseStats.spe)} (Lv ${escapeHtml(level)})</div>`;
    html += `<div class="psh-section">${renderRows(tiers)}</div>`;
    if (settings.showPlusOne) {
      html += `<div class="psh-section"><div class="psh-section-title">+1 Speed</div>${renderRows(tiers.map(line => ({ label: line.label, value: applyModifier(line.value, 'plusOne') })))}</div>`;
    }
    if (settings.showPlusTwo) {
      html += `<div class="psh-section"><div class="psh-section-title">+2 Speed</div>${renderRows(tiers.map(line => ({ label: line.label, value: applyModifier(line.value, 'plusTwo') })))}</div>`;
    }
    if (settings.showMinusOne) {
      html += `<div class="psh-section"><div class="psh-section-title">-1 Speed</div>${renderRows(tiers.map(line => ({ label: line.label, value: applyModifier(line.value, 'minusOne') })))}</div>`;
    }
    if (currentSpeed != null) {
      html += `<div class="psh-section">${renderRows([{ label: 'Current set', value: currentSpeed }])}</div>`;
    }
    return html;
  }

  function buildModeRows(species, options = {}) {
    const mode = getModeState(options);
    const base = species.baseStats.spe;
    const rows = [
      {
        label: mode.championsMode ? 'Positive max speed' : 'Positive 252 speed',
        value: calcSpeed(base, mode.maxInvestment, mode.iv, 1.1, mode),
        tone: 'plus-spe',
      },
      {
        label: mode.championsMode ? 'Neutral max' : 'Neutral 252',
        value: calcSpeed(base, mode.maxInvestment, mode.iv, 1.0, mode),
        tone: 'neutral',
      },
      {
        label: 'Unboosted',
        value: calcSpeed(base, 0, mode.iv, 1.0, mode),
        tone: 'unboosted',
      },
    ];
    if (settings.showMinSpeed) {
      rows.push({
        label: 'Minimum',
        value: calcSpeed(base, 0, mode.championsMode ? CHAMPIONS_IV : 0, 0.9, mode),
        tone: 'minimum',
      });
    }
    return rows;
  }

  function getModeValueClass(tone) {
    return {
      'plus-spe': 'psh-num-plus-spe',
      neutral: 'psh-num-neutral',
      unboosted: 'psh-num-unboosted',
      minimum: 'psh-num-minimum',
      current: 'psh-num-current',
    }[tone] || '';
  }

  function renderModeRows(rows) {
    return rows.map(row => {
      const cls = settings.coloredLabels ? getModeValueClass(row.tone) : '';
      const valueHtml = cls
        ? `<span class="${cls}">${escapeHtml(row.value)}</span>`
        : escapeHtml(row.value);
      return `<div class="psh-row"><div class="psh-label">${escapeHtml(row.label)}</div><div class="psh-value">${valueHtml}</div></div>`;
    }).join('');
  }

  function buildTooltipForMode(species, currentSpeed = null, options = {}) {
    const mode = getModeState(options);
    const tiers = buildModeRows(species, mode);
    const modeSuffix = mode.championsMode ? `, ${CHAMPIONS_MODE_TEXT}` : '';
    let html = `<div class="psh-header">${escapeHtml(species.name)} - Base Spe ${escapeHtml(species.baseStats.spe)} (Lv ${escapeHtml(mode.level)}${escapeHtml(modeSuffix)})</div>`;
    html += `<div class="psh-section">${renderModeRows(tiers)}</div>`;
    if (settings.showPlusOne) {
      html += `<div class="psh-section"><div class="psh-section-title">+1 Speed</div>${renderModeRows(tiers.map(line => ({ ...line, value: applyModifier(line.value, 'plusOne') })))}</div>`;
    }
    if (settings.showPlusTwo) {
      html += `<div class="psh-section"><div class="psh-section-title">+2 Speed</div>${renderModeRows(tiers.map(line => ({ ...line, value: applyModifier(line.value, 'plusTwo') })))}</div>`;
    }
    if (settings.showMinusOne) {
      html += `<div class="psh-section"><div class="psh-section-title">-1 Speed</div>${renderModeRows(tiers.map(line => ({ ...line, value: applyModifier(line.value, 'minusOne') })))}</div>`;
    }
    if (currentSpeed != null) {
      html += `<div class="psh-section">${renderModeRows([{ label: 'Current set', value: currentSpeed, tone: 'current' }])}</div>`;
    }
    return html;
  }

  // Tooltip behavior
  function showTooltip(target, event) {
    const text = target?._psSpeedTooltip;
    if (!text) return;
    activeTarget = target;
    const el = ensureTooltip();
    el.innerHTML = text;
    el.classList.toggle('compact', !!settings.compactTooltip);
    el.style.display = 'block';
    positionTooltip(event, el, target);
  }

  function hideTooltip(target) {
    if (target && activeTarget && target !== activeTarget) return;
    activeTarget = null;
    if (tooltipEl) tooltipEl.style.display = 'none';
  }

  function isTooltipTargetHovered(target) {
    return !!(target && target.isConnected && target.matches(':hover'));
  }

  function syncTooltipVisibility(event) {
    if (!activeTarget) return;
    // Showdown can rerender under the cursor without firing a clean mouseleave.
    if (!isTooltipTargetHovered(activeTarget)) {
      hideTooltip(activeTarget);
      return;
    }
    positionTooltip(event, tooltipEl, activeTarget);
  }

  function positionTooltip(event, el = tooltipEl, target = activeTarget) {
    if (!el || !target) return;
    const margin = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const rect = target.getBoundingClientRect();
    let left = (event?.clientX ?? (rect.left + rect.right) / 2) + 14;
    let top = (event?.clientY ?? rect.bottom) + 14;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (left + width + margin > viewportW) left = Math.max(margin, (event?.clientX ?? rect.right) - width - 14);
    if (top + height + margin > viewportH) top = Math.max(margin, rect.top - height - 10);
    left = Math.max(margin, Math.min(left, viewportW - width - margin));
    top = Math.max(margin, Math.min(top, viewportH - height - margin));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function bindTooltip(el, text) {
    if (!el || !text) return;
    el.classList.add('ps-speed-hover-target');
    el._psSpeedTooltip = text;
    // Only bind listeners once even if Showdown redraws the same node a lot.
    if (el.getAttribute(BOUND_ATTR) === '1') return;
    el.addEventListener('mouseenter', (e) => showTooltip(el, e));
    el.addEventListener('mousemove', (e) => positionTooltip(e, tooltipEl, el));
    el.addEventListener('mouseleave', () => hideTooltip(el));
    el.addEventListener('blur', () => hideTooltip(el), true);
    el.setAttribute(BOUND_ATTR, '1');
  }

  function getDeepElements(root) {
    return Array.from(root.querySelectorAll('*')).filter(el => {
      if (!el || el.matches('script, style, input, select, option, textarea')) return false;
      // Prefer leaf-ish nodes so we match the visible stat text instead of container wrappers.
      return el.children.length === 0 || Array.from(el.children).every(c => !c.textContent?.trim());
    });
  }

  function findElementsByExactText(root, text) {
    const needle = String(text).trim();
    return getDeepElements(root).filter(el => (el.textContent || '').trim() === needle);
  }

  function scoreRightmost(el) {
    const rect = el.getBoundingClientRect();
    return rect.left + rect.width;
  }

  function addHoverHint(el) {
    if (el) el.classList.add('ps-speed-hover-hint');
  }

  function updateScarfIndicator(currentEl, currentSpeed) {
    if (!currentEl || currentSpeed == null) return;
    const next = currentEl.nextElementSibling;
    if (next?.classList?.contains('ps-speed-scarf-indicator')) next.remove();
    if (!hasChoiceScarf()) return;
    const scarfEl = document.createElement('span');
    scarfEl.className = 'ps-speed-scarf-indicator';
    scarfEl.textContent = String(Math.floor(currentSpeed * 1.5));
    currentEl.insertAdjacentElement('afterend', scarfEl);
  }

  function readJumpPointsVisible() {
    try {
      const value = localStorage.getItem(JUMP_POINTS_KEY);
      return value == null ? true : value === 'true';
    } catch {
      return true;
    }
  }

  function saveJumpPointsVisible(visible) {
    try { localStorage.setItem(JUMP_POINTS_KEY, visible ? 'true' : 'false'); } catch {}
  }

  function maybeBindJumpPointsToggle() {
    // Jump toggle is placed in the stat form area, not the team name area
    const statForm = document.querySelector('input[name="stat-spe"]')?.closest('.statform');
    if (!statForm) return;
    let toggle = document.getElementById(JUMP_TOGGLE_ID);
    if (!toggle) {
      toggle = document.createElement('label');
      toggle.id = JUMP_TOGGLE_ID;
      toggle.innerHTML = `<input type="checkbox" /> <span>Jump points</span>`;
      const input = toggle.querySelector('input');
      input.checked = readJumpPointsVisible();
      input.addEventListener('change', () => {
        saveJumpPointsVisible(input.checked);
        schedule();
      });
      // Insert at the top of the stat form
      statForm.insertAdjacentElement('beforebegin', toggle);
    } else {
      const input = toggle.querySelector('input');
      if (input) input.checked = readJumpPointsVisible();
    }
  }

  function clearJumpPointOverlays(root = document) {
    root.querySelectorAll(`.${JUMP_OVERLAY_CLASS}`).forEach(el => el.remove());
  }

  function getStatSlider(statForm, statInput, statId) {
    let node = statInput;
    for (let i = 0; i < 6 && node && node !== statForm; i++, node = node.parentElement) {
      const slider = node.querySelector?.('input.evslider');
      if (slider) return slider;
    }
    const sliders = Array.from(statForm.querySelectorAll('input.evslider'));
    return sliders[STAT_ORDER.indexOf(statId)] || null;
  }

  function getJumpPointInvestments(base, iv, mode) {
    const points = [];
    const step = mode.championsMode ? 1 : 4;
    let previousRaw = calcRawNonHpStat(base, 0, iv, mode);
    let previousBoosted = Math.floor(previousRaw * 1.1);
    for (let investment = step; investment <= mode.maxInvestment; investment += step) {
      const raw = calcRawNonHpStat(base, investment, iv, mode);
      const boosted = Math.floor(raw * 1.1);
      if ((boosted - previousBoosted) > (raw - previousRaw)) points.push(investment);
      previousRaw = raw;
      previousBoosted = boosted;
    }
    return points;
  }

  function renderJumpPointOverlay(slider, investments, maxInvestment) {
    if (!slider || !maxInvestment) return;
    const parent = slider.parentElement;
    if (!parent) return;
    if (!investments.length) {
      parent.querySelectorAll(`.${JUMP_OVERLAY_CLASS}`).forEach(el => el.remove());
      return;
    }
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const overlayHeight = 14;
    const left = slider.offsetLeft;
    const top = slider.offsetTop + (slider.offsetHeight / 2) - (overlayHeight / 2);
    const width = slider.offsetWidth;
    const signature = `${maxInvestment}:${left}:${top}:${width}:${investments.join(',')}`;
    const existing = parent.querySelector(`.${JUMP_OVERLAY_CLASS}`);
    if (existing?.dataset.signature === signature) return;
    if (existing) existing.remove();

    const overlay = document.createElement('span');
    overlay.className = JUMP_OVERLAY_CLASS;
    overlay.dataset.signature = signature;
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${width}px`;
    for (const investment of investments) {
      const marker = document.createElement('span');
      marker.className = 'ps-speed-jump-marker';
      marker.title = `Jump point: ${investment} ${maxInvestment === CHAMPIONS_MAX_POINTS ? 'Stat Points' : 'EVs'}`;
      marker.style.left = `${(investment / maxInvestment) * 100}%`;

      const snapToJumpPoint = () => {
        setNativeValue(slider, investment);
        triggerInput(slider);
        marker.classList.remove('is-snapping');
        void marker.offsetWidth;
        marker.classList.add('is-snapping');
      };

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        snapToJumpPoint();
      });

      overlay.appendChild(marker);
    }
    parent.appendChild(overlay);
  }

  function maybeRenderJumpPoints() {
    const species = getCurrentSpecies();
    const statForm = document.querySelector('input[name="stat-spe"]')?.closest('.statform');
    const natureSelect = document.querySelector('select[name="nature"]');
    if (!species || !statForm || !natureSelect) {
      clearJumpPointOverlays();
      return;
    }
    if (!readJumpPointsVisible()) {
      clearJumpPointOverlays(statForm);
      return;
    }

    const mode = getModeState();
    const activeSliderParents = new Set();
    for (const statId of STAT_ORDER) {
      if (statId === 'hp') continue;
      if (getNatureMultiplier(natureSelect.value, statId) <= 1) continue;
      const statInput = statForm.querySelector(`input[name="stat-${statId}"]`);
      const ivInput = statForm.querySelector(`input[name="iv-${statId}"]`);
      const slider = statInput ? getStatSlider(statForm, statInput, statId) : null;
      if (!slider) continue;
      activeSliderParents.add(slider.parentElement);
      const iv = mode.championsMode ? CHAMPIONS_IV : Math.max(0, parseInt(String(ivInput?.value || '').replace(/[^\d]/g, ''), 10) || 31);
      const investments = getJumpPointInvestments(species.baseStats[statId], iv, mode);
      renderJumpPointOverlay(slider, investments, mode.maxInvestment);
    }
    statForm.querySelectorAll(`.${JUMP_OVERLAY_CLASS}`).forEach(overlay => {
      if (!activeSliderParents.has(overlay.parentElement)) overlay.remove();
    });
  }

  function maybeBindSetView() {
    const species = getCurrentSpecies();
    const championsMode = isChampionsModeActive();
    if (!species) return;
    const statInput = document.querySelector('input[name="stat-spe"]');
    const ivInput = document.querySelector('input[name="iv-spe"]');
    const natureSelect = document.querySelector('select[name="nature"]');
    if (!statInput || !ivInput || !natureSelect) return;

    const statForm = statInput.closest('.statform') || statInput.closest('form') || document.body;
    const investment = Math.max(0, parseInt(String(statInput.value || '').replace(/[^\d]/g, ''), 10) || 0);
    const iv = championsMode ? CHAMPIONS_IV : Math.max(0, parseInt(String(ivInput.value || '').replace(/[^\d]/g, ''), 10) || 31);
    const natureMult = getNatureMultiplier(natureSelect.value, 'spe');
    const currentSpeed = calcSpeed(species.baseStats.spe, investment, iv, natureMult, { championsMode });
    const tooltip = buildTooltipForMode(species, currentSpeed, { championsMode });

    const speedLabelMatches = getDeepElements(statForm).filter(el => /^speed$/i.test((el.textContent || '').trim()));
    for (const el of speedLabelMatches) {
      bindTooltip(el, tooltip);
      addHoverHint(el);
    }

    const currentMatches = findElementsByExactText(statForm, currentSpeed);
    if (currentMatches.length) {
      const bestCurrent = currentMatches.sort((a, b) => scoreRightmost(b) - scoreRightmost(a))[0];
      updateScarfIndicator(bestCurrent, currentSpeed);
    }
  }

  // Search results
  function getRowSpecies(row) {
    const entry = row.getAttribute('data-entry') || '';
    if (entry.startsWith('pokemon|')) return getSpeciesFromName(entry.split('|')[1]);
    const href = row.getAttribute('href') || '';
    const match = href.match(/\/pokemon\/([^/?#]+)/i);
    if (match) return getSpeciesFromName(match[1]);
    const candidates = Array.from(row.querySelectorAll('a, b, strong, span, small, div'));
    for (const el of candidates) {
      const species = getSpeciesFromName((el.textContent || '').trim());
      if (species) return species;
    }
    return null;
  }

  function maybeBindSearchRows() {
    const rows = Array.from(document.querySelectorAll('.utilichart [data-entry^="pokemon|"], .utilichart a'));
    const championsMode = isChampionsModeActive();
    for (const row of rows) {
      const species = getRowSpecies(row);
      if (!species) continue;
      bindTooltip(row, buildTooltipForMode(species, null, { championsMode }));
    }
  }

  // Speed creep
  function readCreepState() {
    try {
      return JSON.parse(localStorage.getItem(CREEP_STATE_KEY) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveCreepState(partial) {
    const next = { ...readCreepState(), ...(partial || {}) };
    try { localStorage.setItem(CREEP_STATE_KEY, JSON.stringify(next)); } catch {}
  }

  function getTierTargetSpeed(species, tier, boost, options = {}) {
    const mode = getModeState(options);
    const base = species.baseStats.spe;
    let speed = tier === 'positive'
      ? calcSpeed(base, mode.maxInvestment, mode.iv, 1.1, mode)
      : tier === 'neutral'
        ? calcSpeed(base, mode.maxInvestment, mode.iv, 1.0, mode)
        : calcSpeed(base, 0, mode.iv, 1.0, mode);
    if (boost === 'plusTwo') return applyModifier(speed, 'plusTwo');
    if (boost === 'plusOne') return applyModifier(speed, 'plusOne');
    return speed;
  }

  function toID(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function getAllSpeciesNames() {
    const seen = new Set();
    const names = [];
    const add = (name, entry = null) => {
      const clean = String(name || '').trim();
      const id = toID(clean);
      if (!clean || !id || seen.has(id)) return;
      if (entry && (entry.exists === false || entry.isNonstandard === 'CAP' || entry.isNonstandard === 'Custom')) return;
      seen.add(id);
      names.push(clean);
    };

    try {
      const bp = window.BattlePokedex || {};
      for (const key of Object.keys(bp)) {
        const entry = bp[key];
        add(entry?.name || entry?.species || key, entry);
      }
    } catch {}

    try {
      const dexData = window.Dex?.data?.Pokedex || {};
      for (const key of Object.keys(dexData)) {
        const entry = dexData[key];
        add(entry?.name || entry?.species || key, entry);
      }
    } catch {}

    names.sort((a, b) => a.localeCompare(b));
    return names;
  }

  function getSpeciesSuggestions(query, limit = 8) {
    const q = toID(query);
    const out = [];
    const seen = new Set();

    const addItem = (name) => {
      const clean = String(name || '').trim();
      const id = toID(clean);
      if (!clean || !id || seen.has(id)) return;
      out.push(clean);
      seen.add(id);
    };

    const names = getAllSpeciesNames();
    const starts = [];
    const contains = [];
    for (const name of names) {
      const id = toID(name);
      if (!id || seen.has(id)) continue;
      if (id.startsWith(q)) starts.push(name);
      else if (id.includes(q)) contains.push(name);
      if (starts.length + contains.length >= limit * 3) break;
    }
    starts.slice(0, limit).forEach(name => addItem(name));
    contains.slice(0, Math.max(0, limit - out.length)).forEach(name => addItem(name));
    return out.slice(0, limit);
  }

  function ensureSuggestOverlay() {
    let box = document.getElementById(SUGGEST_BOX_ID);
    if (box) return box;
    box = document.createElement('div');
    box.id = SUGGEST_BOX_ID;
    box.className = 'pssc-suggest';
    document.body.appendChild(box);
    return box;
  }

  function positionSuggestBox(input, box) {
    if (!input || !box) return;
    const rect = input.getBoundingClientRect();
    box.style.position = 'fixed';
    box.style.left = `${Math.max(8, rect.left)}px`;
    box.style.top = `${Math.min(window.innerHeight - 12, rect.bottom + 2)}px`;
    box.style.width = `${Math.max(180, rect.width)}px`;
    box.style.zIndex = '2147483646';
  }

  function closeSuggest(box) {
    if (!box) return;
    box.classList.remove('is-open');
    box.innerHTML = '';
    box.dataset.activeIndex = '-1';
  }

  function openSuggest(box, items, onPick, currentQuery = '') {
    if (!box) return;
    if (!items.length) {
      closeSuggest(box);
      return;
    }
    const currentId = toID(currentQuery);
    box.innerHTML = items.map((name, idx) =>
      `<div class="pssc-suggest-item${idx===0?' is-active':''}${currentId && toID(name) === currentId ? ' is-current' : ''}" data-name="${escapeHtml(name)}" data-index="${idx}">${escapeHtml(name)}</div>`
    ).join('');
    box.classList.add('is-open');
    box.dataset.activeIndex = '0';
    for (const item of box.querySelectorAll('.pssc-suggest-item')) {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onPick(item.getAttribute('data-name') || item.textContent || '');
      });
    }
  }

  function moveSuggest(box, delta) {
    if (!box?.classList.contains('is-open')) return;
    const items = Array.from(box.querySelectorAll('.pssc-suggest-item'));
    if (!items.length) return;
    let idx = parseInt(box.dataset.activeIndex || '0', 10);
    idx = Number.isFinite(idx) ? idx : 0;
    idx = (idx + delta + items.length) % items.length;
    box.dataset.activeIndex = String(idx);
    items.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  function pickActiveSuggest(box, onPick) {
    if (!box?.classList.contains('is-open')) return false;
    const idx = parseInt(box.dataset.activeIndex || '0', 10);
    const item = box.querySelector(`.pssc-suggest-item[data-index="${idx}"]`);
    if (!item) return false;
    onPick(item.getAttribute('data-name') || item.textContent || '');
    return true;
  }

  function findSpeedCreepInvestment(ownSpecies, iv, natureMult, targetSpeed, selfBoost = 'none', options = {}) {
    const mode = getModeState({ ...options, iv });
    const step = mode.championsMode ? 1 : 4;
    for (let investment = 0; investment <= mode.maxInvestment; investment += step) {
      const ownSpeed = applyModifier(calcSpeed(ownSpecies.baseStats.spe, investment, mode.iv, natureMult, mode), selfBoost);
      if (ownSpeed > targetSpeed) return investment;
    }
    return null;
  }

  function getSpeedNatureSuffix(select) {
    const mult = getNatureMultiplier(select?.value, 'spe');
    if (mult > 1) return '+';
    if (mult < 1) return '-';
    return '';
  }

  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    // Use the native setter so Showdown notices the change like a real user edit.
    if (desc?.set) desc.set.call(el, value);
    else el.value = value;
  }

  function setSpeedInvestmentInputValue(statInput, value, natureSelect) {
    const suffix = getSpeedNatureSuffix(natureSelect);
    setNativeValue(statInput, `${value}${suffix}`);
  }

  function triggerInput(el) {
    // Showdown listens to a few different events before it fully accepts stat changes.
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: '0' }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function findNatureRowAnchor(natureSelect) {
    let node = natureSelect;
    for (let i = 0; i < 4 && node; i++, node = node.parentElement) {
      if (!node) break;
      if (/nature/i.test(node.textContent || '')) return node;
    }
    return natureSelect.closest('p') || natureSelect.parentElement || natureSelect;
  }

  function maybeBindSpeedCreepControls() {
    const species = getCurrentSpecies();
    const statInput = document.querySelector('input[name="stat-spe"]');
    const ivInput = document.querySelector('input[name="iv-spe"]');
    const natureSelect = document.querySelector('select[name="nature"]');
    if (!species || !statInput || !ivInput || !natureSelect) return;

    const statForm = statInput.closest('.statform') || statInput.closest('form') || document.body;
    let box = statForm.querySelector(`#${CREEP_BOX_ID}`);
    if (!box) {
      box = document.createElement('div');
      box.id = CREEP_BOX_ID;
      box.innerHTML = `
        <div class="pssc-row">
          <div class="pssc-title">Speed creep</div>
          <div class="pssc-suggest-wrap pssc-target-wrap">
            <input type="text" class="pssc-target" placeholder="Target Pokémon…" autocomplete="off" spellcheck="false" />
          </div>
          <input type="number" class="pssc-level" min="1" max="100" step="1" placeholder="Lvl" />
          <select class="pssc-tier">
            <option value="positive">Positive 252 speed</option>
            <option value="neutral">Neutral 252</option>
            <option value="unboosted">Unboosted</option>
          </select>
          <span class="pssc-targetspeed"></span>
          <label class="pssc-mode"><input type="checkbox" class="pssc-champions" /> Use Champions mode</label>
        </div>
        <div class="pssc-row">
          <div class="pssc-boosts">
            <label><input type="checkbox" class="pssc-plus1" /> Target +1</label>
            <label><input type="checkbox" class="pssc-plus2" /> Target +2</label>
          </div>
        </div>
        <div class="pssc-footer">
          <div class="pssc-footer-left">
            <div class="pssc-selfboost-wrap">
              <span>Your boost</span>
              <select class="pssc-selfboost" title="Your speed boost">
                <option value="none">None</option>
                <option value="plusOne">+1</option>
                <option value="plusTwo">+2</option>
              </select>
            </div>
            <div class="pssc-messages">
              <div class="pssc-status"></div>
              <div class="pssc-help"></div>
            </div>
          </div>
          <div class="pssc-actions">
            <button type="button" class="pssc-apply">Apply</button>
          </div>
        </div>
      `;
      const anchor = findNatureRowAnchor(natureSelect);
      anchor.insertAdjacentElement('afterend', box);

      const saved = readCreepState();
      const targetInput = box.querySelector('.pssc-target');
      const tierSelect = box.querySelector('.pssc-tier');
      const levelInput = box.querySelector('.pssc-level');
      const suggestBox = ensureSuggestOverlay();
      const plusOneInput = box.querySelector('.pssc-plus1');
      const plusTwoInput = box.querySelector('.pssc-plus2');
      const championsInput = box.querySelector('.pssc-champions');
      const selfBoostSelect = box.querySelector('.pssc-selfboost');
      const targetSpeedEl = box.querySelector('.pssc-targetspeed');
      const status = box.querySelector('.pssc-status');
      const help = box.querySelector('.pssc-help');
      if (saved.targetName) targetInput.value = saved.targetName;
      if (saved.tier && tierSelect.querySelector(`option[value="${saved.tier}"]`)) tierSelect.value = saved.tier;
      plusOneInput.checked = saved.boost === 'plusOne';
      plusTwoInput.checked = saved.boost === 'plusTwo';
      championsInput.checked = isCurrentChampionsFormat();
      box.dataset.psscFormatChampions = championsInput.checked ? '1' : '0';
      selfBoostSelect.value = ['none','plusOne','plusTwo'].includes(saved.selfBoost) ? saved.selfBoost : 'none';
      if (hasChoiceScarf() && (!saved.selfBoost || saved.selfBoost === 'none')) selfBoostSelect.value = 'plusOne';
      levelInput.value = String(championsInput.checked ? CHAMPIONS_LEVEL : clampLevel(saved.level || settings.level || 100));

      const pickSuggestion = (name) => {
        targetInput.value = name;
        saveCreepState({ targetName: name.trim() });
        updateTargetSpeedLabel();
        closeSuggest(suggestBox);
        targetInput.focus();
      };

      const syncTierLabels = () => {
        const isChampions = championsInput.checked;
        const positiveOption = tierSelect.querySelector('option[value="positive"]');
        const neutralOption = tierSelect.querySelector('option[value="neutral"]');
        if (positiveOption) positiveOption.textContent = isChampions ? 'Positive max speed' : 'Positive 252 speed';
        if (neutralOption) neutralOption.textContent = isChampions ? 'Neutral max' : 'Neutral 252';
      };

      const syncModeUi = () => {
        syncTierLabels();
        if (championsInput.checked) {
          levelInput.value = String(CHAMPIONS_LEVEL);
          levelInput.disabled = true;
          levelInput.title = 'Champions formats are always level 50.';
          help.textContent = isCurrentChampionsFormat()
            ? ''
            : 'Warning: this team is not currently set to a Champions format.';
        } else {
          levelInput.disabled = false;
          levelInput.title = '';
          levelInput.value = '100';
          if (/not currently set to a Champions format/i.test(help.textContent || '')) help.textContent = '';
        }
      };

      const updateTargetSpeedLabel = () => {
        const targetSpecies = getSpeciesFromName(targetInput.value.trim());
        if (!targetSpecies) {
          targetSpeedEl.textContent = '';
          return;
        }
        const championsMode = championsInput.checked;
        const boost = plusTwoInput.checked ? 'plusTwo' : plusOneInput.checked ? 'plusOne' : 'none';
        const chosenLevel = championsMode ? CHAMPIONS_LEVEL : clampLevel(levelInput.value || settings.level || 100);
        const targetSpeed = getTierTargetSpeed(targetSpecies, tierSelect.value, boost, { championsMode, level: chosenLevel });
        targetSpeedEl.textContent = `(${targetSpeed})`;
      };

      const refreshSuggest = () => {
        const value = targetInput.value.trim();
        saveCreepState({ targetName: value });
        updateTargetSpeedLabel();
        const items = getSpeciesSuggestions(value);
        openSuggest(suggestBox, items, pickSuggestion, value);
        positionSuggestBox(targetInput, suggestBox);
      };

      targetInput.addEventListener('input', refreshSuggest);
      targetInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          if (!suggestBox.classList.contains('is-open')) { openSuggest(suggestBox, getSpeciesSuggestions(targetInput.value.trim()), pickSuggestion, targetInput.value.trim()); positionSuggestBox(targetInput, suggestBox); }
          moveSuggest(suggestBox, 1);
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          moveSuggest(suggestBox, -1);
          e.preventDefault();
        } else if (e.key === 'Enter') {
          if (pickActiveSuggest(suggestBox, pickSuggestion)) e.preventDefault();
        } else if (e.key === 'Escape') {
          closeSuggest(suggestBox);
        }
      });
      targetInput.addEventListener('blur', () => setTimeout(() => closeSuggest(suggestBox), 120));
      targetInput.addEventListener('focus', refreshSuggest);
      targetInput.addEventListener('click', refreshSuggest);
      tierSelect.addEventListener('change', () => {
        saveCreepState({ tier: tierSelect.value });
        updateTargetSpeedLabel();
      });
      plusOneInput.addEventListener('change', () => {
        if (plusOneInput.checked) plusTwoInput.checked = false;
        saveCreepState({ boost: plusTwoInput.checked ? 'plusTwo' : plusOneInput.checked ? 'plusOne' : 'none' });
        updateTargetSpeedLabel();
      });
      plusTwoInput.addEventListener('change', () => {
        if (plusTwoInput.checked) plusOneInput.checked = false;
        saveCreepState({ boost: plusTwoInput.checked ? 'plusTwo' : plusOneInput.checked ? 'plusOne' : 'none' });
        updateTargetSpeedLabel();
      });
      championsInput.addEventListener('change', () => {
        syncModeUi();
        saveCreepState({ championsMode: championsInput.checked, level: championsInput.checked ? CHAMPIONS_LEVEL : 100 });
        updateTargetSpeedLabel();
      });
      levelInput.addEventListener('input', () => {
        const level = clampLevel(levelInput.value);
        levelInput.value = String(level);
        settings.level = level;
        saveCreepState({ level });
        updateTargetSpeedLabel();
      });
      selfBoostSelect.addEventListener('change', () => saveCreepState({ selfBoost: selfBoostSelect.value }));
      syncModeUi();
      updateTargetSpeedLabel();
      box.querySelector('.pssc-apply').addEventListener('click', () => {
        help.textContent = '';
        status.textContent = '';
        const targetName = targetInput.value.trim();
        const targetSpecies = getSpeciesFromName(targetName);
        if (!targetSpecies) {
          status.textContent = 'Target Pokémon not found.';
          return;
        }

        const championsMode = championsInput.checked;
        const chosenLevel = championsMode ? CHAMPIONS_LEVEL : clampLevel(levelInput.value || settings.level || 100);
        levelInput.value = String(chosenLevel);
        if (!championsMode) settings.level = chosenLevel;
        saveCreepState({ level: chosenLevel, championsMode });

        const iv = championsMode ? CHAMPIONS_IV : Math.max(0, parseInt(String(ivInput.value || '').replace(/[^\d]/g, ''), 10) || 31);
        const currentNatureMult = getNatureMultiplier(natureSelect.value, 'spe');
        const boost = plusTwoInput.checked ? 'plusTwo' : plusOneInput.checked ? 'plusOne' : 'none';
        const selfBoost = selfBoostSelect.value || 'none';
        const targetSpeed = getTierTargetSpeed(targetSpecies, tierSelect.value, boost, { championsMode, level: chosenLevel });

        let neededInvestment = findSpeedCreepInvestment(species, iv, currentNatureMult, targetSpeed, selfBoost, { championsMode, level: chosenLevel });
        let needsPositiveNatureWarning = false;

        if (neededInvestment == null && currentNatureMult <= 1.0) {
          const positiveInvestment = findSpeedCreepInvestment(species, iv, 1.1, targetSpeed, selfBoost, { championsMode, level: chosenLevel });
          if (positiveInvestment != null) {
            neededInvestment = positiveInvestment;
            needsPositiveNatureWarning = true;
          }
        }

        if (neededInvestment == null) {
          status.textContent = championsMode
            ? `Cannot outspeed ${targetSpecies.name} at level 50 with ${CHAMPIONS_MAX_POINTS} Stat Points.`
            : `Cannot outspeed ${targetSpecies.name} at this level with 252 EVs.`;
          return;
        }

        setSpeedInvestmentInputValue(statInput, neededInvestment, natureSelect);
        triggerInput(statInput);
        setTimeout(() => {
          const currentVal = parseInt(String(statInput.value || '').replace(/[^\d]/g, ''), 10) || 0;
          if (currentVal !== neededInvestment) {
            setSpeedInvestmentInputValue(statInput, neededInvestment, natureSelect);
            triggerInput(statInput);
          }
        }, 30);
        saveCreepState({ targetName, tier: tierSelect.value, boost, selfBoost, championsMode });

        const targetBoostText = boost === 'plusTwo' ? ' +2' : boost === 'plusOne' ? ' +1' : '';
        const selfBoostText = selfBoost === 'plusTwo' ? ' while you are +2' : selfBoost === 'plusOne' ? ' while you are +1' : '';
        const unitLabel = championsMode ? 'Stat Points' : 'EVs';
        status.textContent = `Set ${neededInvestment} ${unitLabel} to beat ${targetSpecies.name}${targetBoostText}${selfBoostText} (${targetSpeed}).`;
        if (championsMode && !isCurrentChampionsFormat()) {
          help.textContent = 'Warning: this team is not currently set to a Champions format.';
        }
        if (needsPositiveNatureWarning) {
          help.textContent = help.textContent
            ? `${help.textContent} Needs a +Spe nature to actually outspeed this target.`
            : 'Needs a +Spe nature to actually outspeed this target.';
        }
        schedule();
      });
    }

    const selfBoostSelect = box.querySelector('.pssc-selfboost');
    const championsInput = box.querySelector('.pssc-champions');
    const levelInput = box.querySelector('.pssc-level');
    const help = box.querySelector('.pssc-help');
    if (selfBoostSelect && hasChoiceScarf() && selfBoostSelect.value === 'none') {
      selfBoostSelect.value = 'plusOne';
    }
    if (championsInput) {
      const currentFormatIsChampions = isCurrentChampionsFormat();
      const wasAutoEnabledByFormat = box.dataset.psscFormatChampions === '1';
      if (currentFormatIsChampions) {
        championsInput.checked = true;
        box.dataset.psscFormatChampions = '1';
      } else if (wasAutoEnabledByFormat) {
        championsInput.checked = false;
        box.dataset.psscFormatChampions = '0';
        if (help) help.textContent = '';
      }
    }
    if (levelInput) {
      if (championsInput?.checked) {
        levelInput.value = String(CHAMPIONS_LEVEL);
        levelInput.disabled = true;
        levelInput.title = 'Champions formats are always level 50.';
        if (help && !isCurrentChampionsFormat()) {
          help.textContent = 'Warning: this team is not currently set to a Champions format.';
        }
      } else {
        levelInput.disabled = false;
        levelInput.title = '';
        levelInput.value = '100';
        if (help && /not currently set to a Champions format/i.test(help.textContent || '')) help.textContent = '';
      }
    }
    box.classList.toggle('compact-ui', statForm.clientWidth < 720);
  }

  // Render and boot
  function render() {
    addStyles();
    ensureTooltip();
    if (activeTarget && !activeTarget.isConnected) hideTooltip(activeTarget);
    maybeBindJumpPointsToggle();
    maybeRenderJumpPoints();
    maybeBindSetView();
    maybeBindSearchRows();
    maybeBindSpeedCreepControls();
  }

  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  }

  function requestSettings() {
    // The injected page script cannot read extension storage directly.
    window.dispatchEvent(new CustomEvent('ps-speed-settings-request'));
  }

  function init() {
    addStyles();
    ensureTooltip();
    window.addEventListener('ps-speed-settings', (event) => {
      settings = { ...DEFAULTS, ...(event.detail || {}) };
      schedule();
    });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    document.addEventListener('input', schedule, true);
    document.addEventListener('change', schedule, true);
    document.addEventListener('click', schedule, true);
    document.addEventListener('mousemove', syncTooltipVisibility, true);
    document.addEventListener('pointerdown', () => hideTooltip(), true);
    window.addEventListener('scroll', () => positionTooltip(), true);
    window.addEventListener('resize', () => positionTooltip(), true);
    requestSettings();
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
