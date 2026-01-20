// Achievement tier definitions with progressive targets and rewards

export const ACHIEVEMENT_TIERS = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Platinum: 4,
  Diamond: 5,
};

// Level calculation: Every 1000 points = 1 level
export const POINTS_PER_LEVEL = 1000;

export const ACHIEVEMENT_DEFINITIONS = {
  rail_rider: {
    name: "Rail Rider",
    description: "Travel by train",
    icon: "TrainFront",
    color: "text-emerald-600",
    category: "transport",
    unit: "km",
    tiers: [
      { level: 1, name: "Bronze", target: 100, points: 50 },
      { level: 2, name: "Silver", target: 500, points: 100 },
      { level: 3, name: "Gold", target: 1000, points: 200 },
      { level: 4, name: "Platinum", target: 2500, points: 300 },
      { level: 5, name: "Diamond", target: 5000, points: 500 },
    ],
  },

  bike_champion: {
    name: "Bike Champion",
    description: "Travel by bike",
    icon: "Bike",
    color: "text-blue-600",
    category: "transport",
    unit: "km",
    tiers: [
      { level: 1, name: "Bronze", target: 50, points: 50 },
      { level: 2, name: "Silver", target: 200, points: 100 },
      { level: 3, name: "Gold", target: 500, points: 200 },
      { level: 4, name: "Platinum", target: 1000, points: 300 },
      { level: 5, name: "Diamond", target: 2500, points: 500 },
    ],
  },

  walking_warrior: {
    name: "Walking Warrior",
    description: "Travel on foot",
    icon: "PersonStanding",
    color: "text-green-600",
    category: "transport",
    unit: "km",
    tiers: [
      { level: 1, name: "Bronze", target: 25, points: 50 },
      { level: 2, name: "Silver", target: 100, points: 100 },
      { level: 3, name: "Gold", target: 250, points: 200 },
      { level: 4, name: "Platinum", target: 500, points: 300 },
      { level: 5, name: "Diamond", target: 1000, points: 500 },
    ],
  },

  bus_believer: {
    name: "Bus Believer",
    description: "Travel by bus",
    icon: "Bus",
    color: "text-orange-600",
    category: "transport",
    unit: "km",
    tiers: [
      { level: 1, name: "Bronze", target: 100, points: 50 },
      { level: 2, name: "Silver", target: 500, points: 100 },
      { level: 3, name: "Gold", target: 1000, points: 200 },
      { level: 4, name: "Platinum", target: 2500, points: 300 },
      { level: 5, name: "Diamond", target: 5000, points: 500 },
    ],
  },

  carbon_saver: {
    name: "Carbon Saver",
    description: "Save CO₂ emissions",
    icon: "Heart",
    color: "text-red-600",
    category: "impact",
    unit: "kg CO₂",
    tiers: [
      { level: 1, name: "Bronze", target: 50, points: 75 },
      { level: 2, name: "Silver", target: 200, points: 150 },
      { level: 3, name: "Gold", target: 500, points: 250 },
      { level: 4, name: "Platinum", target: 1000, points: 400 },
      { level: 5, name: "Diamond", target: 2500, points: 600 },
    ],
  },

  eco_explorer: {
    name: "Eco Explorer",
    description: "Visit different countries sustainably",
    icon: "Earth",
    color: "text-purple-600",
    category: "exploration",
    unit: "countries",
    tiers: [
      { level: 1, name: "Bronze", target: 3, points: 100 },
      { level: 2, name: "Silver", target: 7, points: 150 },
      { level: 3, name: "Gold", target: 15, points: 250 },
      { level: 4, name: "Platinum", target: 25, points: 400 },
      { level: 5, name: "Diamond", target: 40, points: 600 },
    ],
  },

  green_pioneer: {
    name: "Green Pioneer",
    description: "Complete carbon-neutral journeys",
    icon: "Sprout",
    color: "text-green-600",
    category: "impact",
    unit: "trips",
    tiers: [
      { level: 1, name: "Bronze", target: 5, points: 50 },
      { level: 2, name: "Silver", target: 20, points: 100 },
      { level: 3, name: "Gold", target: 50, points: 200 },
      { level: 4, name: "Platinum", target: 100, points: 300 },
      { level: 5, name: "Diamond", target: 250, points: 500 },
    ],
  },

  streak_master: {
    name: "Streak Master",
    description: "Maintain consecutive eco-travel days",
    icon: "Target",
    color: "text-yellow-600",
    category: "consistency",
    unit: "days",
    tiers: [
      { level: 1, name: "Bronze", target: 7, points: 75 },
      { level: 2, name: "Silver", target: 30, points: 150 },
      { level: 3, name: "Gold", target: 90, points: 300 },
      { level: 4, name: "Platinum", target: 180, points: 500 },
      { level: 5, name: "Diamond", target: 365, points: 1000 },
    ],
  },

  trip_collector: {
    name: "Trip Collector",
    description: "Complete eco-friendly trips",
    icon: "Trophy",
    color: "text-indigo-600",
    category: "consistency",
    unit: "trips",
    tiers: [
      { level: 1, name: "Bronze", target: 10, points: 50 },
      { level: 2, name: "Silver", target: 50, points: 100 },
      { level: 3, name: "Gold", target: 100, points: 200 },
      { level: 4, name: "Platinum", target: 250, points: 350 },
      { level: 5, name: "Diamond", target: 500, points: 600 },
    ],
  },
};

// Helper function to get achievement definition by type
export function getAchievementDefinition(achievementType) {
  return ACHIEVEMENT_DEFINITIONS[achievementType];
}

// Helper function to calculate which tier a progress value falls into
export function calculateTierForProgress(achievementType, progress) {
  const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
  if (!definition) return null;

  // Find the highest tier that's been completed
  let currentTier = 0;
  for (const tier of definition.tiers) {
    if (progress >= tier.target) {
      currentTier = tier.level;
    } else {
      break; // Tiers are ordered, so we can stop here
    }
  }

  return currentTier;
}

// Helper function to get next tier info
export function getNextTierInfo(achievementType, currentTier) {
  const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
  if (!definition) return null;

  const nextTier = definition.tiers.find((t) => t.level === currentTier + 1);
  return nextTier || null;
}

// Helper function to calculate user level from total points
export function calculateUserLevel(totalPoints) {
  return Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
}

// Helper function to get points needed for next level
export function getPointsForNextLevel(currentLevel) {
  return currentLevel * POINTS_PER_LEVEL;
}
