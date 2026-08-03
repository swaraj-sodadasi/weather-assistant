/**
 * @file map-information.js
 * @brief Leaflet map renderer and location geocoding controller.
 * @details Manages Leaflet map state, pin markers, popups, Open-Meteo unblockable geocoding lookup,
 * and cross-browser OpenStreetMap tile layers.
 */

(function () {
  'use strict';

  /**
   * Active Leaflet map instance object.
   */
  let mapInstance = null;

  /**
   * Active map pin marker object.
   */
  let currentMarker = null;

  /**
   * @brief Initializes the Leaflet map container safely.
   * @param defaultLat Default center latitude (default: 20.5937).
   * @param defaultLng Default center longitude (default: 78.9629).
   * @param zoomLevel Default map zoom level (default: 5).
   * @returns Leaflet map instance or null on failure.
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
      mapInstance = L.map('map', {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true
      }).setView([defaultLat, defaultLng], zoomLevel);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        crossOrigin: true
      }).addTo(mapInstance);

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
   * @brief Updates map view and marker using explicit latitude & longitude coordinates.
   * @param lat Latitude coordinate.
   * @param lng Longitude coordinate.
   * @param label Location label popup text.
   * @param zoomLevel Target map zoom level (default: 12).
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

      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      currentMarker = L.marker([latitude, longitude]).addTo(map);
      currentMarker.bindPopup(`<b>${label}</b><br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`).openPopup();

      map.setView([latitude, longitude], zoomLevel, {
        animate: true,
        duration: 0.8
      });

      setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
      }, 200);
    } catch (error) {
      console.error('[MapModule] Error rendering map location:', error);
    }
  }

  /**
   * @brief Geocodes a location query via Open-Meteo Geocoding API and updates map coordinates.
   * @param locationName Name of target location/city.
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

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
  });

  window.renderMap = renderMap;
  window.renderMapByLocation = renderMapByLocation;
})();
