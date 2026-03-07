// ============================================================
//  Xiaomi MIoT Air Purifier Card  —  Lovelace Custom Card
//  Place at: /config/www/xiaomi-air-purifier-card.js
//
//  Minimal config:
//    type: custom:xiaomi-air-purifier-card
//    entity: fan.zhimi_mc2_XXXX_air_purifier
//
//  Full config:
//    type: custom:xiaomi-air-purifier-card
//    entity: fan.zhimi_mc2_XXXX_air_purifier
//    name: Living Room          # override friendly name
//    color: "#38bdf8"           # override accent (default: auto from AQI)
//    entity_pm25: sensor.XXX    # override sensors (auto-detected by default)
//    entity_humidity: ...
//    entity_temperature: ...
//    entity_filter: ...
// ============================================================

const CIRC = 2 * Math.PI * 104; // r=104
const ARC  = CIRC * 0.75;       // 270° arc

// ── AQI colour + label ────────────────────────────────────────
function aqiInfo(val) {
  const n = Number(val);
  if (isNaN(n))  return { color: "#4b5563", rgb: "75,85,99",    label: "—",         cls: "" };
  if (n <= 12)   return { color: "#4ade80", rgb: "74,222,128",  label: "Excellent",  cls: "good" };
  if (n <= 35)   return { color: "#86efac", rgb: "134,239,172", label: "Good",       cls: "good" };
  if (n <= 55)   return { color: "#fbbf24", rgb: "251,191,36",  label: "Moderate",   cls: "mod"  };
  if (n <= 150)  return { color: "#fb923c", rgb: "251,146,60",  label: "Unhealthy",  cls: "bad"  };
  return           { color: "#f87171", rgb: "248,113,113",      label: "Hazardous",  cls: "bad"  };
}

// ── Fan animation speed per mode ─────────────────────────────
function fanDuration(fanState) {
  if (!fanState || fanState.state !== "on") return "2s";
  switch (fanState.attributes.preset_mode) {
    case "Sleep":    return "2.2s";
    case "Auto":     return "0.8s";
    case "Favorite": return "0.3s";
    default:         return "1.4s";
  }
}

// ── Derive sensor IDs from fan entity ────────────────────────
function sensorIds(config) {
  // fan.zhimi_mc2_f0a6_air_purifier → base = zhimi_mc2_f0a6
  const base = config.entity.replace(/^fan\./, "").replace(/_air_purifier$/, "");
  return {
    fan:    config.entity,
    pm25:   config.entity_pm25        || `sensor.${base}_pm25_density`,
    hum:    config.entity_humidity    || `sensor.${base}_relative_humidity`,
    temp:   config.entity_temperature || `sensor.${base}_indoor_temperature`,
    filter: config.entity_filter      || `sensor.${base}_filter_life_level`,
  };
}

