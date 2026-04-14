// ============================================================
//  Xiaomi MIoT Air Purifier Card v2 — PNG + SVG Overlay
//  Place at: /config/www/xiaomi-air-purifier-card-v2.js
//  Images:   /config/www/purifier_green.png
//            /config/www/purifier_yellow.png
//            /config/www/purifier_red.png
//            /config/www/purifier_blue.png
//            /config/www/purifier_off.png
//
//  Config:
//    type: custom:xiaomi-air-purifier-card-v2
//    entity: fan.zhimi_mc2_XXXX_air_purifier
//    name: Living Room
//    entity_pm25: sensor.XXX
//    entity_humidity: ...
//    entity_temperature: ...
//    entity_filter: ...
// ============================================================

// ── AQI colour + label ────────────────────────────────────────
function aqiInfo(val) {
  const n = Number(val);
  if (isNaN(n))  return { color: "#4b5563", rgb: "75,85,99",    label: "—",         cls: "",    img: "off" };
  if (n <= 12)   return { color: "#4ade80", rgb: "74,222,128",  label: "Excellent",  cls: "good", img: "green" };
  if (n <= 35)   return { color: "#86efac", rgb: "134,239,172", label: "Good",       cls: "good", img: "green" };
  if (n <= 55)   return { color: "#fbbf24", rgb: "251,191,36",  label: "Moderate",   cls: "mod",  img: "yellow" };
  if (n <= 150)  return { color: "#fb923c", rgb: "251,146,60",  label: "Unhealthy",  cls: "bad",  img: "red" };
  return           { color: "#f87171", rgb: "248,113,113",      label: "Hazardous",  cls: "bad",  img: "red" };
}

function tempColor(t) {
  if (t < 18) return { color: "#67e8f9", rgb: "103,232,249" };
  if (t < 24) return { color: "#4ade80", rgb: "74,222,128" };
  if (t < 28) return { color: "#fbbf24", rgb: "251,191,36" };
  return             { color: "#f87171", rgb: "248,113,113" };
}

function humColor(h) {
  if (h < 30) return { color: "#fbbf24", rgb: "251,191,36" };
  if (h < 60) return { color: "#38bdf8", rgb: "56,189,248" };
  return             { color: "#818cf8", rgb: "129,140,248" };
}

function hex2rgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// ── Derive sensor IDs from fan entity ────────────────────────
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

// ── Image map (AQI → PNG filename) ──────────────────────────
function purifierImageUrl(aqiImg, isOn) {
  if (!isOn) return "/local/purifier_off.png";
  const map = {
    green:  "/local/purifier_green.png",
    yellow: "/local/purifier_yellow.png",
    red:    "/local/purifier_red.png",
    blue:   "/local/purifier_blue.png",
    off:    "/local/purifier_off.png",
  };
  return map[aqiImg] || map.green;
}

