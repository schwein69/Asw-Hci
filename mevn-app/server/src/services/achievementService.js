import Achievement from "../models/achievement.js";
import User from "../models/users.js";
import {
  getAchievementDefinition,
  calculateTierForProgress,
  getNextTierInfo,
  calculateUserLevel,
  getPointsForNextLevel,
} from "../config/achievementDefinitions.js";

/**
 * Update achievement progress for a user
 * @param {String} userId - User ID
 * @param {String} achievementType - Type of achievement (rail_rider, bike_champion, etc.)
 * @param {Number} incrementValue - Value to add to current progress
 * @returns {Object} Updated achievement with unlocked tiers info
 */
export async function updateAchievementProgress(
  userId,
  achievementType,
  incrementValue
) {
  if (incrementValue <= 0) return null;

  const definition = getAchievementDefinition(achievementType);
  if (!definition) {
    throw new Error(`Unknown achievement type: ${achievementType}`);
  }

  // Find or create achievement document
  let achievement = await Achievement.findOne({
    user: userId,
    achievementType,
  });

  if (!achievement) {
    achievement = new Achievement({
      user: userId,
      achievementType,
      currentProgress: 0,
      currentTier: 0,
      totalPointsEarned: 0,
      tierHistory: [],
    });
  }

  // Store old values
  const oldProgress = achievement.currentProgress;
  const oldTier = achievement.currentTier;

  // Update progress
  achievement.currentProgress += incrementValue;
  achievement.lastUpdated = new Date();

  // Calculate new tier
  const newTier = calculateTierForProgress(
    achievementType,
    achievement.currentProgress
  );

  // Check if user unlocked new tiers
  const unlockedTiers = [];
  if (newTier > oldTier) {
    // User unlocked one or more tiers
    for (let tier = oldTier + 1; tier <= newTier; tier++) {
      const tierInfo = definition.tiers.find((t) => t.level === tier);
      if (tierInfo) {
        // Add to tier history
        achievement.tierHistory.push({
          tier: tierInfo.level,
          tierName: tierInfo.name,
          unlockedAt: new Date(),
          pointsEarned: tierInfo.points,
        });

        // Add points to total
        achievement.totalPointsEarned += tierInfo.points;

        unlockedTiers.push(tierInfo);
      }
    }

    achievement.currentTier = newTier;

    // Update user's total ecoPoints and level
    const user = await User.findById(userId);
    if (user) {
      const pointsToAdd = unlockedTiers.reduce(
        (sum, tier) => sum + tier.points,
        0
      );
      user.ecoPoints += pointsToAdd;
      user.ecoLevel = calculateUserLevel(user.ecoPoints);
      await user.save();
    }
  }

  await achievement.save();

  return {
    achievement,
    unlockedTiers,
    progress: {
      old: oldProgress,
      new: achievement.currentProgress,
      increment: incrementValue,
    },
  };
}

/**
 * Get all achievements for a user with progress info
 * @param {String} userId - User ID
 * @returns {Array} Array of achievements with metadata
 */
export async function getUserAchievements(userId) {
  const achievements = await Achievement.find({ user: userId });

  // Map achievements to include definition data and next tier info
  const achievementsWithDetails = achievements.map((achievement) => {
    const definition = getAchievementDefinition(achievement.achievementType);
    const nextTier = getNextTierInfo(
      achievement.achievementType,
      achievement.currentTier
    );

    return {
      ...achievement.toObject(),
      definition: {
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        color: definition.color,
        category: definition.category,
        unit: definition.unit,
      },
      nextTier: nextTier
        ? {
            level: nextTier.level,
            name: nextTier.name,
            target: nextTier.target,
            points: nextTier.points,
            progressPercent: Math.min(
              (achievement.currentProgress / nextTier.target) * 100,
              100
            ),
          }
        : null,
      completed: achievement.currentTier === 5, // Diamond = max tier
    };
  });

  return achievementsWithDetails;
}

/**
 * Get user stats for rewards page
 * @param {String} userId - User ID
 * @returns {Object} User statistics
 */
