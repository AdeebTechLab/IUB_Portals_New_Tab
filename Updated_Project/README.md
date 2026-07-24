# IUB New Tab

A personalized, feature-rich New Tab dashboard built for students of **The Islamia University of Bahawalpur (IUB)**. Replaces Chrome's default new tab with quick access to university portals, live campus info, productivity tools, and a fully customizable glassmorphic interface.

![Manifest Version](https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [APIs & Permissions Used](#apis--permissions-used)
- [Customization Guide](#customization-guide)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Overview

**IUB New Tab** turns every new browser tab into a personalized student dashboard. It combines quick access to core university systems (My IUB, E-Portal, LMS) with everyday productivity tools (bookmarks, to-do list, AI tool shortcuts) and a modern, theme-switchable glass UI — all running locally in the browser with no backend server required.

---

## Features

### 🎓 Academic Access
- One-click buttons for **My IUB**, **E-Portal**, and **LMS**
- IUB Help Centre shortcuts: Live Chat, Announcements, Contact
- Rotating announcement slider (fee structure, admissions, merit lists, transport schedule)
- Google Apps quick-launch grid (Gmail, Drive, Docs, Calendar, Meet, and more)

### 🕒 Live Info Widgets
- Modern odometer-style digital clock with live seconds
- Real-time weather (temperature, condition, daily min/max) — click to view detailed forecast on Google
- Live location detection via geolocation + reverse geocoding
- Personalized greeting with time-of-day awareness (Morning / Afternoon / Evening / Night)
- Rotating Islamic and motivational quotes, refreshed automatically every 12 hours (6 AM / 6 PM cycle)

### 🔍 Smart Search
- Multi-engine search bar (Google, Bing, DuckDuckGo, Yahoo) with an in-place engine switcher
- Voice search support (Web Speech API)

### 🧰 Productivity Tools
- **Bookmarks** — save important links with categories (Academic, Study, Social, Other) and personal notes
- **To-Do / Notes** — quick notes with optional time tags
- **AI Tools** — one-click access to ChatGPT, Gemini, Copilot, Perplexity, and Claude, with the ability to add/remove custom tools
- **Shortcuts bar** — customizable quick links with add/remove support

### 🎨 Personalization
- 4 built-in color themes, switchable instantly
- Dark / Light mode toggle
- Custom wallpaper upload with adjustable opacity
- Glassmorphism-based UI with smooth animations and hover interactions
- Fully responsive, scroll-free single-viewport layout

### 🔗 Social & Community
- Direct links to IUB's official Facebook, X (Twitter), Instagram, LinkedIn, YouTube, and WhatsApp channels
- Quick links to the IUB mobile app, browser extension, and desktop software

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (Custom Properties, `backdrop-filter`, `color-mix`, CSS Grid/Flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Platform | Chrome Extension — Manifest V3 |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts — Sora, Inter, Poppins |
| Storage | Browser `localStorage` (no external database) |

No frameworks, no build step, no bundler — everything runs directly from static files.

---

## Folder Structure

```
IUB-NewTab/
├── manifest.json              # Chrome extension configuration (Manifest V3)
├── index.html                 # Main dashboard markup
├── style.css                  # All styling (theming, layout, components)
├── script.js                  # All interactivity and logic
├── assets/
│   ├── logo.png                # University logo (used in header + favicon)
│   ├── icon128.png              # Extension icon (Chrome toolbar/store)
│   ├── ai-icons/                 # Local icons for the AI Tools panel
│   └── google-icons/             # Local icons for the Google Apps panel
└── iub-assets/
    ├── fee_structure_ads.jpg     # Slider image
    ├── admission_last_date_ads.jpg
    ├── merit_list_ads.jpg
    └── transport_schedule_ads.jpg
```

---

## Installation

1. **Download or clone** this repository to your computer.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `IUB-NewTab` project folder.
5. Open a new tab — the dashboard should load automatically.

> The extension overrides Chrome's default New Tab page via the `chrome_url_overrides` key in `manifest.json`.

---

## Configuration

| Setting | Where to change it |
|---|---|
| Portal links (My IUB / E-Portal / LMS) | `index.html` — `.portal-btn` `href`/click handlers in `script.js` |
| Slider images & links | `script.js` — `SLIDES` array |
| Default shortcuts | `script.js` — `DEFAULT_SHORTCUTS` array |
| Default AI tools | `script.js` — `DEFAULT_AI_TOOLS` array |
| Daily quotes | `script.js` — `QUOTES` array |
| Theme colors | `style.css` — `:root` CSS variables (`--accent`, `--accent2`) |
| Social media links | `index.html` — `.social-pill` elements |

All user-generated data (bookmarks, notes, custom shortcuts, custom AI tools, selected theme, wallpaper) is stored locally via `localStorage` and persists across browser restarts, but does not sync across devices.

---

## APIs & Permissions Used

| Permission / API | Purpose |
|---|---|
| `geolocation` | Detects the user's approximate location for the location widget |
| `storage` | Reserved for future `chrome.storage` sync support |
| [BigDataCloud Reverse Geocoding](https://www.bigdatacloud.com/) | Converts coordinates into a readable city/area name |
| [Open-Meteo](https://open-meteo.com/) | Free, no-key weather data (current conditions + daily forecast) |
| Web Speech API | Enables voice search |
| Google Favicon Service | Auto-generates icons for user-added shortcuts and AI tools |

No user data is transmitted to any server owned by this project — all API calls go directly from the browser to the respective third-party service.

---

## Customization Guide

- **Add a new color theme:** duplicate a `.swatch` element in `index.html` with new `data-accent` / `data-accent2` hex values.
- **Add more AI tools:** use the in-app "+ Add Tool" card inside the AI Tools panel, or extend `DEFAULT_AI_TOOLS` in `script.js` for a permanent addition.
- **Adjust the daily quote rotation window:** modify the `getQuotePeriodKey()` function in `script.js` (currently set to a 6 AM / 6 PM, 12-hour cycle).

---

## Known Limitations

- Wallpaper images are stored as base64 in `localStorage`, which has a per-origin size limit (~5–10MB) — very large images are automatically compressed, but extremely high-resolution photos may still fail to save.
- Custom scrollbar styling is WebKit-specific (Chrome/Edge) and will not apply in non-Chromium browsers.
- Voice search relies on the Web Speech API, which is not supported in all browsers.

---

## Roadmap

- [ ] Sync settings across devices via `chrome.storage.sync`
- [ ] Class routine / timetable widget
- [ ] Export/import full dashboard settings as a single JSON file
- [ ] Attendance and GPA tracking tools

---

## Contributing

Contributions, suggestions, and bug reports are welcome. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request with a clear description of what was changed and why

---

## License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute with attribution.

---

## Credits

- Developed for students of **The Islamia University of Bahawalpur**
- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Weather data by [Open-Meteo](https://open-meteo.com/)
- Location data by [BigDataCloud](https://www.bigdatacloud.com/)

---

<p align="center">Made with ❤️ for the IUB student community.</p>
