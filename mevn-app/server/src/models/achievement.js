import mongoose from "mongoose";

// Track individual tier unlocks
const TierUnlockSchema = new mongoose.Schema({
  tier: {
    type: Number,
    required: true, // 1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Diamond
  },
  tierName: {
    type: String,
    enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  pointsEarned: {
    type: Number,
    required: true,
  },
});

const AchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Type of achievement (rail_rider, bike_champion, carbon_saver, etc.)
    achievementType: {
      type: String,
      required: true,
      enum: [
        "rail_rider", // Train km
        "bike_champion", // Bike km
        "walking_warrior", // Walk km
        "bus_believer", // Bus km
        "carbon_saver", // CO2 saved
        "eco_explorer", // Countries visited
        "green_pioneer", // Carbon-neutral trips completed
        "streak_master", // Consecutive days streak
        "trip_collector", // Total trips completed
      ],
    },

    // Current progress (e.g., 850 km for rail_rider)
    currentProgress: {
      type: Number,
      default: 0,
    },

    // Current tier level (1-5)
    currentTier: {
      type: Number,
      default: 0, // 0 means no tier unlocked yet
      min: 0,
      max: 5,
    },

    // Total points earned from this achievement across all tiers
    totalPointsEarned: {
      type: Number,
      default: 0,
    },

    // History of tier unlocks
    tierHistory: [TierUnlockSchema],

    // Last time this achievement was updated
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
AchievementSchema.index({ user: 1, achievementType: 1 }, { unique: true });

export default mongoose.model("Achievement", AchievementSchema);
