/**
 * Crowd Density Service
 * Simulates realistic tourist crowd levels based on multiple factors
 */

// Location popularity ratings (affects base crowd levels)
const locationPopularity = {
  Barcelona: 0.9, // Very popular
  Paris: 0.95, // Extremely popular
  Tokyo: 0.85,
  Berlin: 0.7,
  Amsterdam: 0.8,
  Rome: 0.9,
  London: 0.95,
  "New York": 0.9,
  Dubai: 0.75,
  Bangkok: 0.8,
};

/**
 * Calculate crowd density for a location
 * Returns a value between 0-100 representing crowd percentage
 */
export const calculateCrowdDensity = (locationName, weatherData = null) => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Base popularity (0.5 - 1.0)
  const basePopularity = locationPopularity[locationName] || 0.6;

  // Time of day factor (0.3 - 1.0)
  // Peak hours: 10am-6pm
  let timeFactor;
  if (hour >= 10 && hour <= 18) {
    // Peak hours - high crowds
    timeFactor = 0.8 + Math.random() * 0.2; // 0.8-1.0
  } else if ((hour >= 8 && hour < 10) || (hour > 18 && hour <= 20)) {
    // Moderate hours
    timeFactor = 0.5 + Math.random() * 0.3; // 0.5-0.8
  } else {
    // Off-peak hours - low crowds
    timeFactor = 0.3 + Math.random() * 0.2; // 0.3-0.5
  }

  // Day of week factor (0.7 - 1.0)
  // Weekends are busier
  let dayFactor;
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Saturday or Sunday
    dayFactor = 0.9 + Math.random() * 0.1; // 0.9-1.0
  } else if (dayOfWeek === 5) {
    // Friday
    dayFactor = 0.8 + Math.random() * 0.1; // 0.8-0.9
  } else {
    // Weekdays
    dayFactor = 0.7 + Math.random() * 0.1; // 0.7-0.8
  }

  // Weather impact factor (0.5 - 1.0)
  // Bad weather reduces crowds
  let weatherFactor = 1.0;
  if (weatherData) {
    const weatherCode = weatherData.weatherCode || weatherData.weather_code;
    if (weatherCode >= 80) {
      // Heavy rain/storms
      weatherFactor = 0.5 + Math.random() * 0.2; // 0.5-0.7
    } else if (weatherCode >= 51) {
      // Light rain/drizzle
      weatherFactor = 0.7 + Math.random() * 0.2; // 0.7-0.9
    } else if (weatherCode >= 45) {
      // Fog
      weatherFactor = 0.8 + Math.random() * 0.15; // 0.8-0.95
    }
    // Clear/partly cloudy = 1.0 (no reduction)
  }

  // Random variation to make it feel realistic (-5% to +5%)
  const randomVariation = 0.95 + Math.random() * 0.1;

  // Calculate final density (0-100)
  const density = Math.round(
    basePopularity *
      timeFactor *
      dayFactor *
      weatherFactor *
      randomVariation *
      100
  );

  // Ensure it's between 0-100
  return Math.max(0, Math.min(100, density));
};

/**
 * Get crowd level category based on density value
 */
export const getCrowdLevel = (density) => {
  if (density >= 80) {
    return {
      level: "very-high",
      levelKey: "live.veryHighDensity",
      text: "Very High",
      color: "text-red-500",
      barColor: "bg-red-400",
      alert: true,
    };
  } else if (density >= 65) {
    return {
      level: "high",
      levelKey: "live.highDensity",
      text: "High",
      color: "text-orange-500",
      barColor: "bg-orange-400",
      alert: true,
    };
  } else if (density >= 40) {
    return {
      level: "medium",
      levelKey: "live.mediumDensity",
      text: "Medium",
      color: "text-yellow-500",
      barColor: "bg-yellow-300",
      alert: false,
    };
  } else {
    return {
      level: "low",
      levelKey: "live.lowDensity",
      text: "Low",
      color: "text-green-500",
      barColor: "bg-green-400",
      alert: false,
    };
  }
};

/**
 * Get trend direction (Up/Down/Stable)
 * Uses random but weighted probabilities
 */
export const getTrend = (currentDensity) => {
  const rand = Math.random();

  // Higher density = more likely to go down
  // Lower density = more likely to go up
  if (currentDensity >= 75) {
    // Very high - likely to decrease
    if (rand < 0.6) return { trend: "Down", icon: "TrendingDown" };
    if (rand < 0.8) return { trend: "Stable", icon: "Minus" };
    return { trend: "Up", icon: "TrendingUp" };
  } else if (currentDensity <= 30) {
    // Very low - likely to increase
    if (rand < 0.6) return { trend: "Up", icon: "TrendingUp" };
    if (rand < 0.8) return { trend: "Stable", icon: "Minus" };
    return { trend: "Down", icon: "TrendingDown" };
  } else {
    // Medium - balanced
    if (rand < 0.33) return { trend: "Up", icon: "TrendingUp" };
    if (rand < 0.66) return { trend: "Stable", icon: "Minus" };
    return { trend: "Down", icon: "TrendingDown" };
  }
};

/**
 * Get alternative suggestion for high crowd areas
 */
export const getAlternativeSuggestion = (density, locationName) => {
  if (density < 65) {
    return null; // No alternative needed
  }

  const suggestions = [
    "Consider visiting early morning or late evening",
    "Explore nearby less crowded attractions",
    "Book skip-the-line tickets to save time",
    "Visit on a weekday for fewer crowds",
    "Consider indoor activities or museums",
    "Postpone visit to a less busy time",
  ];

  // Pick a random suggestion
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

/**
 * Should create a crowd alert?
 * Only alert if density is high or very high
 */
export const shouldCreateCrowdAlert = (density) => {
  return density >= 65; // High or Very High
};

/**
 * Calculate crowd data for multiple locations
 */
export const calculateMultipleLocationsCrowd = (
  locations,
  weatherDataMap = {}
) => {
  return locations.map((location) => {
    const weatherData = weatherDataMap[location.name];
    const density = calculateCrowdDensity(location.name, weatherData);
    const crowdLevel = getCrowdLevel(density);
    const trend = getTrend(density);
    const alternative = getAlternativeSuggestion(density, location.name);

    return {
      location: location.name,
      lat: location.lat,
      lon: location.lon,
      density,
      ...crowdLevel,
      ...trend,
      alternative,
      timestamp: new Date().toISOString(),
    };
  });
};

/**
 * Generate crowd alert message
 */
export const generateCrowdAlertMessage = (locationName, density) => {
  const level = getCrowdLevel(density);

  if (level.level === "very-high") {
    return `⚠️ Very high tourist density at ${locationName} (${density}%) - Consider alternative times`;
  } else {
    return `⚠️ High tourist density at ${locationName} (${density}%) - Expect crowds`;
  }
};
