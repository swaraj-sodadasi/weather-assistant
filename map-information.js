/**
 * map-information.js
 * Production-ready Leaflet map controller designed for 100% cross-browser compatibility (Firefox, Chrome, Safari, Edge).
 */

(function () {
  'use strict';

  let mapInstance = null;
  let currentMarker = null;

  /**
   * Initializes the Leaflet map container safely.
   * @param {number} defaultLat - Center latitude.
   * @param {number} defaultLng - Center longitude.
   * @param {number} zoomLevel - Zoom level.
   */
  function initMap(defaultLat = 20.5937, defaultLng = 78.9629, zoomLevel = 5) {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('[MapModule] Map container #map not found in DOM.');
      return null;
    }

    if (mapInstance) {
      return mapInstance;
    }

    if (typeof L === 'undefined') {
      console.error('[MapModule] Leaflet library (L) is not loaded.');
      return null;
    }

    try {
      // Create Leaflet map instance
      mapInstance = L.map('map', {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true
      }).setView([defaultLat, defaultLng], zoomLevel);

      // Official HTTPS tile layer with crossOrigin enabled for Firefox/Safari security
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        crossOrigin: true
      }).addTo(mapInstance);

      // Auto resize map when window size changes
      window.addEventListener('resize', () => {
        if (mapInstance) mapInstance.invalidateSize();
      });

      return mapInstance;
    } catch (error) {
      console.error('[MapModule] Error initializing Leaflet map:', error);
      return null;
    }
  }

  /**
   * Updates map view and marker using explicit latitude & longitude coordinates.
   * @param {number} lat - Latitude coordinate.
   * @param {number} lng - Longitude coordinate.
   * @param {string} label - Location label popup text.
   * @param {number} zoomLevel - Zoom level.
   */
  function renderMap(lat, lng, label = 'Selected Location', zoomLevel = 12) {
    const map = initMap(lat, lng, zoomLevel);
    if (!map) return;

    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.warn('[MapModule] Invalid latitude/longitude coordinates:', lat, lng);
        return;
      }

      // Remove existing marker if present
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      // Create new marker with popup tooltip
      currentMarker = L.marker([latitude, longitude]).addTo(map);
      currentMarker.bindPopup(`<b>${label}</b><br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`).openPopup();

      // Pan and set zoom
      map.setView([latitude, longitude], zoomLevel, {
        animate: true,
        duration: 0.8
      });

      // Ensure map dimensions re-calculate properly
      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 200);
    } catch (error) {
      console.error('[MapModule] Error rendering map location:', error);
    }
  }

  /**
   * Geocodes a location query using Open-Meteo Geocoding API (never blocked by Firefox/Safari).
   * @param {string} locationName - Name of location/city.
   */
  async function renderMapByLocation(locationName) {
    if (!locationName || !locationName.trim()) return;

    const cleanLocation = locationName.trim();

    try {
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLocation)}&count=1&language=en&format=json`;
      const response = await fetch(geocodeUrl);

      if (!response.ok) {
        throw new Error(`Geocoding failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        const lat = parseFloat(data.results[0].latitude);
        const lon = parseFloat(data.results[0].longitude);
        const displayName = data.results[0].name || cleanLocation;

        renderMap(lat, lon, displayName);
      } else {
        console.warn(`[MapModule] Geocoding query returned no results for "${cleanLocation}".`);
      }
    } catch (error) {
      console.error('[MapModule] Error during geocoding map lookup:', error);
    }
  }

  // Initialize map when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    initMap();
  });

  // Expose functions globally
  window.renderMap = renderMap;
  window.renderMapByLocation = renderMapByLocation;
})();
