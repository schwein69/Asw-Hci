import axios from "axios";

// Cache to store weather data temporarily (30 seconds for real-time feel)
const weatherCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 seconds in milliseconds

/**
 * Convert weather codes to readable format
 * Based on WMO Weather interpretation codes
 */
export function getWeatherInfo(code) {
  if (code === 0) return { text: "Sunny", icon: "Sun", alert: false };
  if (code <= 3)
    return { text: "Partly Cloudy", icon: "CloudSun", alert: false };
  if (code <= 48) return { text: "Foggy", icon: "Cloud", alert: true };
  if (code <= 67) return { text: "Rainy", icon: "CloudRain", alert: true };
  if (code <= 77) return { text: "Snowy", icon: "Snowflake", alert: true };
  if (code <= 82) return { text: "Showers", icon: "CloudRain", alert: true };
  if (code <= 99)
    return { text: "Stormy", icon: "CloudLightning", alert: true };
  return { text: "Unknown", icon: "Cloud", alert: false };
}

/**
 * Fetch weather data from Open-Meteo API with caching
 */
export async function fetchWeatherData(latitude, longitude, cityName) {
  const cacheKey = `${latitude},${longitude}`;

  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude,
        longitude,
        current: "temperature_2m,weather_code,wind_speed_10m",
        timezone: "auto",
      },
    });

    if (response.data && response.data.current) {
      const { temperature_2m, weather_code, wind_speed_10m } =
        response.data.current;
      const weatherInfo = getWeatherInfo(weather_code);

      const weatherData = {
        city: cityName,
        temperature: Math.round(temperature_2m),
        windSpeed: Math.round(wind_speed_10m),
        condition: weatherInfo.text,
        weatherCode: weather_code,
        icon: weatherInfo.icon,
        alert: weatherInfo.alert,
        latitude,
        longitude,
        fetchedAt: new Date(),
      };

      // Store in cache
      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
      });

      return weatherData;
    }

    throw new Error("Invalid weather data received");
  } catch (error) {
    console.error(`Failed to fetch weather for ${cityName}:`, error.message);
    throw error;
  }
}

/**
 * Fetch weather for multiple locations
 */
export async function fetchMultipleLocationsWeather(locations) {
  const promises = locations.map((loc) =>
    fetchWeatherData(loc.lat, loc.lon, loc.name).catch((err) => ({
      city: loc.name,
      error: err.message,
      alert: false,
    }))
  );

  return await Promise.all(promises);
}

/**
 * Check if weather conditions require an alert notification
 */
export function shouldCreateWeatherAlert(weatherData) {
  return weatherData.alert === true;
}

/**
 * Clear cache (useful for testing)
 */
export function clearWeatherCache() {
  weatherCache.clear();
}
