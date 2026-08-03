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
5. **Automated Doxygen Documentation**: Full JSDoc/Doxygen documentation engine configured via npm scripts.

---

## 📁 2. Repository Structure

```text
weather-assistant/
├── index.html               # Main HTML5 application shell & structured dashboard layout
├── index.css                # Custom CSS3 styling system (Glassmorphism, dark theme, responsive grid)
├── weather-information.js   # Open-Meteo API fetcher, unit handling, and 10-day carousel engine
├── map-information.js       # Leaflet.js map controller & unblockable Open-Meteo geocoding handler
├── speech-tasks.js          # Web Speech Recognition, Speech Synthesis, & cross-browser input handlers
├── Doxyfile                 # Doxygen automated documentation generator configuration
├── package.json             # NPM package manager configuration & build scripts
├── docs/                    # Generated Doxygen HTML documentation output folder
│   └── html/index.html      # Interactive Doxygen API reference homepage
├── README.md                # Comprehensive project documentation & usage guide
└── LICENSE                  # Open-source project license
```

### Module Descriptions
- **[index.html](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/index.html)**: Defines the structured DOM layout including location metadata cards, current summary cards, 24-hour/10-day forecast carousel tables, search controls, and map container.
- **[index.css](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/index.css)**: Implements CSS Custom Properties, modern typography (Google Fonts *Inter* & *Outfit*), glowing glassmorphic cards, custom table scrollbars, day/night badges, and responsive breakpoint styles.
- **[weather-information.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/weather-information.js)**: Asynchronously queries Open-Meteo REST APIs, formats 12-hour timestamps (`08:00 AM`, `02:00 PM`), and drives carousel state for hourly/daily forecast slides.
- **[map-information.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/map-information.js)**: Controls Leaflet map lifecycle, sets OpenStreetMap tile layers with `crossOrigin` security headers, and updates map markers dynamically.
- **[speech-tasks.js](file:///home/swaraj/Documents/swaraj-works/Education/projects/weather-assistant/speech-tasks.js)**: Handles `SpeechRecognition` listening, `SpeechSynthesis` voice responses, text search fallbacks, and browser `navigator.geolocation` GPS tracking.

---

## 🛠️ 3. Pre-Requisites & Dependencies

### Package Manager Setup
Ensure Node.js and NPM are installed on your environment.

```bash
# Install development dependencies
npm install
```

### Hardware & Operating System Requirements
- Any modern desktop or mobile browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari).
- Microphone access (optional, for voice commands).
- Internet connection (for fetching weather APIs and OpenStreetMap tile layers).

### Client-Side Dependencies (CDNs)
- **Leaflet.js v1.7.1**: Open-source interactive map library.
  - CSS: `https://unpkg.com/leaflet@1.7.1/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.7.1/dist/leaflet.js`
- **Google Fonts**: Modern web typography (*Inter* and *Outfit*).
- **Open-Meteo REST API**: Free, open-source weather API (No API Key required).
  - Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
  - Forecast API: `https://api.open-meteo.com/v1/forecast`

---

## 📚 4. Automated Doxygen Documentation

Documentation for **Weather Assistant** is fully automated using Doxygen with JavaScript extension mapping.

### Generating Documentation via NPM
Run the following npm command in your terminal to build or refresh Doxygen HTML docs:

```bash
# Build Doxygen documentation
npm run doc
```

This compiles the JSDoc/Doxygen comments in `weather-information.js`, `map-information.js`, and `speech-tasks.js` into `./docs/html/index.html`.

### Viewing Generated Docs
Open `./docs/html/index.html` in any browser to inspect the interactive API documentation, function call trees, and module references.

---

## 🔗 5. Project Resources & Documentation

### Live Documentation & External References
- **Open-Meteo API Documentation**: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Leaflet API Reference**: [https://leafletjs.com/reference.html](https://leafletjs.com/reference.html)
- **Web Speech API Documentation (MDN)**: [https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### 🚀 GitHub Actions CI/CD Deployment Workflow
To automate deployment of **Weather Assistant** to **GitHub Pages**, create a `.github/workflows/deploy.yml` file in your repository with the following workflow configuration:

```yaml

```

---

## 🔮 6. Future Scope & Roadmap

1. **PWA & Offline Support**: Implement a Progressive Web App (PWA) Service Worker with local storage caching for offline weather viewing.
2. **AI Weather Insights**: Integrate LLM natural language summaries (e.g. *"Heavy rain expected at 4 PM, bring an umbrella!"*).
3. **Severe Weather Push Notifications**: Add Web Push API alerts for UV spikes, sudden wind gusts, or severe storm warnings.
4. **Multi-Language Voice Support**: Expand voice recognition and speech synthesis across global languages (Spanish, Hindi, French, German, Japanese).
