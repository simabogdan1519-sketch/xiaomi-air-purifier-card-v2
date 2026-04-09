# Xiaomi Air Purifier Card

A custom Lovelace card for Home Assistant that displays Xiaomi MIoT air purifiers with an animated SVG illustration, live AQI color coding, and interactive controls.

![preview](preview.png)

---

## Features

- **Animated SVG illustration** — realistic white 3D purifier body with dot-grid intake grille and outlet slats
- **Live AQI color coding** — accent color shifts from green → yellow → orange → red as air quality degrades
- **Floating particles** — rise from the outlet slats; speed and density follow fan mode and AQI level
  - **Sleep** — slow and sparse
  - **Auto** — proportional to AQI (low AQI = calm, high AQI = fast and dense)
  - **Favorite** — maximum speed and density
- **Interactive LCD display** — shows AQI, temperature, or humidity; navigate with ← → buttons on the device panel
- **On-device buttons** — power toggle and mode cycle directly on the SVG panel
- **Mode dropdown** — quick mode switch from the top bar
- **Fan speed buttons** — Sleep / Auto / Favorite
- **Filter life bar** — visual progress bar with percentage
- **Off state** — card desaturates and particles stop when device is off

---

## Requirements

- Home Assistant with a Xiaomi MIoT air purifier integrated (e.g. via `xiaomi_miio` or `miio` integration)
- The following entities (auto-detected from the fan entity name):

| Entity | Example |
|--------|---------|
| `fan.*_air_purifier` | `fan.zhimi_mc2_f0a6_air_purifier` |
| `sensor.*_pm25_density` | `sensor.zhimi_mc2_f0a6_pm25_density` |
| `sensor.*_relative_humidity` | `sensor.zhimi_mc2_f0a6_relative_humidity` |
| `sensor.*_indoor_temperature` | `sensor.zhimi_mc2_f0a6_indoor_temperature` |
| `sensor.*_filter_life_level` | `sensor.zhimi_mc2_f0a6_filter_life_level` |

---

## Installation

### Manual

1. Copy `xiaomi-air-purifier-card.js` to `/config/www/`
2. Add the resource in your `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/xiaomi-air-purifier-card.js
      type: module
```

3. Restart Home Assistant (or reload resources via UI)

### HACS (manual repository)

1. In HACS → Frontend → three-dot menu → Custom repositories
2. Add your repo URL, category: **Lovelace**
3. Install from HACS and add the resource

---

## Configuration

### Minimal

```yaml
type: custom:xiaomi-air-purifier-card
entity: fan.zhimi_mc2_XXXX_air_purifier
```

### Full

```yaml
type: custom:xiaomi-air-purifier-card
entity: fan.zhimi_mc2_XXXX_air_purifier
name: Living Room                          # override display name
entity_pm25: sensor.my_custom_pm25         # override auto-detected sensor
entity_humidity: sensor.my_custom_humidity
entity_temperature: sensor.my_custom_temp
entity_filter: sensor.my_custom_filter
```

---

## AQI Color Scale

| Range | Color | Label |
|-------|-------|-------|
| 0 – 12 | 🟢 Green | Excellent |
| 13 – 35 | 🟩 Light Green | Good |
| 36 – 55 | 🟡 Yellow | Moderate |
| 56 – 150 | 🟠 Orange | Unhealthy |
| 151+ | 🔴 Red | Hazardous |

---

## LCD Pages

The LCD on the device illustration cycles through three pages using the ← → buttons:

| Page | Displays | Color |
|------|----------|-------|
| 1 | AQI · PM2.5 | Follows AQI scale |
| 2 | Temperature (°C) | Cyan → Green → Yellow → Red |
| 3 | Humidity (% RH) | Yellow (dry) → Blue (good) → Purple (humid) |

---

## Tested On

- Xiaomi Air Purifier 4 Pro (`zhimi.airp.mb5`)
- Xiaomi Air Purifier 3H (`zhimi.airpurifier.mb3`)
- Xiaomi Air Purifier MC2 (`zhimi.airpurifier.mc2`)

---

## License

MIT
