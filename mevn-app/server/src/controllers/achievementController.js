import {
  getUserAchievements,
  getUserRewardsStats,
  getLeaderboard,
} from "../services/achievementService.js";

/**
 * GET /api/achievements/:userId
 * Get all achievements for a user
 */
export async function getAchievements(req, res) {
  try {
    const { userId } = req.params;

    const achievements = await getUserAchievements(userId);

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch achievements",
      error: error.message,
    });
  }
}

/**
 * GET /api/achievements/:userId/stats
 * Get rewards statistics for a user
 */
export async function getRewardsStats(req, res) {
  try {
    const { userId } = req.params;

    const stats = await getUserRewardsStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching rewards stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards stats",
      error: error.message,
    });
  }
}

/**
 * GET /api/achievements/leaderboard
 * Get global leaderboard
 */
export async function getLeaderboardData(req, res) {
  try {
    const { limit = 10, userId } = req.query;

    const leaderboard = await getLeaderboard(parseInt(limit), userId);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message,
    });
  }
}

/**
 * GET /api/achievements/:userId/complete
 * Get complete rewards page data (achievements + stats + leaderboard)
 */
export async function getCompleteRewardsData(req, res) {
  try {
    const { userId } = req.params;

    const [achievements, stats, leaderboard] = await Promise.all([
      getUserAchievements(userId),
      getUserRewardsStats(userId),
      getLeaderboard(10, userId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats: stats,
        achievements,
        leaderboard,
      },
    });
  } catch (error) {
    console.error("Error fetching complete rewards data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards data",
      error: error.message,
    });
  }
}
