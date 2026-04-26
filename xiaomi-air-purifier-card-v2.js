// ============================================================
//  Xiaomi Air Purifier Card — Final Edition
//  /config/www/xiaomi-air-purifier-card-final.js
//
//  Config YAML:
//    type: custom:xiaomi-air-purifier-card-final
//    entity: fan.zhimi_mc2_XXXX_air_purifier
//    name: Bedroom                        # optional
//    entity_pm25: sensor.XXX             # optional – auto-derived
//    entity_humidity: sensor.XXX         # optional
//    entity_temperature: sensor.XXX      # optional
//    entity_filter: sensor.XXX           # optional
// ============================================================

// ── Helpers ───────────────────────────────────────────────────

function aqiInfo(val) {
  const n = Number(val);
  if (isNaN(n) || val === null || val === undefined)
    return { color:"#adb5a0", light:"#c0c8b0", glow:"rgba(173,181,160,0.35)", rgb:"173,181,160", label:"—",        cls:"",     level:"off" };
  if (n <= 12)
    return { color:"#6fae7f", light:"#8fc99e", glow:"rgba(111,174,127,0.50)", rgb:"111,174,127", label:"Excellent", cls:"good", level:"good" };
  if (n <= 35)
    return { color:"#6fae7f", light:"#8fc99e", glow:"rgba(111,174,127,0.50)", rgb:"111,174,127", label:"Good",      cls:"good", level:"good" };
  if (n <= 55)
    return { color:"#d4b94a", light:"#e8d36b", glow:"rgba(212,185,74,0.50)",  rgb:"212,185,74",  label:"Moderate",  cls:"mod",  level:"moderate" };
  if (n <= 150)
    return { color:"#ff9d4a", light:"#ffb877", glow:"rgba(255,157,74,0.50)",  rgb:"255,157,74",  label:"Unhealthy", cls:"bad",  level:"unhealthy" };
  if (n <= 250)
    return { color:"#a557c4", light:"#c47edb", glow:"rgba(165,87,196,0.50)",  rgb:"165,87,196",  label:"Very Bad",  cls:"bad",  level:"very-unhealthy" };
  return   { color:"#8b3a3a", light:"#a85555", glow:"rgba(139,58,58,0.55)",   rgb:"139,58,58",   label:"Hazardous", cls:"bad",  level:"hazardous" };
}

function sensorIds(config) {
  const base = config.entity.replace(/^fan\./, "").replace(/_air_purifier$/, "");
  return {
    fan:    config.entity,
    pm25:   config.entity_pm25        || `sensor.${base}_pm25_density`,
    hum:    config.entity_humidity    || `sensor.${base}_relative_humidity`,
    temp:   config.entity_temperature || `sensor.${base}_indoor_temperature`,
    filter: config.entity_filter      || `sensor.${base}_filter_life_level`,
  };
}

