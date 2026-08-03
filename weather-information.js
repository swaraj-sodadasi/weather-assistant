/**
 * weather-information.js
 * Production-ready weather information module featuring 12-hour clock formatting, 10-day carousels, and coordinate fetching.
 */

(function () {
  'use strict';

  // Global state for weather response and carousel indices
  let currentWeatherData = null;
  let activeHourlyDay = 0;
  let activeDailyDay = 0;

  /**
   * Safely updates DOM element text content.
   * @param {string} id - DOM element ID.
   * @param {*} text - Content to insert.
   */
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text !== undefined && text !== null ? text : '--';
    }
  }

  /**
   * Formats ISO timestamp or HH:MM string into a precise 12-hour clock format (hh:mm AM/PM).
   * @param {string} isoString - e.g. "2026-07-31T14:00" or "2026-07-31T05:24"
   * @returns {string} e.g. "02:00 PM"
   */
  function format12HourTime(isoString) {
    if (!isoString || typeof isoString !== 'string') return '--';
    
    const parts = isoString.split('T');
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    const timeSegments = timePart.split(':');
    
    if (timeSegments.length < 2) return isoString;

    let hours = parseInt(timeSegments[0], 10);
    const minutes = timeSegments[1].slice(0, 2);

    if (isNaN(hours)) return isoString;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  /**
   * Formats YYYY-MM-DD string into a friendly date (e.g. "Fri, Jul 31, 2026").
   * @param {string} dateStr - YYYY-MM-DD
   * @returns {string}
   */
  function formatFriendlyDate(dateStr) {
    if (!dateStr) return '--';
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Renders the 24-hour Hourly Forecast Carousel slide for a given day index.
   * @param {number} dayIdx - Day index (0 to 9).
   */
  function renderHourlyCarousel(dayIdx) {
    if (!currentWeatherData || !currentWeatherData.hourly || !currentWeatherData.daily) return;

    const hourly = currentWeatherData.hourly;
    const daily = currentWeatherData.daily;
    const totalDays = daily.time ? daily.time.length : 1;

    activeHourlyDay = Math.max(0, Math.min(dayIdx, totalDays - 1));

    const selectedDate = daily.time[activeHourlyDay] || `Day ${activeHourlyDay + 1}`;
    const friendlyDate = formatFriendlyDate(selectedDate);

    setText('hourly_day_indicator', `Day ${activeHourlyDay + 1} of ${totalDays} (${friendlyDate})`);

    const pillsContainer = document.getElementById('hourly_day_pills');
    if (pillsContainer && daily.time) {
      pillsContainer.innerHTML = daily.time.map((d, idx) => `
        <button type="button" class="day-pill ${idx === activeHourlyDay ? 'active' : ''}" data-day="${idx}">
          Day ${idx + 1} (${d.slice(5)})
        </button>
      `).join('');

      pillsContainer.querySelectorAll('.day-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetDay = parseInt(e.currentTarget.getAttribute('data-day'), 10);
          renderHourlyCarousel(targetDay);
        });
      });
    }

    const startIndex = activeHourlyDay * 24;
    const endIndex = Math.min(startIndex + 24, hourly.time ? hourly.time.length : 0);

    const tbody = document.getElementById('hourly_tbody');
    if (!tbody) return;

    if (startIndex >= (hourly.time ? hourly.time.length : 0)) {
      tbody.innerHTML = `<tr><td colspan="14" class="table-empty-msg">No hourly data available for this day.</td></tr>`;
      return;
    }

    let rowsHtml = '';
    for (let i = startIndex; i < endIndex; i++) {
      const time12h = format12HourTime(hourly.time[i]);
      const temp = hourly.temperature_2m ? hourly.temperature_2m[i] : '--';
      const rain = hourly.rain ? hourly.rain[i] : '--';
      const snowfall = hourly.snowfall ? hourly.snowfall[i] : '--';
      const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : '--';
      const humidity = hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : '--';
      const dewPoint = hourly.dew_point_2m ? hourly.dew_point_2m[i] : '--';
      const evap = hourly.evapotranspiration ? hourly.evapotranspiration[i] : '--';
      const windSpeed = hourly.wind_speed_180m ? hourly.wind_speed_180m[i] : '--';
      const windDir = hourly.wind_direction_180m ? hourly.wind_direction_180m[i] : '--';
      const cloudCover = hourly.cloud_cover ? hourly.cloud_cover[i] : '--';
      const pressure = hourly.surface_pressure ? hourly.surface_pressure[i] : '--';
      const uv = hourly.uv_index ? hourly.uv_index[i] : '--';
      const isDay = hourly.is_day ? hourly.is_day[i] : 0;

      const dayNightBadge = isDay === 1 
        ? `<span class="badge-day">☀️ Day</span>` 
        : `<span class="badge-night">🌙 Night</span>`;

      rowsHtml += `
        <tr>
          <td><b>${time12h}</b></td>
          <td>${temp}</td>
          <td>${rain}</td>
          <td>${snowfall}</td>
          <td>${precipProb}</td>
          <td>${humidity}</td>
          <td>${dewPoint}</td>
          <td>${evap}</td>
          <td>${windSpeed}</td>
          <td>${windDir}</td>
          <td>${cloudCover}</td>
          <td>${pressure}</td>
          <td>${uv}</td>
          <td>${dayNightBadge}</td>
        </tr>
      `;
    }

    tbody.innerHTML = rowsHtml;
  }

  /**
   * Renders the Daily Forecast Carousel slide for a given day index.
   * @param {number} dayIdx - Day index (0 to 9).
   */
  function renderDailyCarousel(dayIdx) {
    if (!currentWeatherData || !currentWeatherData.daily) return;

    const daily = currentWeatherData.daily;
    const totalDays = daily.time ? daily.time.length : 1;

    activeDailyDay = Math.max(0, Math.min(dayIdx, totalDays - 1));

    const selectedDate = daily.time[activeDailyDay] || `Day ${activeDailyDay + 1}`;
    const friendlyDate = formatFriendlyDate(selectedDate);

    setText('daily_day_indicator', `Day ${activeDailyDay + 1} of ${totalDays} (${friendlyDate})`);

    const pillsContainer = document.getElementById('daily_day_pills');
    if (pillsContainer && daily.time) {
      pillsContainer.innerHTML = daily.time.map((d, idx) => `
        <button type="button" class="day-pill ${idx === activeDailyDay ? 'active' : ''}" data-day="${idx}">
          Day ${idx + 1} (${d.slice(5)})
        </button>
      `).join('');

      pillsContainer.querySelectorAll('.day-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetDay = parseInt(e.currentTarget.getAttribute('data-day'), 10);
          renderDailyCarousel(targetDay);
        });
      });
    }

    const tbody = document.getElementById('daily_tbody');
    if (!tbody) return;

    const idx = activeDailyDay;
    const dateVal = friendlyDate;
    const tempMax = daily.temperature_2m_max ? daily.temperature_2m_max[idx] : '--';
    const tempMin = daily.temperature_2m_min ? daily.temperature_2m_min[idx] : '--';
    const uvMax = daily.uv_index_max ? daily.uv_index_max[idx] : '--';
    const sunrise = daily.sunrise ? format12HourTime(daily.sunrise[idx]) : '--';
    const sunset = daily.sunset ? format12HourTime(daily.sunset[idx]) : '--';
    const moonrise = daily.moonrise ? format12HourTime(daily.moonrise[idx]) : '--';
    const moonset = daily.moonset ? format12HourTime(daily.moonset[idx]) : '--';
    const moonPhase = daily.moon_phase ? daily.moon_phase[idx] : '--';
    const rainSum = daily.rain_sum ? daily.rain_sum[idx] : '--';
    const precipSum = daily.precipitation_sum ? daily.precipitation_sum[idx] : '--';
    const snowSum = daily.snowfall_sum ? daily.snowfall_sum[idx] : '--';
    const windSpeedMax = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[idx] : '--';
    const windGustsMax = daily.wind_gusts_10m_max ? daily.wind_gusts_10m_max[idx] : '--';
    const radiationSum = daily.shortwave_radiation_sum ? daily.shortwave_radiation_sum[idx] : '--';

    tbody.innerHTML = `
      <tr>
        <td><b>Date / Time (iso8601)</b></td>
        <td><b>${dateVal}</b></td>
      </tr>
      <tr>
        <td><b>Max Temperature (°C)</b></td>
        <td>${tempMax} °C</td>
      </tr>
      <tr>
        <td><b>Min Temperature (°C)</b></td>
        <td>${tempMin} °C</td>
      </tr>
      <tr>
        <td><b>Max UV Index</b></td>
        <td>${uvMax}</td>
      </tr>
      <tr>
        <td><b>Sunrise Time</b></td>
        <td>${sunrise}</td>
      </tr>
      <tr>
        <td><b>Sunset Time</b></td>
        <td>${sunset}</td>
      </tr>
      <tr>
        <td><b>Moonrise Time</b></td>
        <td>${moonrise}</td>
      </tr>
      <tr>
        <td><b>Moonset Time</b></td>
        <td>${moonset}</td>
      </tr>
      <tr>
        <td><b>Moon Phase (fraction)</b></td>
        <td>${moonPhase}</td>
      </tr>
      <tr>
        <td><b>Rainfall Sum (mm)</b></td>
        <td>${rainSum} mm</td>
      </tr>
      <tr>
        <td><b>Precipitation Sum (mm)</b></td>
        <td>${precipSum} mm</td>
      </tr>
      <tr>
        <td><b>Snowfall Sum (mm)</b></td>
        <td>${snowSum} mm</td>
      </tr>
      <tr>
        <td><b>Max Wind Speed (km/h)</b></td>
        <td>${windSpeedMax} km/h</td>
      </tr>
      <tr>
        <td><b>Max Wind Gusts (km/h)</b></td>
        <td>${windGustsMax} km/h</td>
      </tr>
      <tr>
        <td><b>Solar Radiation Sum (MJ/m²)</b></td>
        <td>${radiationSum} MJ/m²</td>
      </tr>
    `;
  }

  /**
   * Initializes Carousel Control Buttons for Prev/Next navigation.
   */
  function setupCarouselControls() {
    const hourlyPrev = document.getElementById('hourly_prev_btn');
    const hourlyNext = document.getElementById('hourly_next_btn');
    const dailyPrev = document.getElementById('daily_prev_btn');
    const dailyNext = document.getElementById('daily_next_btn');

    if (hourlyPrev) {
      hourlyPrev.addEventListener('click', () => {
        if (currentWeatherData) renderHourlyCarousel(activeHourlyDay - 1);
      });
    }
    if (hourlyNext) {
      hourlyNext.addEventListener('click', () => {
        if (currentWeatherData) renderHourlyCarousel(activeHourlyDay + 1);
      });
    }

    if (dailyPrev) {
      dailyPrev.addEventListener('click', () => {
        if (currentWeatherData) renderDailyCarousel(activeDailyDay - 1);
      });
    }
    if (dailyNext) {
      dailyNext.addEventListener('click', () => {
        if (currentWeatherData) renderDailyCarousel(activeDailyDay + 1);
      });
    }
  }

  /**
   * Fetches geocoding and weather details for a given location query.
   * @param {string} locationName - Name of city or location.
   * @returns {Promise<{name: string, latitude: number, longitude: number}|null>} Coordinates or null.
   */
  async function fetchAndDisplayWeather(locationName) {
    if (!locationName || typeof locationName !== 'string' || !locationName.trim()) {
      console.warn('[WeatherModule] Invalid or empty location query.');
      return null;
    }

    const cleanLocation = locationName.trim();

    try {
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLocation)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geocodeUrl);

      if (!geoResponse.ok) {
        throw new Error(`Geocoding failed with status ${geoResponse.status}`);
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || !geoData.results.length) {
        setText('location_id', `${cleanLocation} (Location Not Found)`);
        console.warn(`[WeatherModule] No geocoding results found for "${cleanLocation}".`);
        return null;
      }

      const locationResult = geoData.results[0];
      const {
        name,
        latitude,
        longitude,
        elevation,
        admin1 = '--',
        country = '--',
        population = '--',
        timezone = 'auto'
      } = locationResult;

      setText('location_id', name || cleanLocation);
      setText('latitude_id', latitude);
      setText('longitude_id', longitude);
      setText('elevation_id', elevation !== undefined && elevation !== null ? `${elevation} m` : '--');
      setText('state_id', admin1);
      setText('country_id', country);
      setText('population_id', typeof population === 'number' ? population.toLocaleString() : population);
      setText('timezone_id', timezone);

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,moonrise,moonset,moon_phase,rain_sum,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,shortwave_radiation_sum&hourly=temperature_2m,rain,snowfall,precipitation_probability,relative_humidity_2m,dew_point_2m,evapotranspiration,wind_speed_180m,temperature_180m,cloud_cover,surface_pressure,pressure_msl,snow_depth,soil_temperature_54cm,soil_moisture_27_to_81cm,cloud_cover_high,precipitation,wind_direction_180m,uv_index,uv_index_clear_sky,is_day,direct_radiation,terrestrial_radiation,global_tilted_irradiance_instant,terrestrial_radiation_instant&models=best_match&current=is_day,temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,cloud_cover,apparent_temperature&timezone=${encodeURIComponent(timezone)}&past_days=3`;

      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        throw new Error(`Weather forecast request failed with status ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();
      currentWeatherData = weatherData;

      if (weatherData.current) {
        const curr = weatherData.current;
        setText('curr_temp_id_card', curr.temperature_2m !== undefined ? `${curr.temperature_2m} °C` : '--');
        setText('apparent_temp_id_card', curr.apparent_temperature !== undefined ? `${curr.apparent_temperature} °C` : '--');
      }

      renderHourlyCarousel(0);
      renderDailyCarousel(0);

      return {
        name,
        latitude,
        longitude
      };
    } catch (error) {
      console.error('[WeatherModule] Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Fetches weather data directly by coordinates (Latitude & Longitude).
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<{name: string, latitude: number, longitude: number}|null>}
   */
  async function fetchWeatherByCoords(latitude, longitude) {
    try {
      const name = `GPS Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

      setText('location_id', name);
      setText('latitude_id', latitude);
      setText('longitude_id', longitude);
      setText('elevation_id', '--');
      setText('state_id', '--');
      setText('country_id', '--');
      setText('population_id', '--');
      setText('timezone_id', 'auto');

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,moonrise,moonset,moon_phase,rain_sum,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,shortwave_radiation_sum&hourly=temperature_2m,rain,snowfall,precipitation_probability,relative_humidity_2m,dew_point_2m,evapotranspiration,wind_speed_180m,temperature_180m,cloud_cover,surface_pressure,pressure_msl,snow_depth,soil_temperature_54cm,soil_moisture_27_to_81cm,cloud_cover_high,precipitation,wind_direction_180m,uv_index,uv_index_clear_sky,is_day,direct_radiation,terrestrial_radiation,global_tilted_irradiance_instant,terrestrial_radiation_instant&models=best_match&current=is_day,temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,cloud_cover,apparent_temperature&timezone=auto&past_days=3`;

      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();
      currentWeatherData = weatherData;

      if (weatherData.current) {
        const curr = weatherData.current;
        setText('curr_temp_id_card', curr.temperature_2m !== undefined ? `${curr.temperature_2m} °C` : '--');
        setText('apparent_temp_id_card', curr.apparent_temperature !== undefined ? `${curr.apparent_temperature} °C` : '--');
      }

      renderHourlyCarousel(0);
      renderDailyCarousel(0);

      return {
        name,
        latitude,
        longitude
      };
    } catch (error) {
      console.error('[WeatherModule] Error fetching weather by coordinates:', error);
      return null;
    }
  }

  // Initialize carousel controls on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    setupCarouselControls();
  });

  // Expose functions globally
  window.fetchAndDisplayWeather = fetchAndDisplayWeather;
  window.fetchWeatherByCoords = fetchWeatherByCoords;
})();