// ── Styles ────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  :host { display: block; font-family: 'Inter', sans-serif; }

  .card {
    background: #161820;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.055);
    padding: 20px 20px 18px;
    position: relative;
    overflow: visible;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.5);
    box-sizing: border-box;
    --accent: #4ade80; --rgb: 74,222,128;
  }
  .card.off { --accent: #374151; --rgb: 55,65,81; }

  /* TOP BAR */
  .top-bar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px; position: relative; z-index: 10;
  }
  .mode-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 11px 5px 9px; border-radius: 20px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
    font-size: 12px; font-weight: 500; color: #9ca3af;
    cursor: pointer; transition: all 0.2s; user-select: none; position: relative;
  }
  .mode-pill:hover { background: rgba(255,255,255,0.07); color: #d1d5db; }
  .mode-pill svg { width: 12px; height: 12px; flex-shrink: 0; }
  .mode-dropdown {
    display: none; position: absolute; top: calc(100% + 6px); left: 0;
    background: #1e2030; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; overflow: hidden; z-index: 30;
    min-width: 110px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .mode-dropdown.open { display: block; }
  .mode-opt {
    padding: 9px 14px; font-size: 12px; font-weight: 500; color: #9ca3af;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .mode-opt:hover { background: rgba(255,255,255,0.05); color: #d1d5db; }
  .mode-opt.active { color: var(--accent); }
  .pwr {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.3s; flex-shrink: 0;
  }
  .pwr.on { background: rgba(var(--rgb),0.12); border-color: rgba(var(--rgb),0.35); box-shadow: 0 0 12px rgba(var(--rgb),0.2); }
  .pwr svg { width: 13px; height: 13px; stroke: #6b7280; fill: none; stroke-width: 2; stroke-linecap: round; transition: stroke 0.3s; }
  .pwr.on svg { stroke: var(--accent); }

  /* VIS — PNG + overlay container */
  .vis {
    display: flex; justify-content: center; align-items: flex-end;
    height: 290px; position: relative; margin-bottom: 12px;
  }
  .vis::before {
    content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 180px; height: 50px;
    background: radial-gradient(ellipse, rgba(var(--rgb),0.12) 0%, transparent 70%);
    pointer-events: none; transition: opacity 0.5s;
  }
  .card.off .vis::before { opacity: 0; }

  .purifier-wrap {
    position: relative; z-index: 1; width: 180px; height: auto;
  }
  .purifier-png {
    width: 180px; height: auto; display: block;
    transition: filter 0.4s;
  }
  .card.off .purifier-png { filter: saturate(0.15) brightness(0.8); }

  /* SVG overlay — positioned over the screen area of the PNG */
  .screen-overlay {
    position: absolute;
    /* Percentages relative to the PNG dimensions (330x534) */
    /* Screen area: ~x=120-222, y=198-280 in 330x534 image */
    /* As percentages: left=36.4%, top=37.1%, width=30.9%, height=15.4% */
    left: 35%;
    top: 35.5%;
    width: 32%;
    height: 17%;
    pointer-events: all;
    z-index: 3;
  }

  /* Particle canvas */
  .pt-canvas {
    position: absolute; inset: 0; pointer-events: none; z-index: 4;
  }

  /* INFO */
  .info { text-align: center; margin-bottom: 12px; }
  .dname { font-size: 13.5px; font-weight: 500; color: #d1d5db; }
  .dstatus { font-size: 11px; color: rgba(var(--rgb),0.7); margin-top: 2px; transition: color 0.4s; }
  .card.off .dstatus { color: #6b7280; }

  /* AQI BLOCK */
  .aqi-block {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.045);
    border-radius: 16px; padding: 12px 14px; margin-bottom: 12px;
  }
  .aqi-main { flex: 1; }
  .aqi-val { font-size: 38px; font-weight: 300; line-height: 1; color: var(--accent); font-variant-numeric: tabular-nums; letter-spacing: -1px; transition: color 0.4s; }
  .aqi-sub { font-size: 9.5px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: .9px; margin-top: 1px; }
  .aqi-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 500; margin-top: 4px; border: 1px solid; }
  .good { color: #4ade80; border-color: rgba(74,222,128,0.2); background: rgba(74,222,128,0.07); }
  .mod  { color: #fbbf24; border-color: rgba(251,191,36,0.2);  background: rgba(251,191,36,0.07); }
  .bad  { color: #f87171; border-color: rgba(248,113,113,0.2); background: rgba(248,113,113,0.07); }
  .tdot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: tdp 2s infinite; display: inline-block; }
  @keyframes tdp { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5);opacity:.55} }
  .divider { width: 1px; height: 44px; background: linear-gradient(180deg,transparent,rgba(255,255,255,.065),transparent); margin: 0 12px; flex-shrink: 0; }
  .side-stats { display: flex; flex-direction: column; gap: 6px; }
  .srow { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #9ca3af; }
  .srow svg { width: 11px; height: 11px; flex-shrink: 0; opacity: .7; }
  .srow em { font-style: normal; font-size: 10px; color: #6b7280; }
  .na { color: #6b7280; }

  /* SPEED */
  .sec-lbl { font-size:9.5px; font-weight:500; color:#374151; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .speed-row { display: flex; gap: 4px; margin-bottom: 10px; }
  .spb {
    flex: 1; padding: 7px 2px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.04);
    color: #9ca3af;
    font-size: 10px; font-weight: 500; font-family: 'Inter', sans-serif;
    cursor: pointer; text-align: center; line-height: 1.4; transition: all .18s;
  }
  .spb:hover { background: rgba(255,255,255,.07); color: #d1d5db; border-color: rgba(255,255,255,.15); }
  .spb.active { background: rgba(var(--rgb),.12); border-color: rgba(var(--rgb),.35); color: var(--accent); }
  .spico { font-size: 11px; display: block; margin-bottom: 1px; opacity: 0.8; }

  /* FILTER */
  .frow { display: flex; align-items: center; gap: 8px; }
  .flbl { font-size: 9.5px; color: #6b7280; text-transform: uppercase; letter-spacing: .8px; white-space: nowrap; }
  .ftrack { flex: 1; height: 2.5px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
  .ffill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--accent), rgba(255,255,255,.5)); transition: width 1s ease; }
  .fpct { font-size: 10.5px; font-weight: 500; color: rgba(var(--rgb),.75); white-space: nowrap; }
`;

// ── Card class ────────────────────────────────────────────────
class XiaomiAirPurifierCardV2 extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config  = null;
    this._hass    = null;
    this._ids     = null;
    this._built   = false;
    this._lcdPage = 0;
    this._ptCanvas = null;
    this._ptCtx    = null;
    this._particles = [];
    this._ptRunning = false;
    this._modes = ["Sleep", "Auto", "Favorite"];
  }

  setConfig(config) {
    if (!config.entity) throw new Error("xiaomi-air-purifier-card-v2: 'entity' is required");
    this._config = config;
    this._ids    = sensorIds(config);
    this._built  = false;
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() { return 7; }

  _build() {
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="card"></div>`;
    this._built = true;
  }

  // ── LCD color based on current page ─────────────────────────
  _lcdColor(isOn, pm25Val, tempVal, humVal) {
    if (!isOn) return "#2a2a2a";
    if (this._lcdPage === 0) return pm25Val !== null ? aqiInfo(pm25Val).color : "#4ade80";
    if (this._lcdPage === 1) return tempVal !== null ? tempColor(tempVal).color : "#4ade80";
    return humVal !== null ? humColor(humVal).color : "#38bdf8";
  }

  // ── Update LCD display (SVG overlay on screen) ─────────────
  _updateLcd(sr, col, pm25Val, tempVal, humVal) {
    const main = sr.getElementById("lcdMain");
    const sub  = sr.getElementById("lcdSub");
    if (!main || !sub) return;

    main.setAttribute("fill", col);
    sub.setAttribute("fill", col);
    sub.setAttribute("opacity", "0.5");

    // Update SVG button colors
    const btn4Circle = sr.getElementById("btn4Circle");
    const btn4Blade1 = sr.getElementById("btn4Blade1");
    const btn4Blade2 = sr.getElementById("btn4Blade2");
    const btn4Center = sr.getElementById("btn4Center");
    if (btn4Circle) {
      const rgb = hex2rgb(col === "#2a2a2a" ? "#444444" : col);
      btn4Circle.setAttribute("fill", `rgba(${rgb},0.15)`);
      btn4Circle.setAttribute("stroke", `rgba(${rgb},0.45)`);
      btn4Blade1.setAttribute("fill", `rgba(${rgb},0.8)`);
      btn4Blade2.setAttribute("fill", `rgba(${rgb},0.6)`);
      btn4Center.setAttribute("fill", `rgba(${rgb},0.9)`);
    }

    if (this._lcdPage === 0) {
      main.textContent = pm25Val !== null ? pm25Val : "—";
      sub.textContent  = "AQI · PM2.5";
      main.setAttribute("font-size", "22");
      main.setAttribute("letter-spacing", "2");
    } else if (this._lcdPage === 1) {
      main.textContent = tempVal !== null ? tempVal + "°C" : "—";
      sub.textContent  = "TEMPERATURE";
      main.setAttribute("font-size", "16");
      main.setAttribute("letter-spacing", "0.5");
    } else {
      main.textContent = humVal !== null ? humVal + "%" : "—";
      sub.textContent  = "HUMIDITY RH";
      main.setAttribute("font-size", "22");
      main.setAttribute("letter-spacing", "2");
    }
  }

  // ── Particle system ─────────────────────────────────────────
  _initParticles() {
    const canvas = this.shadowRoot.querySelector(".pt-canvas");
    if (!canvas) return;
    this._ptCanvas = canvas;
    this._ptCtx    = canvas.getContext("2d");
    this._resizeCanvas();
    if (!this._ptRunning) {
      this._ptRunning = true;
      this._animateParticles();
    }
  }

  _resizeCanvas() {
    if (!this._ptCanvas) return;
    const vis = this._ptCanvas.parentElement;
    if (vis) {
      this._ptCanvas.width  = vis.offsetWidth;
      this._ptCanvas.height = vis.offsetHeight;
    }
  }

  _particleParams(isOn, mode, pm25Val) {
    if (!isOn) return { speed: 0, rate: 0 };
    if (mode === "Sleep")    return { speed: 0.25, rate: 0.07 };
    if (mode === "Favorite") return { speed: 2.2,  rate: 0.60 };
    const t = Math.min(pm25Val || 0, 200) / 200;
    return { speed: 0.15 + t * 1.25, rate: 0.05 + t * 0.33 };
  }

  _spawnParticle(speed, col) {
    const pngEl = this.shadowRoot.querySelector(".purifier-png");
    const canvas = this._ptCanvas;
    if (!pngEl || !canvas) return;
    const pr = pngEl.getBoundingClientRect();
    const vr = canvas.parentElement.getBoundingClientRect();
    const sl = pr.left - vr.left, st = pr.top - vr.top;
    const sw = pr.width, sh = pr.height;

    // Spawn from top area of the purifier (ventilation slats)
    this._particles.push({
      x:     sl + sw * (0.25 + Math.random() * 0.5),
      y:     st + sh * 0.03 + Math.random() * sh * 0.06,
      vx:    (Math.random() - 0.5) * 0.4 * speed,
      vy:    -(0.45 + Math.random() * 0.75) * speed,
      r:     1.0 + Math.random() * 2.0,
      life:  1.0,
      decay: (0.006 + Math.random() * 0.007) * (0.4 + speed * 0.55),
      color: col,
    });
  }

  _animateParticles() {
    if (!this._ptCtx || !this._ptCanvas) return;
    const ctx = this._ptCtx;
    ctx.clearRect(0, 0, this._ptCanvas.width, this._ptCanvas.height);

    const fanState = this._hass && this._ids ? this._hass.states[this._ids.fan] : null;
    const isOn     = fanState && fanState.state === "on";
    const mode     = fanState ? (fanState.attributes.preset_mode || "Auto") : "Auto";
    const pm25S    = this._hass && this._ids ? this._hass.states[this._ids.pm25] : null;
    const pm25Val  = pm25S ? Math.round(Number(pm25S.state)) : 0;
    const { speed, rate } = this._particleParams(isOn, mode, pm25Val);
    const col = this._lcdColor(isOn, pm25Val,
      this._hass && this._ids && this._hass.states[this._ids.temp] ? Number(this._hass.states[this._ids.temp].state) : null,
      this._hass && this._ids && this._hass.states[this._ids.hum]  ? Math.round(Number(this._hass.states[this._ids.hum].state)) : null
    );

    if (Math.random() < rate) this._spawnParticle(speed, col);

    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) { this._particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.75;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(() => this._animateParticles());
  }

  // ── Main render ──────────────────────────────────────────────
  _update() {
    if (!this._config || !this._hass) return;
    if (!this._built) this._build();

    const ids      = this._ids;
    const hass     = this._hass;
    const sr       = this.shadowRoot;
    const card     = sr.querySelector(".card");

    const fanState = hass.states[ids.fan];
    if (!fanState) {
      card.innerHTML = `<p style="color:#f87171;padding:16px;font-size:12px">Entity not found:<br>${ids.fan}</p>`;
      return;
    }

    const isOn      = fanState.state === "on";
    const mode      = fanState.attributes.preset_mode || "Auto";
    const modes     = fanState.attributes.preset_modes || this._modes;
    const pm25S     = hass.states[ids.pm25];
    const humS      = hass.states[ids.hum];
    const tempS     = hass.states[ids.temp];
    const filterS   = hass.states[ids.filter];
    const pm25Val   = pm25S   ? Math.round(Number(pm25S.state))  : null;
    const humVal    = humS    ? Math.round(Number(humS.state))    : null;
    const tempVal   = tempS   ? Number(tempS.state).toFixed(1)    : null;
    const filterPct = filterS ? Math.round(Number(filterS.state)) : null;
    const aqi       = aqiInfo(pm25Val);
    const accent    = isOn ? aqi.color : "#374151";
    const rgb       = isOn ? aqi.rgb   : "55,65,81";
    const name      = this._config.name || fanState.attributes.friendly_name || ids.fan;
    const lcdCol    = this._lcdColor(isOn, pm25Val, tempVal !== null ? Number(tempVal) : null, humVal);
    const imgUrl    = purifierImageUrl(aqi.img, isOn);

    card.style.cssText = `--accent:${accent};--rgb:${rgb};`;
    card.className = "card" + (isOn ? "" : " off");

    const modeIcons = { Auto: "⟳", Sleep: "☽", Favorite: "★" };

    card.innerHTML = `
      <div class="top-bar">
        <div class="mode-pill" id="modePill">
          <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16">
            <path d="M3 3v4h.5M13 8a5 5 0 0 0-9.5-1M13 13v-4h-.5M3 8a5 5 0 0 0 9.5 1"/>
          </svg>
          <span id="modeLabel">${mode}</span>
          <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
          <div class="mode-dropdown" id="modeDropdown">
            ${modes.map(m => `<div class="mode-opt${m === mode ? " active" : ""}" data-mode="${m}">${modeIcons[m] || "·"} ${m}</div>`).join("")}
          </div>
        </div>
        <div class="pwr${isOn ? " on" : ""}" id="pwrBtn">
          <svg viewBox="0 0 24 24"><path d="M12 2v6M6.34 6.34a9 9 0 1 0 11.32 0"/></svg>
        </div>
      </div>

      <div class="vis">
        <canvas class="pt-canvas" id="ptCanvas"></canvas>
        <div class="purifier-wrap">
          <img class="purifier-png" src="${imgUrl}" alt="Air Purifier" />
          <svg class="screen-overlay" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
            <!-- LCD text overlay -->
            <text id="lcdMain" x="50" y="35" text-anchor="middle" font-family="'Courier New',monospace" font-size="22" font-weight="bold" fill="${lcdCol}" letter-spacing="2">${pm25Val !== null ? pm25Val : "—"}</text>
            <text id="lcdSub" x="50" y="50" text-anchor="middle" font-family="Arial,sans-serif" font-size="6" fill="${lcdCol}" opacity="0.5" letter-spacing="1.5">AQI · PM2.5</text>
            <!-- Separator line -->
            <line x1="5" y1="57" x2="95" y2="57" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
            <!-- Button row -->
            <!-- Power button -->
            <circle cx="22" cy="68" r="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
            <path d="M22 63.5v4M20 64.5a3.5 3.5 0 1 0 4 0" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round" fill="none"/>
            <rect x="14" y="60" width="16" height="16" fill="transparent" id="svgPwrBtn" style="cursor:pointer"/>
            <!-- Left arrow -->
            <circle cx="40" cy="68" r="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
            <path d="M42 65L39 68l3 3" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <rect x="32" y="60" width="16" height="16" fill="transparent" id="btnLeft" style="cursor:pointer"/>
            <!-- Right arrow -->
            <circle cx="58" cy="68" r="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
            <path d="M56 65L59 68l-3 3" stroke="rgba(255,255,255,0.55)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <rect x="50" y="60" width="16" height="16" fill="transparent" id="btnRight" style="cursor:pointer"/>
            <!-- Mode/fan button -->
            <circle id="btn4Circle" cx="76" cy="68" r="8" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.45)" stroke-width="0.5"/>
            <path id="btn4Blade1" d="M76 64C77.5 65 77.8 67 76 67.7C74.2 68.4 72.5 67.3 73 65.5C73.5 64.2 75 63.5 76 64Z" fill="rgba(74,222,128,0.8)"/>
            <path id="btn4Blade2" d="M76 72C74.5 71 74.2 69 76 68.3C77.8 67.6 79.5 68.7 79 70.5C78.5 71.8 77 72.5 76 72Z" fill="rgba(74,222,128,0.6)"/>
            <circle id="btn4Center" cx="76" cy="68" r="1.5" fill="rgba(74,222,128,0.9)"/>
            <rect x="68" y="60" width="16" height="16" fill="transparent" id="svgModeBtn" style="cursor:pointer"/>
          </svg>
        </div>
      </div>

      <div class="info">
        <div class="dname">${name}</div>
        <div class="dstatus">${isOn ? "On · " + mode : "Off"}</div>
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
            <svg fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" viewBox="0 0 12 12"><path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.5 1.5M8 8l1.5 1.5M2.5 9.5L4 8M8 4l1.5-1.5"/></svg>
            ${humVal !== null ? `${humVal}% <em>RH</em>` : `<span class="na">—</span>`}
          </div>
          <div class="srow">
            <svg fill="none" stroke="#f59e0b" stroke-width="1.2" viewBox="0 0 12 12"><path d="M6 1C4.3 1 2.5 2.8 2.5 5.3S4.5 10 6 11C7.5 10 9.5 8 9.5 5.3S7.7 1 6 1z"/></svg>
            ${tempVal !== null ? `${tempVal}°C` : `<span class="na">—</span>`}
          </div>
          <div class="srow">
            <svg fill="none" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4"/><path d="M6 3.8V6l1.8 1.4"/></svg>
            ${filterPct !== null ? `${filterPct}% <em>filter</em>` : `<span class="na">—</span>`}
          </div>
        </div>
      </div>

      <div class="sec-lbl">Fan Speed</div>
      <div class="speed-row" id="speedRow">
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

    // Apply LCD state
    this._updateLcd(sr, lcdCol, pm25Val, tempVal !== null ? Number(tempVal) : null, humVal);

    // ── Events ──────────────────────────────────────────────────

    // Power (card button)
    sr.getElementById("pwrBtn").addEventListener("click", () => {
      this._hass.callService("fan", isOn ? "turn_off" : "turn_on", { entity_id: ids.fan });
    });

    // SVG power button
    sr.getElementById("svgPwrBtn").addEventListener("click", () => {
      this._hass.callService("fan", isOn ? "turn_off" : "turn_on", { entity_id: ids.fan });
    });

    // SVG mode button — cycle modes
    sr.getElementById("svgModeBtn").addEventListener("click", () => {
      const idx  = modes.indexOf(mode);
      const next = modes[(idx + 1) % modes.length];
      this._hass.callService("fan", "set_preset_mode", { entity_id: ids.fan, preset_mode: next });
    });

    // Mode dropdown
    const pill     = sr.getElementById("modePill");
    const dropdown = sr.getElementById("modeDropdown");
    pill.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => dropdown.classList.remove("open"), { once: true });
    dropdown.querySelectorAll(".mode-opt").forEach(opt => {
      opt.addEventListener("click", e => {
        e.stopPropagation();
        this._hass.callService("fan", "set_preset_mode", { entity_id: ids.fan, preset_mode: opt.dataset.mode });
        dropdown.classList.remove("open");
      });
    });

    // Speed buttons
    sr.getElementById("speedRow").querySelectorAll(".spb").forEach(btn => {
      btn.addEventListener("click", () => {
        this._hass.callService("fan", "set_preset_mode", { entity_id: ids.fan, preset_mode: btn.dataset.mode });
      });
    });

    // LCD navigation (← →)
    sr.getElementById("btnLeft").addEventListener("click", () => {
      this._lcdPage = (this._lcdPage - 1 + 3) % 3;
      const col = this._lcdColor(isOn, pm25Val, tempVal !== null ? Number(tempVal) : null, humVal);
      this._updateLcd(sr, col, pm25Val, tempVal !== null ? Number(tempVal) : null, humVal);
    });
    sr.getElementById("btnRight").addEventListener("click", () => {
      this._lcdPage = (this._lcdPage + 1) % 3;
      const col = this._lcdColor(isOn, pm25Val, tempVal !== null ? Number(tempVal) : null, humVal);
      this._updateLcd(sr, col, pm25Val, tempVal !== null ? Number(tempVal) : null, humVal);
    });

    // Init particles
    this._initParticles();
  }
}

customElements.define("xiaomi-air-purifier-card-v2", XiaomiAirPurifierCardV2);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        "xiaomi-air-purifier-card-v2",
  name:        "Xiaomi Air Purifier v2",
  description: "Card cu imagini PNG fotorealiste și overlay SVG pentru purificatorul Xiaomi",
  preview:     true,
});
