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
//    name: Living Room
//    entity_pm25: sensor.XXX
//    entity_humidity: ...
//    entity_temperature: ...
//    entity_filter: ...
// ============================================================

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

// ── SVG illustration ─────────────────────────────────────────
function buildPurifierSVG() {
  return `
<svg class="pu-svg" id="puSvg" viewBox="0 0 200 310" xmlns="http://www.w3.org/2000/svg" style="width:180px;height:auto;">
  <defs>
    <linearGradient id="bG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8f9fc"/>
      <stop offset="50%" stop-color="#eceef5"/>
      <stop offset="100%" stop-color="#d8dce8"/>
    </linearGradient>
    <linearGradient id="pG" x1="0%" y1="0%" x2="30%" y2="100%">
      <stop offset="0%" stop-color="#181818"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <radialGradient id="gG" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00000030"/>
      <stop offset="100%" stop-color="#00000000"/>
    </radialGradient>
    <clipPath id="bC"><rect x="8" y="8" width="184" height="290" rx="16"/></clipPath>
  </defs>
  <ellipse cx="100" cy="306" rx="78" ry="7" fill="url(#gG)"/>
  <rect x="8" y="8" width="184" height="290" rx="16" fill="url(#bG)"/>
  <rect x="8" y="8" width="4" height="290" rx="2" fill="rgba(255,255,255,0.65)" clip-path="url(#bC)"/>
  <rect x="8" y="8" width="184" height="4" rx="2" fill="rgba(255,255,255,0.7)" clip-path="url(#bC)"/>
  <rect x="176" y="8" width="16" height="290" fill="rgba(0,0,0,0.045)" clip-path="url(#bC)"/>
  <rect x="8" y="272" width="184" height="26" fill="rgba(0,0,0,0.04)" clip-path="url(#bC)"/>
  <!-- outlet slats -->
  <rect x="24" y="14" width="152" height="1.4" rx="0.7" fill="rgba(100,108,140,0.3)"/>
  <rect x="24" y="18" width="152" height="1.4" rx="0.7" fill="rgba(100,108,140,0.28)"/>
  <rect x="24" y="22" width="152" height="1.4" rx="0.7" fill="rgba(100,108,140,0.24)"/>
  <rect x="24" y="26" width="152" height="1.4" rx="0.7" fill="rgba(100,108,140,0.18)"/>
  <rect x="24" y="30" width="152" height="1.4" rx="0.7" fill="rgba(100,108,140,0.11)"/>
  <!-- panel -->
  <rect x="56" y="48" width="88" height="100" rx="11" fill="url(#pG)"/>
  <rect x="56" y="48" width="88" height="100" rx="11" fill="none" stroke="rgba(60,60,60,0.8)" stroke-width="1"/>
  <rect x="57" y="49" width="86" height="3" rx="2" fill="rgba(255,255,255,0.04)"/>
  <circle cx="84" cy="57" r="1.1" fill="rgba(255,255,255,0.15)"/>
  <circle cx="89" cy="57" r="1.1" fill="rgba(255,255,255,0.15)"/>
  <circle cx="94" cy="57" r="1.1" fill="rgba(255,255,255,0.15)"/>
  <circle cx="99" cy="57" r="1.1" fill="rgba(255,255,255,0.15)"/>
  <circle cx="104" cy="57" r="1.1" fill="rgba(255,255,255,0.15)"/>
  <circle cx="109" cy="57" r="1.1" fill="rgba(255,255,255,0.15)"/>
  <!-- LCD screen -->
  <rect x="63" y="63" width="74" height="44" rx="5" fill="#000000"/>
  <rect x="63" y="63" width="74" height="44" rx="5" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
  <text id="lcdMain" x="100" y="88" text-anchor="middle" font-family="'Courier New',monospace" font-size="20" font-weight="bold" fill="#4ade80" letter-spacing="2">—</text>
  <text id="lcdSub" x="100" y="100" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.8" fill="#4ade80" opacity="0.5" letter-spacing="1.5">AQI · PM2.5</text>
  <line x1="63" y1="112" x2="137" y2="112" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
  <!-- btn 1: power -->
  <circle cx="74" cy="125" r="8.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
  <path d="M74 120.5v4.5M71 122a4.5 4.5 0 1 0 6 0" stroke="rgba(255,255,255,0.5)" stroke-width="1.3" stroke-linecap="round" fill="none"/>
  <rect x="65.5" y="116.5" width="17" height="17" fill="transparent" id="svgPwrBtn" style="cursor:pointer"/>
  <!-- btn 2: arrow left -->
  <circle cx="91" cy="125" r="8.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
  <path d="M93.5 121.5L89 125l4.5 3.5" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="82.5" y="116.5" width="17" height="17" fill="transparent" id="btnLeft" style="cursor:pointer"/>
  <!-- btn 3: arrow right -->
  <circle cx="109" cy="125" r="8.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
  <path d="M106.5 121.5L111 125l-4.5 3.5" stroke="rgba(255,255,255,0.55)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="100.5" y="116.5" width="17" height="17" fill="transparent" id="btnRight" style="cursor:pointer"/>
  <!-- btn 4: fan/mode -->
  <circle id="btn4Circle" cx="126" cy="125" r="8.5" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.45)" stroke-width="0.8"/>
  <path id="btn4Blade1" d="M126 120.5C128 122 128.5 124.5 126 125.5C123.5 126.5 121 125 122 122.5C122.8 120.8 125 120 126 120.5Z" fill="rgba(74,222,128,0.8)"/>
  <path id="btn4Blade2" d="M126 129.5C124 128 123.5 125.5 126 124.5C128.5 123.5 131 125 130 127.5C129.2 129.2 127 130 126 129.5Z" fill="rgba(74,222,128,0.6)"/>
  <circle id="btn4Center" cx="126" cy="125" r="2" fill="rgba(74,222,128,0.9)"/>
  <rect x="117.5" y="116.5" width="17" height="17" fill="transparent" id="svgModeBtn" style="cursor:pointer"/>
  <!-- LED strip -->
  <rect x="72" y="151" width="56" height="2.5" rx="1.25" id="ledStrip" fill="#4ade80" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
  </rect>
  <line x1="12" y1="162" x2="188" y2="162" stroke="rgba(0,0,0,0.07)" stroke-width="1"/>
  <!-- dot grid -->
  <g clip-path="url(#bC)" opacity="0.5">
    <circle cx="16" cy="170" r="1.4" fill="#8890b0"/><circle cx="23.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="31" cy="170" r="1.4" fill="#8890b0"/><circle cx="38.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="46" cy="170" r="1.4" fill="#8890b0"/><circle cx="53.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="61" cy="170" r="1.4" fill="#8890b0"/><circle cx="68.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="76" cy="170" r="1.4" fill="#8890b0"/><circle cx="83.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="91" cy="170" r="1.4" fill="#8890b0"/><circle cx="98.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="106" cy="170" r="1.4" fill="#8890b0"/><circle cx="113.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="121" cy="170" r="1.4" fill="#8890b0"/><circle cx="128.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="136" cy="170" r="1.4" fill="#8890b0"/><circle cx="143.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="151" cy="170" r="1.4" fill="#8890b0"/><circle cx="158.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="166" cy="170" r="1.4" fill="#8890b0"/><circle cx="173.5" cy="170" r="1.4" fill="#8890b0"/><circle cx="181" cy="170" r="1.4" fill="#8890b0"/>
    <circle cx="19.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="27.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="34.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="42.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="49.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="57.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="64.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="72.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="79.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="87.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="94.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="102.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="109.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="117.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="124.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="132.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="139.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="147.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="154.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="162.25" cy="177" r="1.4" fill="#8890b0"/><circle cx="169.75" cy="177" r="1.4" fill="#8890b0"/><circle cx="177.25" cy="177" r="1.4" fill="#8890b0"/>
    <circle cx="16" cy="184" r="1.4" fill="#8890b0"/><circle cx="23.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="31" cy="184" r="1.4" fill="#8890b0"/><circle cx="38.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="46" cy="184" r="1.4" fill="#8890b0"/><circle cx="53.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="61" cy="184" r="1.4" fill="#8890b0"/><circle cx="68.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="76" cy="184" r="1.4" fill="#8890b0"/><circle cx="83.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="91" cy="184" r="1.4" fill="#8890b0"/><circle cx="98.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="106" cy="184" r="1.4" fill="#8890b0"/><circle cx="113.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="121" cy="184" r="1.4" fill="#8890b0"/><circle cx="128.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="136" cy="184" r="1.4" fill="#8890b0"/><circle cx="143.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="151" cy="184" r="1.4" fill="#8890b0"/><circle cx="158.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="166" cy="184" r="1.4" fill="#8890b0"/><circle cx="173.5" cy="184" r="1.4" fill="#8890b0"/><circle cx="181" cy="184" r="1.4" fill="#8890b0"/>
    <circle cx="19.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="27.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="34.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="42.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="49.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="57.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="64.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="72.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="79.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="87.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="94.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="102.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="109.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="117.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="124.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="132.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="139.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="147.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="154.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="162.25" cy="191" r="1.4" fill="#8890b0"/><circle cx="169.75" cy="191" r="1.4" fill="#8890b0"/><circle cx="177.25" cy="191" r="1.4" fill="#8890b0"/>
    <circle cx="16" cy="198" r="1.4" fill="#8890b0"/><circle cx="23.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="31" cy="198" r="1.4" fill="#8890b0"/><circle cx="38.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="46" cy="198" r="1.4" fill="#8890b0"/><circle cx="53.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="61" cy="198" r="1.4" fill="#8890b0"/><circle cx="68.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="76" cy="198" r="1.4" fill="#8890b0"/><circle cx="83.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="91" cy="198" r="1.4" fill="#8890b0"/><circle cx="98.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="106" cy="198" r="1.4" fill="#8890b0"/><circle cx="113.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="121" cy="198" r="1.4" fill="#8890b0"/><circle cx="128.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="136" cy="198" r="1.4" fill="#8890b0"/><circle cx="143.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="151" cy="198" r="1.4" fill="#8890b0"/><circle cx="158.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="166" cy="198" r="1.4" fill="#8890b0"/><circle cx="173.5" cy="198" r="1.4" fill="#8890b0"/><circle cx="181" cy="198" r="1.4" fill="#8890b0"/>
    <circle cx="19.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="27.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="34.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="42.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="49.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="57.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="64.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="72.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="79.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="87.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="94.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="102.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="109.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="117.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="124.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="132.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="139.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="147.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="154.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="162.25" cy="205" r="1.4" fill="#8890b0"/><circle cx="169.75" cy="205" r="1.4" fill="#8890b0"/><circle cx="177.25" cy="205" r="1.4" fill="#8890b0"/>
    <circle cx="16" cy="212" r="1.3" fill="#8890b0"/><circle cx="23.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="31" cy="212" r="1.3" fill="#8890b0"/><circle cx="38.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="46" cy="212" r="1.3" fill="#8890b0"/><circle cx="53.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="61" cy="212" r="1.3" fill="#8890b0"/><circle cx="68.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="76" cy="212" r="1.3" fill="#8890b0"/><circle cx="83.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="91" cy="212" r="1.3" fill="#8890b0"/><circle cx="98.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="106" cy="212" r="1.3" fill="#8890b0"/><circle cx="113.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="121" cy="212" r="1.3" fill="#8890b0"/><circle cx="128.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="136" cy="212" r="1.3" fill="#8890b0"/><circle cx="143.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="151" cy="212" r="1.3" fill="#8890b0"/><circle cx="158.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="166" cy="212" r="1.3" fill="#8890b0"/><circle cx="173.5" cy="212" r="1.3" fill="#8890b0"/><circle cx="181" cy="212" r="1.3" fill="#8890b0"/>
    <circle cx="19.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="27.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="34.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="42.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="49.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="57.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="64.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="72.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="79.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="87.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="94.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="102.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="109.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="117.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="124.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="132.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="139.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="147.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="154.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="162.25" cy="219" r="1.2" fill="#8890b0"/><circle cx="169.75" cy="219" r="1.2" fill="#8890b0"/><circle cx="177.25" cy="219" r="1.2" fill="#8890b0"/>
    <circle cx="16" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="23.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="31" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="38.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="46" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="53.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="61" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="68.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="76" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="83.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="91" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="98.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="106" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="113.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="121" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="128.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="136" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="143.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="151" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="158.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="166" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="173.5" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/><circle cx="181" cy="226" r="1.1" fill="#8890b0" opacity="0.7"/>
    <circle cx="19.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="27.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="34.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="42.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="49.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="57.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="64.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="72.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="79.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="87.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="94.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="102.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="109.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="117.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="124.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="132.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="139.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="147.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="154.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="162.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="169.75" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/><circle cx="177.25" cy="233" r="1.0" fill="#8890b0" opacity="0.4"/>
  </g>
  <rect x="8" y="8" width="184" height="290" rx="16" fill="none" stroke="#c0c5d5" stroke-width="1"/>
</svg>`;
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

  /* VIS */
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
  .pt-canvas { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
  .pu-svg { position: relative; z-index: 1; transition: filter 0.4s; }
  .card.off .pu-svg { filter: saturate(0.15) brightness(0.8); }

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
class XiaomiAirPurifierCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config  = null;
    this._hass    = null;
    this._ids     = null;
    this._built   = false;
    this._lcdPage = 0;          // 0=AQI 1=Temp 2=Humidity
    this._ptCanvas = null;
    this._ptCtx    = null;
    this._particles = [];
    this._ptRunning = false;
    this._modes = ["Sleep", "Auto", "Favorite"];
  }

  setConfig(config) {
    if (!config.entity) throw new Error("xiaomi-air-purifier-card: 'entity' is required");
    this._config = config;
    this._ids    = sensorIds(config);
    this._built  = false;
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() { return 7; }

  // ── Build shadow DOM once ────────────────────────────────────
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

  // ── Update btn4 (fan icon) color ────────────────────────────
  _updateBtn4(sr, col) {
    const rgb = hex2rgb(col);
    sr.getElementById("btn4Circle").setAttribute("fill",  `rgba(${rgb},0.15)`);
    sr.getElementById("btn4Circle").setAttribute("stroke",`rgba(${rgb},0.45)`);
    sr.getElementById("btn4Blade1").setAttribute("fill",  `rgba(${rgb},0.8)`);
    sr.getElementById("btn4Blade2").setAttribute("fill",  `rgba(${rgb},0.6)`);
    sr.getElementById("btn4Center").setAttribute("fill",  `rgba(${rgb},0.9)`);
  }

  // ── Update LCD display ───────────────────────────────────────
  _updateLcd(sr, col, pm25Val, tempVal, humVal) {
    const main = sr.getElementById("lcdMain");
    const sub  = sr.getElementById("lcdSub");
    const led  = sr.getElementById("ledStrip");
    main.setAttribute("fill", col);
    sub.setAttribute("fill",  col);
    sub.setAttribute("opacity", "0.5");
    if (led) led.setAttribute("fill", col);
    this._updateBtn4(sr, col === "#2a2a2a" ? "#444444" : col);

    if (this._lcdPage === 0) {
      main.textContent = pm25Val !== null ? pm25Val : "—";
      sub.textContent  = "AQI · PM2.5";
      main.setAttribute("font-size", "20");
      main.setAttribute("letter-spacing", "2");
    } else if (this._lcdPage === 1) {
      main.textContent = tempVal !== null ? tempVal + "°C" : "—";
      sub.textContent  = "TEMPERATURE";
      main.setAttribute("font-size", "15");
      main.setAttribute("letter-spacing", "0.5");
    } else {
      main.textContent = humVal !== null ? humVal + "%" : "—";
      sub.textContent  = "HUMIDITY RH";
      main.setAttribute("font-size", "20");
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
    // Auto: proportional to AQI
    const t = Math.min(pm25Val || 0, 200) / 200;
    return { speed: 0.15 + t * 1.25, rate: 0.05 + t * 0.33 };
  }

  _spawnParticle(speed, col) {
    const svgEl = this.shadowRoot.querySelector(".pu-svg");
    const canvas = this._ptCanvas;
    if (!svgEl || !canvas) return;
    const sr = svgEl.getBoundingClientRect();
    const vr = canvas.parentElement.getBoundingClientRect();
    const sl = sr.left - vr.left, st = sr.top - vr.top;
    const sw = sr.width,          sh = sr.height;
    this._particles.push({
      x:     sl + sw * (0.1 + Math.random() * 0.8),
      y:     st + sh * 0.01 + Math.random() * sh * 0.04,
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

    // Read current state for params
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
        ${buildPurifierSVG()}
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

    // SVG mode button (btn4) — cycle modes
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

customElements.define("xiaomi-air-purifier-card", XiaomiAirPurifierCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        "xiaomi-air-purifier-card",
  name:        "Xiaomi Air Purifier",
  description: "Card animat pentru purificatorul Xiaomi MIoT cu ilustrație SVG",
  preview:     true,
});
