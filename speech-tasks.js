/**
 * @file speech-tasks.js
 * @brief Web Speech Recognition, Speech Synthesis, & Cross-Browser Search Handler.
 * @details Controls voice input commands, text-to-speech audio feedback, manual text search fallbacks,
 * and GPS browser geolocation auto-detection.
 */

(function () {
  'use strict';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasRecognitionSupport = Boolean(SpeechRecognition);
  const hasSynthesisSupport = 'speechSynthesis' in window;

  let recognition = null;
  let isListening = false;

  /**
   * @brief Speaks message text aloud using Web SpeechSynthesis API.
   * @param text Message text to speak aloud.
   */
  function speak(text) {
    if (!hasSynthesisSupport || !text) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('[SpeechTasks] Speech synthesis error:', error);
    }
  }

  /**
   * @brief Triggers weather data fetching and map updating for a given location query string.
   * @param locationQuery City or target location string.
   */
  async function executeLocationSearch(locationQuery) {
    if (!locationQuery || !locationQuery.trim()) return;

    const cleanLocation = locationQuery.trim();
    const genOutputEl = document.getElementById('gen_output');

    if (genOutputEl) {
      genOutputEl.textContent = `Getting details for "${cleanLocation}"...`;
    }

    speak(`Getting details about ${cleanLocation}`);

    if (typeof window.fetchAndDisplayWeather === 'function') {
      const result = await window.fetchAndDisplayWeather(cleanLocation);

      if (result && typeof window.renderMap === 'function') {
        window.renderMap(result.latitude, result.longitude, result.name || cleanLocation);
      } else if (typeof window.renderMapByLocation === 'function') {
        window.renderMapByLocation(cleanLocation);
      }
    } else {
      console.error('[SpeechTasks] fetchAndDisplayWeather function is missing.');
    }
  }

  /**
   * @brief Parses voice command transcript and routes appropriate actions.
   * @param rawTranscript Transcribed voice recognition input string.
   */
  function processVoiceCommand(rawTranscript) {
    if (!rawTranscript) return;

    const transcript = rawTranscript.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const genOutputEl = document.getElementById('gen_output');

    if (genOutputEl) {
      genOutputEl.textContent = rawTranscript;
    }

    if (transcript.includes('hello') || transcript.includes('hi assistant')) {
      const greetingMsg = "Hello! How can I assist you with weather information today?";
      speak(greetingMsg);
      return;
    }

    let locationQuery = '';

    if (transcript.includes('show me')) {
      locationQuery = transcript.split('show me').pop();
    } else if (transcript.includes('weather in')) {
      locationQuery = transcript.split('weather in').pop();
    } else if (transcript.includes('weather for')) {
      locationQuery = transcript.split('weather for').pop();
    } else {
      locationQuery = transcript;
    }

    locationQuery = locationQuery.trim();

    if (!locationQuery) {
      const promptMsg = "Please specify a location name after saying show me.";
      if (genOutputEl) genOutputEl.textContent = promptMsg;
      speak(promptMsg);
      return;
    }

    executeLocationSearch(locationQuery);
  }

  /**
   * @brief Initializes the SpeechRecognition engine with event listeners.
   */
  function initSpeechRecognition() {
    if (!hasRecognitionSupport) {
      console.warn('[SpeechTasks] Web Speech Recognition is not supported natively in this browser. Text search fallback enabled.');
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListening = true;
        const genOutputEl = document.getElementById('gen_output');
        if (genOutputEl) {
          genOutputEl.textContent = "Listening... Speak your weather location now.";
        }
        const btn = document.getElementById('button_id');
        if (btn) btn.classList.add('listening');
      };

      recognition.onresult = (event) => {
        isListening = false;
        const btn = document.getElementById('button_id');
        if (btn) btn.classList.remove('listening');

        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        isListening = false;
        console.error('[SpeechTasks] Speech recognition error:', event.error);
        const btn = document.getElementById('button_id');
        if (btn) btn.classList.remove('listening');

        const genOutputEl = document.getElementById('gen_output');
        if (genOutputEl) {
          if (event.error === 'no-speech') {
            genOutputEl.textContent = "No speech detected. Please try again or type in the search bar.";
          } else if (event.error === 'not-allowed') {
            genOutputEl.textContent = "Microphone access denied. Please grant microphone permission.";
          } else {
            genOutputEl.textContent = `Voice recognition error: ${event.error}`;
          }
        }
      };

      recognition.onend = () => {
        isListening = false;
        const btn = document.getElementById('button_id');
        if (btn) btn.classList.remove('listening');
      };
    } catch (err) {
      console.error('[SpeechTasks] Failed to initialize SpeechRecognition:', err);
    }
  }

  /**
   * @brief Handles browser GPS geolocation auto-detection.
   */
  function handleBrowserGeolocation() {
    const genOutputEl = document.getElementById('gen_output');

    if (!navigator.geolocation) {
      const msg = "Browser Geolocation is not supported in this environment.";
      if (genOutputEl) genOutputEl.textContent = msg;
      alert(msg);
      return;
    }

    if (genOutputEl) {
      genOutputEl.textContent = "Detecting current GPS coordinates...";
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (genOutputEl) {
          genOutputEl.textContent = `GPS Location Detected (Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})...`;
        }

        if (typeof window.fetchWeatherByCoords === 'function') {
          const result = await window.fetchWeatherByCoords(lat, lon);
          if (result && typeof window.renderMap === 'function') {
            window.renderMap(result.latitude, result.longitude, result.name || 'Your Location');
          }
        } else if (typeof window.renderMap === 'function') {
          window.renderMap(lat, lon, 'Your Current Location');
        }
      },
      (error) => {
        console.error('[SpeechTasks] Geolocation error:', error);
        let errorMsg = "Unable to retrieve your current location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please allow location access or type city name in search bar.";
        }
        if (genOutputEl) genOutputEl.textContent = errorMsg;
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();

    const voiceBtn = document.getElementById('button_id');
    const searchInput = document.getElementById('search_input');
    const searchSubmitBtn = document.getElementById('search_submit_btn');
    const geolocateBtn = document.getElementById('geolocate_btn');

    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (!hasRecognitionSupport) {
          const genOutputEl = document.getElementById('gen_output');
          if (genOutputEl) {
            genOutputEl.textContent = "Voice recognition isn't supported in Firefox/Safari natively. Please type in the search bar below!";
          }
          if (searchInput) searchInput.focus();
          return;
        }

        if (isListening && recognition) {
          recognition.stop();
        } else if (recognition) {
          try {
            recognition.start();
          } catch (err) {
            console.error('[SpeechTasks] Error starting recognition:', err);
          }
        }
      });
    }

    if (searchSubmitBtn) {
      searchSubmitBtn.addEventListener('click', () => {
        if (searchInput && searchInput.value.trim()) {
          executeLocationSearch(searchInput.value.trim());
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          e.preventDefault();
          executeLocationSearch(searchInput.value.trim());
        }
      });
    }

    if (geolocateBtn) {
      geolocateBtn.addEventListener('click', handleBrowserGeolocation);
    }
  });

  window.speak = speak;
  window.executeLocationSearch = executeLocationSearch;
})();
