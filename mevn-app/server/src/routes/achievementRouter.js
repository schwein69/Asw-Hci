import express from "express";
import {
  getAchievements,
  getRewardsStats,
  getLeaderboardData,
  getCompleteRewardsData,
} from "../controllers/achievementController.js";

const router = express.Router();

// Get all achievements for a user
router.get("/:userId", getAchievements);

// Get rewards stats for a user
router.get("/:userId/stats", getRewardsStats);

// Get complete rewards data (achievements + stats + leaderboard) - BEST FOR FRONTEND
router.get("/:userId/complete", getCompleteRewardsData);

// Get leaderboard
router.get("/leaderboard", getLeaderboardData);

export default router;
