# Weather Assistant 🌤️🎙️

A modern, voice-enabled weather intelligence web application built with vanilla JavaScript, HTML5, CSS3 Glassmorphism, Open-Meteo REST APIs, Leaflet.js, and Web Speech APIs.

---

## 📌 1. Problem Statement

Traditional web-based weather tools often suffer from key usability and technical limitations:
- **Cluttered & Static UI**: Raw text representations or unstyled list outputs obscure critical metrics (such as daily evapotranspiration, solar radiation, and wind gusts).
- **Single-Input Constraints**: Many weather interfaces rely strictly on typed text inputs, lacking hands-free voice accessibility or GPS geolocation.
- **Cross-Browser Inconsistencies**: Native Web Speech APIs (`SpeechRecognition`) are restricted or disabled by default in browsers like Mozilla Firefox and Apple Safari, causing application crashes without robust fallbacks.
- **Data Overload**: Presenting 10-day hourly datasets (240 individual data points) in a single static view leads to cognitive overload and broken table layouts.

### 🌟 Solution: Weather Assistant
**Weather Assistant** solves these challenges by providing:
1. **Modular Architecture**: Clean separation of concerns into distinct services (`weather-information.js`, `map-information.js`, `speech-tasks.js`).
2. **Universal Multi-Modal Search**: Supports Voice Recognition, Manual Text Input, and GPS Auto-Location with graceful cross-browser fallback support (Firefox/Safari ready).
3. **Interactive Carousels**: 24-hour daily timeline slides and 10-day forecast overview tables with 12-hour clock time formatting (`hh:mm AM/PM`).
4. **Interactive Leaflet Mapping**: Real-time geolocation pin rendering and coordinate mapping powered by Open-Meteo & OpenStreetMap.
5. **Automated Doxygen Documentation**: Full JSDoc/Doxygen documentation engine configured via npm scripts and GitHub Actions.

---

## 📁 2. Repository Structure

```text
weather-assistant/
├── .github/
│   └── workflows/
│       └── deploy-docs.yml  # GitHub Actions automated Doxygen & web app deployment workflow
├── docs/                    # Doxygen configuration & generated HTML documentation
│   ├── Doxyfile             # Doxygen configuration file
│   └── html/                # Compiled HTML documentation output (ignored by git)
├── scripts/
│   └── build-docs.js        # Cross-platform Doxygen builder script
├── index.html               # Main HTML5 application shell (deployed to GitHub Pages root)
├── index.css                # Custom CSS3 Glassmorphism styling system
├── weather-information.js   # Open-Meteo API fetcher & 10-day carousel engine
├── map-information.js       # Leaflet.js map controller & geocoding handler
├── speech-tasks.js          # Web Speech Recognition & Synthesis handler
├── package.json             # NPM package manager configuration & scripts
├── package-lock.json        # Deterministic dependency lockfile
├── README.md                # Project documentation & usage guide
└── LICENSE                  # Open-source project license
```

### Module Descriptions
- **[index.html](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/index.html)**: Defines the structured DOM layout including location metadata cards, current summary cards, 24-hour/10-day forecast carousel tables, search controls, and map container. Deployed as the main web application on GitHub Pages.
- **[index.css](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/index.css)**: Implements CSS Custom Properties, modern typography (Google Fonts *Inter* & *Outfit*), glowing glassmorphic cards, custom table scrollbars, day/night badges, and responsive breakpoint styles.
- **[weather-information.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/weather-information.js)**: Asynchronously queries Open-Meteo REST APIs, formats 12-hour timestamps (`08:00 AM`, `02:00 PM`), and drives carousel state for hourly/daily forecast slides.
- **[map-information.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/map-information.js)**: Controls Leaflet map lifecycle, sets OpenStreetMap tile layers with `crossOrigin` security headers, and updates map markers dynamically.
- **[speech-tasks.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/speech-tasks.js)**: Handles `SpeechRecognition` listening, `SpeechSynthesis` voice responses, text search fallbacks, and browser `navigator.geolocation` GPS tracking.
- **[scripts/build-docs.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/scripts/build-docs.js)**: Cross-platform builder script executing Doxygen binary or fallback npm package.

---

## 🛠️ 3. Pre-Requisites & Dependencies

### Package Manager Setup
Ensure Node.js and NPM are installed on your environment.

```bash
# Install development dependencies using deterministic lockfile
npm ci

# Generate Doxygen documentation locally
npm run docs
```

### Hardware & Operating System Requirements
- Any modern desktop or mobile browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari).
- Microphone access (optional, for voice commands).
- Internet connection (for fetching weather APIs and OpenStreetMap tile layers).

---

## 🛠️ 4. Project Resources
> * Launch Web Application: **[Live Weather Assistant App](https://swaraj-sodadasi.github.io/weather-assistant/)** (Serves `./index.html`)
> * Read the interactive code documentation: **[Live Doxygen Documentation Site](https://swaraj-sodadasi.github.io/weather-assistant/docs/html/index.html)** (Generated dynamically by GitHub Actions workflow)
> * Monitor the cloud deployment status: **[GitHub Actions Workflow](https://github.com/swaraj-sodadasi/weather-assistant/actions/workflows/deploy-docs.yml)**

---

## 🔮 5. Future Scope & Roadmap

1. **PWA & Offline Support**: Implement a Progressive Web App (PWA) Service Worker with local storage caching for offline weather viewing.
2. **AI Weather Insights**: Integrate LLM natural language summaries (e.g. *"Heavy rain expected at 4 PM, bring an umbrella!"*).
3. **Severe Weather Push Notifications**: Add Web Push API alerts for UV spikes, sudden wind gusts, or severe storm warnings.
4. **Multi-Language Voice Support**: Expand voice recognition and speech synthesis across global languages (Spanish, Hindi, French, German, Japanese).