export async function getUserRewardsStats(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const achievements = await Achievement.find({ user: userId });

  // Calculate total unlocked achievements (any tier > 0)
  const achievementsUnlocked = achievements.filter(
    (a) => a.currentTier > 0
  ).length;

  // Total possible achievements (9 types)
  const totalAchievements = 9;

  // Calculate streak info
  const streakDays = user.currentStreak || 0;
  const streakHistory = calculateStreakHistory(user); // Last 7 days

  // Calculate max points for current level
  const maxPointsForLevel = getPointsForNextLevel(user.ecoLevel);

  // Global rank (simplified - calculate later with leaderboard)
  const globalRank = await calculateGlobalRank(userId);

  return {
    userLevel: user.ecoLevel,
    ecoPoints: user.ecoPoints,
    maxPointsForLevel,
    globalRank,
    achievementsUnlocked,
    totalAchievements,
    streakDays,
    streakHistory,
  };
}

/**
 * Calculate last 7 days streak history
 * @param {Object} user - User document
 * @returns {Array} Array of 7 booleans (true = active day)
 */
function calculateStreakHistory(user) {
  // Simplified: Return array based on current streak
  // TODO: Implement proper daily tracking
  const history = new Array(7).fill(false);
  const activeDays = Math.min(user.currentStreak || 0, 7);

  for (let i = 0; i < activeDays; i++) {
    history[6 - i] = true; // Fill from most recent day backwards
  }

  return history;
}

/**
 * Calculate global rank for user
 * @param {String} userId - User ID
 * @returns {String} Rank description
 */
async function calculateGlobalRank(userId) {
  const user = await User.findById(userId);
  if (!user) return "Unranked";

  // Count users with more points
  const usersAbove = await User.countDocuments({
    ecoPoints: { $gt: user.ecoPoints },
  });

  const totalUsers = await User.countDocuments();
  const percentile = ((totalUsers - usersAbove) / totalUsers) * 100;

  if (percentile <= 1) return "Top 1%";
  if (percentile <= 5) return "Top 5%";
  if (percentile <= 10) return "Top 10%";
  if (percentile <= 25) return "Top 25%";
  if (percentile <= 50) return "Top 50%";
  return `Top ${Math.ceil(percentile)}%`;
}

/**
 * Get leaderboard (top users by ecoPoints)
 * @param {Number} limit - Number of users to return
 * @param {String} currentUserId - Current user ID to include
 * @returns {Array} Leaderboard entries
 */
export async function getLeaderboard(limit = 10, currentUserId = null) {
  // Get top users
  const topUsers = await User.find()
    .sort({ ecoPoints: -1 })
    .limit(limit)
    .select("username ecoPoints")
    .lean();

  // If current user is not in top list, fetch their data
  let currentUser = null;
  const isInTop = topUsers.some(
    (u) => u._id.toString() === currentUserId?.toString()
  );

  if (currentUserId && !isInTop) {
    currentUser = await User.findById(currentUserId)
      .select("username ecoPoints")
      .lean();
  }

  const leaderboard = topUsers.map((user, index) => ({
    id: user._id,
    name: user.username,
    points: user.ecoPoints,
    rank: index + 1,
    isMe: user._id.toString() === currentUserId?.toString(),
  }));

  // Add current user at the end if not in top
  if (currentUser) {
    leaderboard.push({
      id: currentUser._id,
      name: currentUser.username,
      points: currentUser.ecoPoints,
      rank: null, // Will show as "You"
      isMe: true,
    });
  }

  return leaderboard;
}

/**
 * Update streak for user (called when trip is completed)
 * @param {String} userId - User ID
 */
export async function updateUserStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastTripDate = user.lastTripDate ? new Date(user.lastTripDate) : null;

  if (lastTripDate) {
    lastTripDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastTripDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day - no change to streak
      return;
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      user.currentStreak = (user.currentStreak || 0) + 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    } else {
      // Streak broken - reset to 1
      user.currentStreak = 1;
    }
  } else {
    // First trip ever
    user.currentStreak = 1;
    user.longestStreak = 1;
  }

  user.lastTripDate = new Date();
  await user.save();

  // Update streak_master achievement
  await updateAchievementProgress(userId, "streak_master", user.currentStreak);
}