// ── Styles (scoped inside Shadow DOM) ────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  :host { display: block; font-family: 'Inter', sans-serif; }

  .card {
    background: #161820;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.055);
    padding: 22px 20px 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.5);
    transition: transform 0.4s cubic-bezier(.22,.68,0,1.2), box-shadow 0.4s ease;
    box-sizing: border-box;
  }
  .card::before {
    content: '';
    position: absolute;
    top: -40px; left: 50%; transform: translateX(-50%);
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(var(--rgb),0.07) 0%, transparent 65%);
    pointer-events: none;
    transition: opacity 0.5s;
  }
  .card.off::before { opacity: 0; }

  /* TOP BAR */
  .top-bar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px;
  }
  .mode-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 11px 5px 9px; border-radius: 20px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
    font-size: 12px; font-weight: 500; color: #6b7280;
    cursor: pointer; transition: all 0.2s; letter-spacing: -0.1px;
    position: relative; user-select: none;
  }
  .mode-pill:hover { background: rgba(255,255,255,0.07); color: #9ca3af; }
  .mode-pill svg { width: 12px; height: 12px; flex-shrink: 0; }

  .mode-dropdown {
    display: none; position: absolute;
    top: calc(100% + 6px); left: 0;
    background: #1e2030; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; overflow: hidden; z-index: 10;
    min-width: 110px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .mode-dropdown.open { display: block; }
  .mode-opt {
    padding: 9px 14px; font-size: 12px; font-weight: 500; color: #6b7280;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .mode-opt:hover { background: rgba(255,255,255,0.05); color: #d1d5db; }
  .mode-opt.active { color: var(--accent); }

  .pwr {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.3s ease; flex-shrink: 0;
  }
  .pwr:hover { background: rgba(255,255,255,0.07); }
  .pwr.on { background: rgba(var(--rgb),0.12); border-color: rgba(var(--rgb),0.35); box-shadow: 0 0 12px rgba(var(--rgb),0.2); }
  .pwr svg { width: 13px; height: 13px; stroke: #374151; fill: none; stroke-width: 2; stroke-linecap: round; transition: stroke 0.3s; }
  .pwr.on svg { stroke: var(--accent); }

  /* VISUAL */
  .vis {
    display: flex; justify-content: center; align-items: center;
    height: 230px; position: relative; margin-bottom: 14px;
  }
  .ring-svg {
    position: absolute; width: 240px; height: 240px;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(135deg);
    overflow: visible; pointer-events: none;
  }
  .r-track {
    fill: none; stroke: rgba(255,255,255,0.06);
    stroke-width: 3; stroke-linecap: round;
    stroke-dasharray: 490 653;
  }
  .r-fill {
    fill: none; stroke: var(--accent);
    stroke-width: 3; stroke-linecap: round;
    stroke-dasharray: 0 653;
    transition: stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1);
    filter: drop-shadow(0 0 4px var(--accent)) drop-shadow(0 0 10px rgba(var(--rgb),.35));
  }
  .ring-pct-group { transform-origin: 120px 120px; transform: rotate(-135deg); }
  .ring-pct {
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 500;
    fill: rgba(var(--rgb), 0.75); letter-spacing: 0.3px;
  }

  /* particles */
  .pts { position: absolute; inset: 0; pointer-events: none; }
  .pt {
    position: absolute; border-radius: 50%; background: var(--accent);
    filter: blur(1px); opacity: 0;
    animation: drift 5s ease-in-out infinite;
  }
  .card.off .pt { opacity: 0 !important; animation-play-state: paused; }
  .pt:nth-child(1){width:3px;height:3px;left:18%;bottom:28%;animation-delay:0s;animation-duration:4.5s;}
  .pt:nth-child(2){width:2px;height:2px;left:60%;bottom:34%;animation-delay:.9s;animation-duration:5.2s;}
  .pt:nth-child(3){width:3px;height:3px;left:78%;bottom:24%;animation-delay:1.8s;animation-duration:4.8s;}
  .pt:nth-child(4){width:2px;height:2px;left:12%;bottom:48%;animation-delay:2.7s;animation-duration:5.5s;}
  .pt:nth-child(5){width:2px;height:2px;left:86%;bottom:40%;animation-delay:0.5s;animation-duration:4.2s;}
  .pt:nth-child(odd)  { --dx: -8px; }
  .pt:nth-child(even) { --dx:  7px; }
  @keyframes drift {
    0%   { opacity:0;  transform:translate(0,0); }
    15%  { opacity:.6; }
    85%  { opacity:.2; }
    100% { opacity:0;  transform:translate(var(--dx),-52px); }
  }

  /* PURIFIER */
  .pu {
    position: relative; z-index: 3;
    display: flex; flex-direction: column; align-items: center;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,.5)) drop-shadow(0 12px 28px rgba(0,0,0,.4));
  }
  .pu-top {
    width: 64px; height: 44px;
    background: linear-gradient(170deg,#23263a 0%,#1c1f2e 100%);
    border-radius: 12px 12px 2px 2px;
    border: 1px solid rgba(255,255,255,0.09); border-bottom: 1px solid rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .pu-top::before {
    content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
    background: rgba(255,255,255,0.12);
  }
  .pu-top::after {
    content:''; position:absolute; inset:8px 10px;
    background: repeating-linear-gradient(90deg,rgba(0,0,0,.35) 0 2.5px,transparent 2.5px 6.5px);
    border-radius:3px; opacity:.8;
  }
  .fan {
    position:relative; z-index:2; width:22px; height:22px;
    animation: fspin 1.4s linear infinite;
  }
  .card.off .fan { animation-play-state:paused; }
  @keyframes fspin { to { transform:rotate(360deg); } }

  .pu-body {
    width:64px; height:72px;
    background: linear-gradient(175deg,#1d2031 0%,#181b28 50%,#141726 100%);
    border:1px solid rgba(255,255,255,0.07); border-top:none; border-bottom:none;
    position:relative; overflow:hidden;
    display:flex; align-items:flex-start; justify-content:center;
  }
  .pu-body::before {
    content:''; position:absolute; inset:0;
    background:
      repeating-linear-gradient(0deg,  rgba(255,255,255,.015) 0 1px,transparent 1px 7px),
      repeating-linear-gradient(90deg, rgba(255,255,255,.015) 0 1px,transparent 1px 7px);
  }
  .pu-body::after {
    content:''; position:absolute; right:8px; top:12px; bottom:12px; width:4px;
    background: repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 1.5px,transparent 1.5px 4.5px);
    border-radius:1px;
  }
  .pu-light {
    position:relative; z-index:2; width:14px; height:14px; border-radius:50%;
    background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.08);
    display:flex; align-items:center; justify-content:center;
    margin-top:44px;
  }
  .pu-light::after {
    content:''; width:5px; height:5px; border-radius:50%;
    background:var(--accent); box-shadow:0 0 6px var(--accent),0 0 14px rgba(var(--rgb),.4);
    animation:lpulse 3s ease-in-out infinite;
  }
  .card.off .pu-light::after { background:#1e2233; box-shadow:none; animation:none; }
  @keyframes lpulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6} }

  .pu-base {
    width:64px; height:10px;
    background: linear-gradient(180deg,#161926 0%,#11141f 100%);
    border-radius:0 0 10px 10px;
    border:1px solid rgba(255,255,255,0.06); border-top:none;
    display:flex; align-items:flex-end; justify-content:space-between; padding:0 12px 3px;
  }
  .pu-foot { width:8px; height:3px; background:rgba(255,255,255,0.06); border-radius:2px; }
  .pu-led {
    width:48px; height:1.5px; margin-top:6px; border-radius:1px;
    background: linear-gradient(90deg,transparent 0%,var(--accent) 30%,rgba(255,255,255,.8) 50%,var(--accent) 70%,transparent 100%);
    box-shadow:0 0 8px var(--accent),0 0 20px rgba(var(--rgb),.3);
    animation:lshine 3s ease-in-out infinite;
  }
  .card.off .pu-led { background:rgba(255,255,255,0.025); box-shadow:none; animation:none; }
  @keyframes lshine { 0%,100%{opacity:1}50%{opacity:.4} }

  /* INFO */
  .info { text-align:center; margin-bottom:14px; }
  .dname { font-size:13.5px; font-weight:500; color:#d1d5db; letter-spacing:-.2px; }
  .dstatus { font-size:11px; color:#374151; margin-top:2px; transition:color .4s; }
  .dstatus.on { color:rgba(var(--rgb),0.7); }

  /* AQI */
  .aqi-block {
    display:flex; align-items:center;
    background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.045);
    border-radius:16px; padding:14px 16px; margin-bottom:12px;
  }
  .aqi-main { flex:1; }
  .aqi-val { font-size:40px; font-weight:300; line-height:1; color:var(--accent); font-variant-numeric:tabular-nums; letter-spacing:-1px; }
  .aqi-sub { font-size:9.5px; font-weight:500; color:#374151; text-transform:uppercase; letter-spacing:.9px; margin-top:1px; }
  .aqi-tag {
    display:inline-flex; align-items:center; gap:4px;
    padding:2px 8px; border-radius:20px;
    font-size:10px; font-weight:500; margin-top:5px; border:1px solid;
  }
  .good  { color:#4ade80; border-color:rgba(74,222,128,.2);  background:rgba(74,222,128,.07); }
  .mod   { color:#fbbf24; border-color:rgba(251,191,36,.2);  background:rgba(251,191,36,.07); }
  .bad   { color:#f87171; border-color:rgba(248,113,113,.2); background:rgba(248,113,113,.07); }
  .tdot  { width:5px; height:5px; border-radius:50%; background:currentColor; animation:tdp 2s infinite; display:inline-block; }
  @keyframes tdp { 0%,100%{transform:scale(1)}50%{transform:scale(1.5);opacity:.55} }
  .divider { width:1px; height:48px; background:linear-gradient(180deg,transparent,rgba(255,255,255,.065),transparent); margin:0 14px; flex-shrink:0; }
  .side-stats { display:flex; flex-direction:column; gap:7px; }
  .srow { display:flex; align-items:center; gap:7px; font-size:12px; font-weight:400; color:#9ca3af; }
  .srow svg { width:11px; height:11px; flex-shrink:0; opacity:.5; }
  .srow em { font-style:normal; font-size:10px; color:#374151; }
  .na { color:#374151; }

  /* SPEED */
  .section-lbl { font-size:9.5px; font-weight:500; color:#374151; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .speed-row { display:flex; gap:4px; margin-bottom:12px; }
  .spb {
    flex:1; padding:7px 2px; border-radius:10px;
    border:1px solid rgba(255,255,255,0.055); background:rgba(255,255,255,0.02);
    color:#374151; font-size:10px; font-weight:500; font-family:'Inter',sans-serif;
    cursor:pointer; text-align:center; line-height:1.4; transition:all .18s;
  }
  .spb:hover { background:rgba(255,255,255,.05); color:#9ca3af; border-color:rgba(255,255,255,.1); }
  .spb.active { background:rgba(var(--rgb),.1); border-color:rgba(var(--rgb),.3); color:var(--accent); }
  .spico { font-size:11px; display:block; margin-bottom:1px; opacity:.8; }

  /* FILTER */
  .frow { display:flex; align-items:center; gap:8px; }
  .flbl { font-size:9.5px; color:#374151; text-transform:uppercase; letter-spacing:.8px; white-space:nowrap; }
  .ftrack { flex:1; height:2.5px; background:rgba(255,255,255,.04); border-radius:2px; overflow:hidden; }
  .ffill { height:100%; border-radius:2px; background:linear-gradient(90deg,var(--accent),rgba(255,255,255,.5)); transition:width 1s ease; }
  .fpct { font-size:10.5px; font-weight:500; color:rgba(var(--rgb),.75); white-space:nowrap; }
`;

// ── Card class ────────────────────────────────────────────────
class XiaomiAirPurifierCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config   = null;
    this._hass     = null;
    this._ids      = null;
    this._built    = false;
  }

  setConfig(config) {
    if (!config.entity) throw new Error("xiaomi-air-purifier-card: 'entity' is required");
    this._config = config;
    this._ids    = sensorIds(config);
    this._built  = false; // force rebuild on config change
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() { return 6; }

  // ── Build shadow DOM skeleton once ──────────────────────────
  _build() {
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="card"></div>`;
    this._built = true;
  }

  // ── Sync DOM to current hass state ──────────────────────────
  _update() {
    if (!this._config || !this._hass) return;
    if (!this._built) this._build();

    const ids  = this._ids;
    const hass = this._hass;
    const card = this.shadowRoot.querySelector(".card");

    const fanState = hass.states[ids.fan];
    if (!fanState) {
      card.innerHTML = `<p style="color:#f87171;padding:16px;font-size:12px">Entity not found:<br>${ids.fan}</p>`;
      return;
    }

    const isOn      = fanState.state === "on";
    const mode      = fanState.attributes.preset_mode || "—";
    const modes     = fanState.attributes.preset_modes || ["Auto", "Sleep", "Favorite"];

    const pm25S     = hass.states[ids.pm25];
    const humS      = hass.states[ids.hum];
    const tempS     = hass.states[ids.temp];
    const filterS   = hass.states[ids.filter];

    const pm25Val   = pm25S   ? Math.round(Number(pm25S.state))   : null;
    const humVal    = humS    ? Math.round(Number(humS.state))     : null;
    const tempVal   = tempS   ? Number(tempS.state).toFixed(1)     : null;
    const filterPct = filterS ? Math.round(Number(filterS.state))  : null;

    const aqi       = aqiInfo(pm25Val);
    const accent    = this._config.color || (isOn ? aqi.color : "#374151");
    const rgb       = this._config.color  ? "56,189,248" : (isOn ? aqi.rgb : "55,65,81");
    const name      = this._config.name  || fanState.attributes.friendly_name || ids.fan;
    const fanDur    = fanDuration(fanState);
    // Gauge = AQI, scaled 0-150 (>150 = full arc, already red/hazardous)
    const aqiPct    = pm25Val !== null ? Math.min(pm25Val / 150 * 100, 100) : 0;
    const fillDash  = isOn && pm25Val !== null
      ? (ARC * aqiPct / 100).toFixed(1) + " " + CIRC.toFixed(1)
      : "0 " + CIRC.toFixed(1);





    const modeIcons = { Auto: "⟳", Sleep: "☽", Favorite: "★" };

    // Apply CSS vars + on/off class
    card.style.cssText = `--accent:${accent};--rgb:${rgb};`;
    card.className = "card " + (isOn ? "on" : "off");

    card.innerHTML = `
      <div class="top-bar">
        <div class="mode-pill" id="mode-pill">
          <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
            <path d="M3 3v4h.5M13 8a5 5 0 0 0-9.5-1M13 13v-4h-.5M3 8a5 5 0 0 0 9.5 1"/>
          </svg>
          <span>${mode}</span>
          <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 16 16">
            <path d="M4 6l4 4 4-4"/>
          </svg>
          <div class="mode-dropdown" id="mode-dropdown">
            ${modes.map(m => `
              <div class="mode-opt${m === mode ? " active" : ""}" data-mode="${m}">
                ${modeIcons[m] || "·"} ${m}
              </div>`).join("")}
          </div>
        </div>
        <div class="pwr${isOn ? " on" : ""}" id="pwr-btn">
          <svg viewBox="0 0 24 24"><path d="M12 2v6M6.34 6.34a9 9 0 1 0 11.32 0"/></svg>
        </div>
      </div>

      <div class="vis">
        <svg class="ring-svg" viewBox="0 0 240 240">
          <circle class="r-track" cx="120" cy="120" r="104"/>
          <circle class="r-fill" cx="120" cy="120" r="104" style="stroke-dasharray:${fillDash}"/>
          <g class="ring-pct-group">
            <text class="ring-pct" x="120" y="232" text-anchor="middle">
              ${pm25Val !== null ? pm25Val + " AQI" : "—"}
            </text>
          </g>
        </svg>
        <div class="pts">
          <div class="pt"></div><div class="pt"></div><div class="pt"></div>
          <div class="pt"></div><div class="pt"></div>
        </div>
        <div class="pu">
          <div class="pu-top">
            <svg class="fan" style="animation-duration:${fanDur}" viewBox="0 0 22 22" fill="none">
              <path d="M11 11C11 7.8 13 5.5 15.5 6.5C17.2 7.2 17 9.8 15.2 10.8C13.4 11.8 12 11 11 11"
                    fill="${accent}44" stroke="${accent}bb" stroke-width=".5"/>
              <path d="M11 11C7.8 11 5.5 9 6.5 6.5C7.2 4.8 9.8 5 10.8 6.8C11.8 8.6 11 10 11 11"
                    fill="${accent}30" stroke="${accent}88" stroke-width=".5"/>
              <path d="M11 11C11 14.2 9 16.5 6.5 15.5C4.8 14.8 5 12.2 6.8 11.2C8.6 10.2 10 11 11 11"
                    fill="${accent}44" stroke="${accent}bb" stroke-width=".5"/>
              <path d="M11 11C14.2 11 16.5 13 15.5 15.5C14.8 17.2 12.2 17 11.2 15.2C10.2 13.4 11 12 11 11"
                    fill="${accent}30" stroke="${accent}88" stroke-width=".5"/>
              <circle cx="11" cy="11" r="2" fill="${accent}ee"/>
            </svg>
          </div>
          <div class="pu-body"><div class="pu-light"></div></div>
          <div class="pu-base"><div class="pu-foot"></div><div class="pu-foot"></div></div>
          <div class="pu-led"></div>
        </div>
      </div>

      <div class="info">
        <div class="dname">${name}</div>
        <div class="dstatus${isOn ? " on" : ""}">${isOn ? "On" : "Off"}</div>
      </div>

      <div class="aqi-block">
        <div class="aqi-main">
          <div class="aqi-val">${pm25Val !== null ? pm25Val : "—"}</div>
          <div class="aqi-sub">AQI · PM2.5</div>
          ${pm25Val !== null ? `<div class="aqi-tag ${aqi.cls}"><span class="tdot"></span> ${aqi.label}</div>` : ""}
        </div>
        <div class="divider"></div>
        <div class="side-stats">
          <div class="srow">
            <svg fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" viewBox="0 0 12 12">
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.5 1.5M8 8l1.5 1.5M2.5 9.5L4 8M8 4l1.5-1.5"/>
            </svg>
            ${humVal !== null ? `${humVal}% <em>RH</em>` : `<span class="na">—</span>`}
          </div>
          <div class="srow">
            <svg fill="none" stroke="#f59e0b" stroke-width="1.2" viewBox="0 0 12 12">
              <path d="M6 1C4.3 1 2.5 2.8 2.5 5.3S4.5 10 6 11C7.5 10 9.5 8 9.5 5.3S7.7 1 6 1z"/>
            </svg>
            ${tempVal !== null ? `${tempVal}°C` : `<span class="na">—</span>`}
          </div>
          <div class="srow">
            <svg fill="none" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="4"/><path d="M6 3.8V6l1.8 1.4"/>
            </svg>
            ${filterPct !== null ? `${filterPct}% <em>filter</em>` : `<span class="na">—</span>`}
          </div>
        </div>
      </div>

      <div class="section-lbl">Fan Speed</div>
      <div class="speed-row" id="speed-row">
        ${modes.map(m => `
          <button class="spb${m === mode ? " active" : ""}" data-mode="${m}">
            <span class="spico">${modeIcons[m] || "·"}</span>${m}
          </button>`).join("")}
      </div>

      <div class="frow">
        <span class="flbl">Filter</span>
        <div class="ftrack">
          <div class="ffill" style="width:${filterPct !== null ? filterPct : 0}%"></div>
        </div>
        <span class="fpct">${filterPct !== null ? filterPct + "%" : "—"}</span>
      </div>
    `;

    // ── Event: power toggle ────────────────────────────────────
    card.querySelector("#pwr-btn").addEventListener("click", () => {
      this._hass.callService("fan", isOn ? "turn_off" : "turn_on", { entity_id: ids.fan });
    });

    // ── Event: mode pill dropdown ──────────────────────────────
    const pill     = card.querySelector("#mode-pill");
    const dropdown = card.querySelector("#mode-dropdown");
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });
    // Close on outside click (shadow DOM needs document listener)
    const close = () => dropdown.classList.remove("open");
    document.addEventListener("click", close, { once: true });

    dropdown.querySelectorAll(".mode-opt").forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        this._hass.callService("fan", "set_preset_mode", {
          entity_id: ids.fan,
          preset_mode: opt.dataset.mode,
        });
        dropdown.classList.remove("open");
      });
    });

    // ── Event: speed buttons ───────────────────────────────────
    card.querySelector("#speed-row").querySelectorAll(".spb").forEach(btn => {
      btn.addEventListener("click", () => {
        this._hass.callService("fan", "set_preset_mode", {
          entity_id: ids.fan,
          preset_mode: btn.dataset.mode,
        });
      });
    });
  }
}

customElements.define("xiaomi-air-purifier-card", XiaomiAirPurifierCard);

// Register in Lovelace card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type:        "xiaomi-air-purifier-card",
  name:        "Xiaomi Air Purifier",
  description: "Card animat pentru purificatorul Xiaomi MIoT",
  preview:     true,
});