// ── Styles ────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Quicksand:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :host { display: block; }

  /* ─ Card root ─ */
  .card {
    background: linear-gradient(175deg, #f5f1ea 0%, #ede6db 100%);
    border-radius: 26px;
    padding: 18px 18px 20px;
    position: relative;
    overflow: hidden;
    color: #3a3530;
    font-family: 'Quicksand', sans-serif;
    box-shadow:
      0 2px 4px rgba(0,0,0,0.04),
      0 8px 24px rgba(0,0,0,0.08),
      0 24px 48px rgba(0,0,0,0.06);

    --aqi-color: #adb5a0;
    --aqi-light: #c0c8b0;
    --aqi-glow:  rgba(173,181,160,0.35);
    --aqi-rgb:   173,181,160;
  }

  /* AQI level overrides */
  .card[data-aqi="good"]          { --aqi-color:#6fae7f; --aqi-light:#8fc99e; --aqi-glow:rgba(111,174,127,0.50); --aqi-rgb:111,174,127; }
  .card[data-aqi="moderate"]      { --aqi-color:#d4b94a; --aqi-light:#e8d36b; --aqi-glow:rgba(212,185,74,0.50);  --aqi-rgb:212,185,74;  }
  .card[data-aqi="unhealthy"]     { --aqi-color:#ff9d4a; --aqi-light:#ffb877; --aqi-glow:rgba(255,157,74,0.50);  --aqi-rgb:255,157,74;  }
  .card[data-aqi="very-unhealthy"]{ --aqi-color:#a557c4; --aqi-light:#c47edb; --aqi-glow:rgba(165,87,196,0.50);  --aqi-rgb:165,87,196;  }
  .card[data-aqi="hazardous"]     { --aqi-color:#8b3a3a; --aqi-light:#a85555; --aqi-glow:rgba(139,58,58,0.55);   --aqi-rgb:139,58,58;   }
  .card[data-aqi="off"]           { --aqi-color:#adb5a0; --aqi-light:#c0c8b0; --aqi-glow:rgba(173,181,160,0.35); --aqi-rgb:173,181,160; }

  /* ─ Top bar ─ */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .mode-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 11px 6px 9px; border-radius: 20px;
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(0,0,0,0.07);
    font-size: 12px; font-weight: 700; color: #6b6259; letter-spacing: 0.2px;
    cursor: pointer; transition: all 0.2s; user-select: none; position: relative;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
  }
  .mode-pill:hover { background: rgba(255,255,255,0.95); color: #2a2520; }
  .mode-pill svg { width: 11px; height: 11px; flex-shrink: 0; }

  .mode-dropdown {
    display: none; position: absolute; top: calc(100% + 6px); left: 0;
    background: #faf7f2;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px; overflow: hidden; z-index: 50;
    min-width: 115px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.05);
  }
  .mode-dropdown.open { display: block; }
  .mode-opt {
    padding: 10px 16px; font-size: 12px; font-weight: 700; color: #6b6259;
    cursor: pointer; transition: all 0.12s; white-space: nowrap;
  }
  .mode-opt:hover { background: rgba(0,0,0,0.04); color: #2a2520; }
  .mode-opt.active { color: var(--aqi-color); }

  .pwr-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(0,0,0,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.35s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
  }
  .pwr-btn.on {
    background: rgba(var(--aqi-rgb), 0.13);
    border-color: rgba(var(--aqi-rgb), 0.4);
    box-shadow: 0 0 14px rgba(var(--aqi-rgb), 0.28), inset 0 1px 0 rgba(255,255,255,0.4);
  }
  .pwr-btn svg { width: 13px; height: 13px; stroke: #aaa; fill: none; stroke-width: 2; stroke-linecap: round; transition: stroke 0.35s; }
  .pwr-btn.on svg { stroke: var(--aqi-color); }

  /* ─ Purifier visual ─ */
  .purifier-container {
    display: flex; justify-content: center; align-items: flex-end;
    margin: 6px 0 18px;
    height: 360px; position: relative;
  }
  .purifier-stage { width: 210px; height: 360px; position: relative; }

  .ambient-glow {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    width: 260px; height: 320px;
    background: radial-gradient(ellipse at center, var(--aqi-glow) 0%, transparent 65%);
    opacity: 0; pointer-events: none; z-index: 0;
    transition: opacity 0.9s, background 0.5s;
    filter: blur(22px);
  }
  .card.on .ambient-glow { opacity: 0.5; animation: ambientPulse 4s ease-in-out infinite; }
  @keyframes ambientPulse {
    0%,100% { opacity: 0.35; transform: translateX(-50%) scale(1);    }
    50%     { opacity: 0.65; transform: translateX(-50%) scale(1.06); }
  }

  .particles-layer {
    position: absolute; inset: 0; pointer-events: none; overflow: visible; z-index: 1;
  }
  .particle {
    position: absolute; border-radius: 50%; opacity: 0; will-change: transform, opacity;
  }
  .air-wave {
    position: absolute; left: 50%;
    width: 76px; height: 76px;
    border: 1.5px solid var(--aqi-color);
    border-radius: 50%;
    transform: translateX(-50%) scale(0);
    opacity: 0; pointer-events: none;
  }

  /* Body */
  .purifier { width: 210px; height: 318px; position: absolute; bottom: 10px; left: 0; z-index: 2; }
  .purifier-body {
    width: 100%; height: 100%;
    background:
      radial-gradient(ellipse at 30% 18%, rgba(255,255,255,0.88) 0%, transparent 52%),
      linear-gradient(180deg, #fdf8f0 0%, #f4ebd8 65%, #e6dac0 100%);
    border-radius: 30px; position: relative;
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.9),
      inset 0 -10px 20px rgba(180,160,130,0.28),
      inset -10px 0 20px rgba(180,160,130,0.16),
      inset  10px 0 20px rgba(255,255,255,0.32),
      0  4px  8px rgba(120,100,80,0.09),
      0 14px 28px rgba(120,100,80,0.18),
      0 28px 50px rgba(120,100,80,0.22);
    transition: box-shadow 0.6s;
  }
  .card.on .purifier-body {
    box-shadow:
      inset 0 2px 4px rgba(255,255,255,0.9),
      inset 0 -10px 20px rgba(180,160,130,0.28),
      inset -10px 0 20px rgba(180,160,130,0.16),
      inset  10px 0 20px rgba(255,255,255,0.32),
      0  4px  8px rgba(120,100,80,0.09),
      0 14px 28px rgba(120,100,80,0.18),
      0 28px 50px rgba(120,100,80,0.22),
      0  0  55px var(--aqi-glow);
  }
  .purifier-body::before {
    content: ''; position: absolute; left: 7px; top: 14px; bottom: 14px; width: 3px;
    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.6) 28%, rgba(255,255,255,0.6) 72%, transparent);
    border-radius: 3px; filter: blur(1px);
  }
  .purifier-body::after {
    content: ''; position: absolute; top: 11px; left: 20%; right: 20%; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
    border-radius: 50%; filter: blur(1px);
  }

  /* Display (circular LCD) */
  .display {
    position: absolute; top: 28px; left: 50%; transform: translateX(-50%);
    width: 90px; height: 90px;
    background: radial-gradient(circle at 32% 28%, #3a2a1f 0%, #1a1108 68%, #080502 100%);
    border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 3.5px solid #f5ead0;
    overflow: hidden; cursor: pointer;
    box-shadow:
      inset 0 3px 7px rgba(0,0,0,0.75),
      inset 0 -2px 4px var(--aqi-glow),
      0 4px 10px rgba(0,0,0,0.22);
    transition: box-shadow 0.5s;
  }
  .display::before {
    content: ''; position: absolute; top: 7px; left: 15px;
    width: 30px; height: 14px;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    border-radius: 50%; transform: rotate(-28deg); filter: blur(2px); z-index: 3;
  }
  .display-scan {
    position: absolute; top: 0; left: -50%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, var(--aqi-color), transparent);
    opacity: 0; pointer-events: none; z-index: 1;
  }
  .card.on .display-scan { animation: displayScan 3.2s ease-in-out infinite; }
  @keyframes displayScan {
    0%  { left:-50%; opacity:0;    }
    18% { opacity:.14; }
    55% { left:100%; opacity:.14; }
    100%{ left:100%; opacity:0;    }
  }

  .disp-main {
    font-family: 'Space Mono', monospace;
    font-size: 19px; font-weight: 700; letter-spacing: 0.5px;
    color: var(--aqi-color); line-height: 1; z-index: 2;
    transition: color 0.4s;
  }
  .disp-sub {
    font-family: 'Space Mono', monospace; font-size: 6.5px;
    color: var(--aqi-color); margin-top: 3px; letter-spacing: 1.2px;
    opacity: 0.55; z-index: 2; transition: color 0.4s;
  }
  .disp-divider { width: 48px; height: 1px; background: var(--aqi-color); margin: 4px 0; opacity: 0.35; }
  .disp-sec {
    font-family: 'Space Mono', monospace; font-size: 7.5px;
    color: var(--aqi-color); opacity: 0.65; z-index: 2; transition: color 0.4s;
  }
  .disp-dots {
    position: absolute; bottom: 9px; left: 0; right: 0;
    display: flex; justify-content: center; gap: 5px;
  }
  .disp-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: rgba(var(--aqi-rgb), 0.25);
    transition: background 0.3s, transform 0.3s;
  }
  .disp-dot.active { background: var(--aqi-color); transform: scale(1.25); }
  .card.on .disp-main, .card.on .disp-sub, .card.on .disp-sec {
    animation: textGlow 2.2s ease-in-out infinite;
  }
  @keyframes textGlow {
    0%,100% { text-shadow: 0 0 4px var(--aqi-glow); }
    50%     { text-shadow: 0 0 10px var(--aqi-color), 0 0 18px var(--aqi-glow); }
  }

  /* Dot grid */
  .dot-grid {
    position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
    width: 176px;
    display: grid; grid-template-columns: repeat(24, 1fr); gap: 2.5px;
    padding: 6px; border-radius: 7px; z-index: 2;
  }
  .dot {
    aspect-ratio: 1; background: #b8ada0; border-radius: 1.5px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
    transition: background 0.4s;
  }
  .dot.accent {
    background: var(--aqi-color);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 0 4px var(--aqi-glow);
  }
  .card.on .dot.accent { animation: dotPulse 3s ease-in-out infinite; }
  @keyframes dotPulse {
    0%,100% { background: var(--aqi-color); }
    50%     { background: var(--aqi-light); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 0 7px var(--aqi-color); }
  }
  .dot.sparkle {
    background: var(--aqi-light) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 0 9px var(--aqi-color), 0 0 16px var(--aqi-glow) !important;
    animation: dotSparkle 0.75s ease-out forwards !important;
  }
  @keyframes dotSparkle {
    0%  { transform: scale(1);    filter: brightness(1);   }
    28% { transform: scale(1.55); filter: brightness(1.9); }
    100%{ transform: scale(1);    filter: brightness(1);   }
  }

  /* Feet & shadow */
  .foot {
    position: absolute; bottom: -9px;
    width: 19px; height: 11px;
    background: linear-gradient(180deg, #d4c8b5 0%, #b5a78f 100%);
    border-radius: 0 0 7px 7px;
    box-shadow: 0 4px 7px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .foot.left  { left: 26px; }
  .foot.right { right: 26px; }
  .ground-shadow {
    position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%);
    width: 88%; height: 26px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.19) 0%, transparent 70%);
    filter: blur(10px); z-index: 0;
  }

  /* Particle & wave keyframes */
  @keyframes particleRise {
    0%   { transform: translate(0,0) scale(0.4) rotate(0deg); opacity: 0; }
    14%  { opacity: var(--p-op, 0.7); }
    50%  { transform: translate(calc(var(--p-dx)*0.5), -150px) scale(1) rotate(180deg); }
    100% { transform: translate(var(--p-dx), -290px) scale(1.35) rotate(360deg); opacity: 0; }
  }
  @keyframes airWave {
    0%  { transform: translateX(-50%) scale(0.3); opacity: 0;   }
    18% { opacity: 0.45; }
    100%{ transform: translateX(-50%) scale(2.5); opacity: 0;   }
  }

  /* ─ Info ─ */
  .info { text-align: center; margin-bottom: 14px; }
  .device-name {
    font-family: 'Instrument Serif', serif;
    font-size: 22px; font-weight: 400; color: #2a2520; line-height: 1.15;
  }
  .aqi-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 11px;
    background: var(--aqi-color); color: #fff;
    font-size: 9px; font-weight: 700; font-family: 'Quicksand', sans-serif;
    letter-spacing: 1.1px; margin-left: 6px; vertical-align: middle;
    box-shadow: 0 2px 7px var(--aqi-glow);
    opacity: 0; transform: scale(0.78); transition: opacity 0.4s, transform 0.4s;
  }
  .card.on .aqi-badge { opacity: 1; transform: scale(1); }
  .device-status {
    font-size: 11px; font-weight: 700; letter-spacing: 0.7px;
    text-transform: uppercase; margin-top: 3px;
    color: var(--aqi-color); transition: color 0.4s;
  }
  .card:not(.on) .device-status { color: #b0a898; }

  /* ─ AQI block ─ */
  .aqi-block {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.58);
    border: 1px solid rgba(0,0,0,0.045);
    border-radius: 18px; padding: 12px 15px; margin-bottom: 13px;
    box-shadow: 0 2px 7px rgba(0,0,0,0.045), inset 0 1px 0 rgba(255,255,255,0.65);
    position: relative; overflow: hidden;
  }
  .aqi-block::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--aqi-color); opacity: 0; transition: opacity 0.5s;
  }
  .card.on .aqi-block::before { opacity: 0.55; }
  .aqi-main { flex: 1; }
  .aqi-val {
    font-family: 'Instrument Serif', serif;
    font-size: 40px; font-weight: 400; line-height: 1;
    color: var(--aqi-color); letter-spacing: -1.5px; transition: color 0.4s;
  }
  .aqi-sub { font-size: 9px; font-weight: 700; color: #b0a898; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
  .aqi-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 10px; font-weight: 700; margin-top: 6px;
    border: 1px solid; font-family: 'Quicksand', sans-serif;
  }
  .good { color: #4f9163; border-color: rgba(79,145,99,0.22);  background: rgba(79,145,99,0.08);  }
  .mod  { color: #9a7818; border-color: rgba(154,120,24,0.22); background: rgba(154,120,24,0.07); }
  .bad  { color: #c04a28; border-color: rgba(192,74,40,0.22);  background: rgba(192,74,40,0.07);  }
  .tdot {
    width: 5px; height: 5px; border-radius: 50%;
    background: currentColor; display: inline-block;
    animation: tdPulse 2s ease-in-out infinite;
  }
  @keyframes tdPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.55);opacity:.5} }

  .divider {
    width: 1px; height: 52px;
    background: linear-gradient(180deg, transparent, rgba(0,0,0,0.09), transparent);
    margin: 0 14px; flex-shrink: 0;
  }
  .side-stats { display: flex; flex-direction: column; gap: 8px; }
  .srow { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #4a4238; font-weight: 600; }
  .srow svg { width: 12px; height: 12px; flex-shrink: 0; }
  .srow em { font-style: normal; font-size: 10px; color: #9a9080; font-weight: 600; }
  .na { color: #c0b5aa; }

  /* ─ Speed ─ */
  .sec-lbl {
    font-size: 9px; font-weight: 700; color: #b0a898;
    text-transform: uppercase; letter-spacing: 1.3px; margin-bottom: 7px;
  }
  .speed-row { display: flex; gap: 6px; margin-bottom: 12px; }
  .spb {
    flex: 1; padding: 9px 4px; border-radius: 13px;
    border: 1px solid rgba(0,0,0,0.07);
    background: rgba(255,255,255,0.55);
    color: #8a7f72; font-size: 10px; font-weight: 700;
    font-family: 'Quicksand', sans-serif;
    cursor: pointer; text-align: center; line-height: 1.45;
    transition: all 0.18s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.55);
  }
  .spb:hover { background: rgba(255,255,255,0.88); color: #2a2520; }
  .spb.active {
    background: linear-gradient(140deg,
      rgba(var(--aqi-rgb), 0.16) 0%,
      rgba(var(--aqi-rgb), 0.07) 100%);
    border-color: rgba(var(--aqi-rgb), 0.38);
    color: var(--aqi-color);
    box-shadow: 0 4px 10px rgba(var(--aqi-rgb), 0.18), inset 0 1px 0 rgba(255,255,255,0.45);
  }
  .spico { font-size: 13px; display: block; margin-bottom: 2px; }

  /* ─ Filter ─ */
  .filter-row { display: flex; align-items: center; gap: 10px; }
  .filter-lbl {
    font-size: 9px; color: #b0a898; text-transform: uppercase;
    letter-spacing: 1px; white-space: nowrap; font-weight: 700;
  }
  .filter-track {
    flex: 1; height: 3px; background: rgba(0,0,0,0.07);
    border-radius: 2px; overflow: hidden;
  }
  .filter-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, var(--aqi-color), var(--aqi-light));
    transition: width 1s ease;
  }
  .filter-pct { font-size: 11px; font-weight: 700; color: var(--aqi-color); white-space: nowrap; }
`;

// ── Card element ──────────────────────────────────────────────

class XiaomiAirPurifierCardFinal extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config    = null;
    this._hass      = null;
    this._ids       = null;
    this._built     = false;
    this._lcdPage   = 0;
    this._allDots   = [];
    this._ptInt     = null;
    this._waveInt   = null;
    this._sparkInt  = null;
    this._wasOn     = null;

    // Current sensor values (shared between _updateData & _updateDisplay)
    this._pm25  = null;
    this._hum   = null;
    this._temp  = null;
    this._filt  = null;

    this._defaultModes = ["Sleep", "Auto", "Favorite"];
    this._modeIcons    = { Auto: "⟳", Sleep: "☽", Favorite: "★" };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("xiaomi-air-purifier-card-final: 'entity' required");
    this._config = config;
    this._ids    = sensorIds(config);
    this._built  = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    this._updateData();
  }

  getCardSize() { return 8; }

  // ── Build (called once) ──────────────────────────────────────

  _build() {
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="card" id="card">

        <div class="top-bar">
          <div class="mode-pill" id="modePill">
            <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
              <path d="M3 3v4h.5M13 8a5 5 0 0 0-9.5-1M13 13v-4h-.5M3 8a5 5 0 0 0 9.5 1"/>
            </svg>
            <span id="modeLabel">Auto</span>
            <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 16 16">
              <path d="M4 6l4 4 4-4"/>
            </svg>
            <div class="mode-dropdown" id="modeDropdown"></div>
          </div>
          <div class="pwr-btn" id="pwrBtn">
            <svg viewBox="0 0 24 24"><path d="M12 2v6M6.34 6.34a9 9 0 1 0 11.32 0"/></svg>
          </div>
        </div>

        <div class="purifier-container">
          <div class="purifier-stage">
            <div class="ambient-glow"></div>
            <div class="particles-layer" id="particlesLayer"></div>
            <div class="purifier">
              <div class="ground-shadow"></div>
              <div class="purifier-body">
                <div class="display" id="display">
                  <div class="display-scan"></div>
                  <div class="disp-main" id="dispMain">—</div>
                  <div class="disp-sub"  id="dispSub">AQI · PM2.5</div>
                  <div class="disp-divider"></div>
                  <div class="disp-sec"  id="dispSec">FILTER —%</div>
                  <div class="disp-dots">
                    <div class="disp-dot active"></div>
                    <div class="disp-dot"></div>
                    <div class="disp-dot"></div>
                  </div>
                </div>
                <div class="dot-grid" id="dotGrid"></div>
                <div class="foot left"></div>
                <div class="foot right"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="info">
          <div class="device-name" id="deviceName">
            Air Purifier <span class="aqi-badge" id="aqiBadge">GOOD</span>
          </div>
          <div class="device-status" id="deviceStatus">Offline</div>
        </div>

        <div class="aqi-block">
          <div class="aqi-main">
            <div class="aqi-val" id="aqiVal">—</div>
            <div class="aqi-sub">AQI · PM2.5</div>
            <div id="aqiTag"></div>
          </div>
          <div class="divider"></div>
          <div class="side-stats">
            <div class="srow">
              <svg fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" viewBox="0 0 12 12">
                <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.5 1.5M8 8l1.5 1.5M2.5 9.5L4 8M8 4l1.5-1.5"/>
              </svg>
              <span id="humStat" class="na">—</span>&thinsp;<em>RH</em>
            </div>
            <div class="srow">
              <svg fill="none" stroke="#f59e0b" stroke-width="1.2" viewBox="0 0 12 12">
                <path d="M6 1C4.3 1 2.5 2.8 2.5 5.3S4.5 10 6 11C7.5 10 9.5 8 9.5 5.3S7.7 1 6 1z"/>
              </svg>
              <span id="tempStat" class="na">—</span>
            </div>
            <div class="srow">
              <svg fill="none" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="4"/><path d="M6 3.8V6l1.8 1.4"/>
              </svg>
              <span id="filtStat" class="na">—</span>&thinsp;<em>filter</em>
            </div>
          </div>
        </div>

        <div class="sec-lbl">Fan Speed</div>
        <div class="speed-row" id="speedRow"></div>

        <div class="filter-row">
          <span class="filter-lbl">Filter</span>
          <div class="filter-track">
            <div class="filter-fill" id="filterFill" style="width:0%"></div>
          </div>
          <span class="filter-pct" id="filterPct">—</span>
        </div>

      </div>
    `;

    this._buildGrid();
    this._bindEvents();
    this._built = true;
  }

  // ── Grid dots ───────────────────────────────────────────────

  _buildGrid() {
    const grid = this.shadowRoot.getElementById("dotGrid");
    this._allDots = [];
    const COLS = 24, ROWS = 16;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = document.createElement("div");
        d.className = "dot";
        const boost = (r > 2 && r < 13) ? 0.17 : 0.05;
        if (Math.random() < boost) d.classList.add("accent");
        grid.appendChild(d);
        this._allDots.push(d);
      }
    }
  }

  // ── Static event bindings ────────────────────────────────────

  _bindEvents() {
    const sr = this.shadowRoot;

    // Power
    sr.getElementById("pwrBtn").addEventListener("click", () => {
      const st = this._hass && this._hass.states[this._ids.fan];
      if (!st) return;
      this._hass.callService("fan", st.state === "on" ? "turn_off" : "turn_on",
        { entity_id: this._ids.fan });
    });

    // Mode dropdown toggle
    const pill     = sr.getElementById("modePill");
    const dropdown = sr.getElementById("modeDropdown");
    pill.addEventListener("click", e => {
      e.stopPropagation();
      const opening = !dropdown.classList.contains("open");
      dropdown.classList.toggle("open");
      if (opening) {
        const close = () => dropdown.classList.remove("open");
        document.addEventListener("click", close, { once: true });
        sr.addEventListener("click", close, { once: true });
      }
    });

    // Display tap → cycle LCD page
    sr.getElementById("display").addEventListener("click", () => {
      this._lcdPage = (this._lcdPage + 1) % 3;
      this._updateDisplay();
    });
  }

  // ── Main data update ─────────────────────────────────────────

  _updateData() {
    if (!this._hass || !this._ids) return;
    const sr   = this.shadowRoot;
    const card = sr.getElementById("card");
    if (!card) return;

    const fanState = this._hass.states[this._ids.fan];
    if (!fanState) {
      card.innerHTML = `<p style="padding:16px;color:#dc2626;font-size:12px">Entity not found:<br>${this._ids.fan}</p>`;
      return;
    }

    const isOn  = fanState.state === "on";
    const mode  = fanState.attributes.preset_mode || "Auto";
    const modes = fanState.attributes.preset_modes || this._defaultModes;
    const name  = this._config.name || fanState.attributes.friendly_name || this._ids.fan;

    // Sensor values
    const pm25S = this._hass.states[this._ids.pm25];
    const humS  = this._hass.states[this._ids.hum];
    const tempS = this._hass.states[this._ids.temp];
    const filtS = this._hass.states[this._ids.filter];

    this._pm25 = pm25S ? Math.round(Number(pm25S.state))  : null;
    this._hum  = humS  ? Math.round(Number(humS.state))   : null;
    this._temp = tempS ? Number(tempS.state).toFixed(1)   : null;
    this._filt = filtS ? Math.round(Number(filtS.state))  : null;

    const aqi = aqiInfo(this._pm25);

    // ── Card state class & CSS vars ──
    card.className = "card" + (isOn ? " on" : "");
    card.setAttribute("data-aqi", isOn ? aqi.level : "off");

    // ── Power button ──
    sr.getElementById("pwrBtn").className = "pwr-btn" + (isOn ? " on" : "");

    // ── Mode pill label ──
    sr.getElementById("modeLabel").textContent = mode;

    // ── Mode dropdown options ──
    const dropdown = sr.getElementById("modeDropdown");
    dropdown.innerHTML = modes.map(m =>
      `<div class="mode-opt${m === mode ? " active" : ""}" data-mode="${m}">
         ${this._modeIcons[m] || "·"} ${m}
       </div>`
    ).join("");
    dropdown.querySelectorAll(".mode-opt").forEach(opt => {
      opt.addEventListener("click", e => {
        e.stopPropagation();
        this._hass.callService("fan", "set_preset_mode",
          { entity_id: this._ids.fan, preset_mode: opt.dataset.mode });
        dropdown.classList.remove("open");
      });
    });

    // ── Info ──
    sr.getElementById("deviceName").innerHTML =
      `${name} <span class="aqi-badge">${aqi.label}</span>`;
    sr.getElementById("deviceStatus").textContent =
      isOn ? `On · ${mode}` : "Off";

    // ── AQI block ──
    sr.getElementById("aqiVal").textContent = this._pm25 !== null ? this._pm25 : "—";
    sr.getElementById("aqiTag").innerHTML = this._pm25 !== null
      ? `<div class="aqi-tag ${aqi.cls}"><span class="tdot"></span> ${aqi.label}</div>` : "";

    // ── Side stats ──
    const humEl = sr.getElementById("humStat");
    humEl.className  = this._hum !== null ? "" : "na";
    humEl.textContent = this._hum !== null ? `${this._hum}%` : "—";

    const tempEl = sr.getElementById("tempStat");
    tempEl.className  = this._temp !== null ? "" : "na";
    tempEl.textContent = this._temp !== null ? `${this._temp}°C` : "—";

    const filtEl = sr.getElementById("filtStat");
    filtEl.className  = this._filt !== null ? "" : "na";
    filtEl.textContent = this._filt !== null ? `${this._filt}%` : "—";

    // ── Filter bar ──
    sr.getElementById("filterFill").style.width = (this._filt ?? 0) + "%";
    sr.getElementById("filterPct").textContent  = this._filt !== null ? `${this._filt}%` : "—";

    // ── Speed buttons ──
    const speedRow = sr.getElementById("speedRow");
    speedRow.innerHTML = modes.map(m =>
      `<button class="spb${m === mode ? " active" : ""}" data-mode="${m}">
         <span class="spico">${this._modeIcons[m] || "·"}</span>${m}
       </button>`
    ).join("");
    speedRow.querySelectorAll(".spb").forEach(btn => {
      btn.addEventListener("click", () =>
        this._hass.callService("fan", "set_preset_mode",
          { entity_id: this._ids.fan, preset_mode: btn.dataset.mode }));
    });

    // ── Display ──
    this._updateDisplay();

    // ── Particles & sparkles ──
    if (isOn !== this._wasOn) {
      if (isOn) {
        this._startParticles();
        this._startSparkles();
      } else {
        this._stopParticles();
        this._stopSparkles();
      }
      this._wasOn = isOn;
    }
  }

  // ── LCD display ─────────────────────────────────────────────

  _updateDisplay() {
    const sr = this.shadowRoot;
    const mainEl = sr.getElementById("dispMain");
    const subEl  = sr.getElementById("dispSub");
    const secEl  = sr.getElementById("dispSec");
    const dots   = sr.querySelectorAll(".disp-dot");
    if (!mainEl) return;

    dots.forEach((d, i) => d.classList.toggle("active", i === this._lcdPage));

    if (this._lcdPage === 0) {
      mainEl.textContent = this._pm25 !== null ? this._pm25 : "—";
      subEl.textContent  = "AQI · PM2.5";
      secEl.textContent  = this._filt !== null ? `FILTER ${this._filt}%` : "FILTER —%";
    } else if (this._lcdPage === 1) {
      mainEl.textContent = this._temp !== null ? `${this._temp}°` : "—";
      subEl.textContent  = "TEMPERATURE";
      secEl.textContent  = this._hum  !== null ? `HUM ${this._hum}%` : "HUM —%";
    } else {
      mainEl.textContent = this._hum  !== null ? `${this._hum}%` : "—";
      subEl.textContent  = "HUMIDITY";
      secEl.textContent  = this._temp !== null ? `${this._temp}°C` : "—°C";
    }
  }

  // ── Particle system ──────────────────────────────────────────

  _particleColor() {
    const card  = this.shadowRoot.getElementById("card");
    const level = card ? card.getAttribute("data-aqi") : "good";
    const map = {
      good:              ["rgba(111,174,127,.70)","rgba(143,201,158,.55)","rgba(190,230,205,.45)"],
      moderate:          ["rgba(212,185,74,.70)", "rgba(232,211,107,.55)"],
      unhealthy:         ["rgba(255,157,74,.70)", "rgba(255,184,119,.55)"],
      "very-unhealthy":  ["rgba(165,87,196,.70)", "rgba(196,126,219,.55)"],
      hazardous:         ["rgba(139,58,58,.75)",  "rgba(168,85,85,.60)"],
      off:               ["rgba(173,181,160,.35)"],
    };
    const p = map[level] || map.good;
    return p[Math.floor(Math.random() * p.length)];
  }

  _spawnParticle() {
    const layer = this.shadowRoot.getElementById("particlesLayer");
    if (!layer) return;
    const el   = document.createElement("div");
    el.className = "particle";
    const size = 2.5 + Math.random() * 5;
    el.style.cssText = `width:${size}px;height:${size}px;`;
    const col = this._particleColor();
    el.style.background = col;
    el.style.boxShadow  = `0 0 ${size * 2.8}px ${col}`;
    el.style.left = (210/2 - 30 + Math.random() * 60) + "px";
    el.style.top  = "60px";
    const drift = (Math.random() - 0.5) * 90;
    el.style.setProperty("--p-dx", drift + "px");
    el.style.setProperty("--p-op", (0.5 + Math.random() * 0.4).toString());
    const dur = 3 + Math.random() * 2.5;
    el.style.animation = `particleRise ${dur}s ease-out forwards`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 100);
  }

  _spawnWave() {
    const layer = this.shadowRoot.getElementById("particlesLayer");
    if (!layer) return;
    const w = document.createElement("div");
    w.className = "air-wave";
    w.style.top = "50px";
    layer.appendChild(w);
    requestAnimationFrame(() => { w.style.animation = "airWave 2.8s ease-out forwards"; });
    setTimeout(() => w.remove(), 2900);
  }

  _startParticles() {
    if (this._ptInt) return;
    this._ptInt   = setInterval(() => this._spawnParticle(), 145);
    this._waveInt = setInterval(() => this._spawnWave(), 1800);
    for (let i = 0; i < 5; i++) setTimeout(() => this._spawnParticle(), i * 75);
  }

  _stopParticles() {
    clearInterval(this._ptInt);   this._ptInt   = null;
    clearInterval(this._waveInt); this._waveInt = null;
  }

  // ── Sparkle system ───────────────────────────────────────────

  _startSparkles() {
    if (this._sparkInt) return;
    this._sparkInt = setInterval(() => {
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const dot = this._allDots[Math.floor(Math.random() * this._allDots.length)];
        if (!dot || dot.classList.contains("sparkle")) continue;
        dot.classList.add("sparkle");
        setTimeout(() => dot.classList.remove("sparkle"), 750);
      }
    }, 270);
  }

  _stopSparkles() {
    clearInterval(this._sparkInt);
    this._sparkInt = null;
  }
}

customElements.define("xiaomi-air-purifier-card-final", XiaomiAirPurifierCardFinal);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        "xiaomi-air-purifier-card-final",
  name:        "Xiaomi Air Purifier — Final Edition",
  description: "Card ilustrat cu purificator SVG 3D, particule, LCD ciclic și integrare HA completă",
  preview:     true,
});
