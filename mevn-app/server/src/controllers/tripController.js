import Trip from "../models/trip.js";
import User from "../models/users.js";
import {
  updateAchievementProgress,
  updateUserStreak,
} from "../services/achievementService.js";

// Get all trips for a user
export const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({ user: userId }).sort({ startTime: -1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching user trips:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch trips", error: error.message });
  }
};

// Get upcoming trips (within next 24 hours) for Live page
export const getUpcomingTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log("🔍 Searching upcoming trips for user:", userId);
    console.log("📅 Now:", now.toISOString());
    console.log("📅 Next 24h:", next24Hours.toISOString());

    const trips = await Trip.find({
      user: userId,
      status: "ongoing",
      startTime: {
        $gte: now,
        $lte: next24Hours,
      },
    }).sort({ startTime: 1 });

    console.log("✅ Found trips:", trips.length);
    if (trips.length > 0) {
      trips.forEach((trip) => {
        console.log(`  - ${trip.title}: ${trip.startTime.toISOString()}`);
      });
    }

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching upcoming trips:", error);
    res.status(500).json({
      message: "Failed to fetch upcoming trips",
      error: error.message,
    });
  }
};

// Get active/ongoing trips for World page
export const getActiveTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({
      user: userId,
      status: "ongoing",
    }).sort({ startTime: 1 });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching active trips:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch active trips", error: error.message });
  }
};

// Get completed trips for PastTrips page
export const getCompletedTripsAuth = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trips = await Trip.find({
      user: userId,
      status: "completed",
    }).sort({ endTime: -1 });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching completed trips:", error);
    res.status(500).json({
      message: "Failed to fetch completed trips",
      error: error.message,
    });
  }
};

// Get single trip by ID
export const getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch trip", error: error.message });
  }
};

// Update a specific segment inside the itinerary
export const updateSegment = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { segmentId } = req.body;

    // Fetch the Trip to check current state
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Find the specific segment within the itinerary array
    const segment = trip.itinerary.id(segmentId);

    if (!segment) {
      return res.status(404).json({ message: "Segment not found" });
    }

    // Check current state (default to false if undefined)
    const isCompleted = segment.isCompleted;

    if (isCompleted) {
      // --- UNCHECK (Set to false) ---
      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, "itinerary._id": segmentId },
        {
          $set: { "itinerary.$.isCompleted": false },
        },
        { new: true },
      );

      return res.status(200).json({
        message: "Segment unchecked",
        trip: updatedTrip,
      });
    } else {
      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, "itinerary._id": segmentId },
        {
          $set: { "itinerary.$.isCompleted": true },
        },
        { new: true },
      );

      return res.status(200).json({
        message: "Segment checked",
        isChecked: true,
        trip: updatedTrip,
      });
    }
  } catch (error) {
    console.error("Error updating segment:", error);
    res
      .status(500)
      .json({ message: `Error updating segment: ${error.message}` });
  }
};

// Delete entire Trip OR a specific Segment
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { segmentId } = req.body; // Check body for segmentId

    // CASE A: Delete ONLY a specific segment
    if (segmentId) {
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        {
          // $pull removes the item with matching _id from the 'itinerary' array
          $pull: { itinerary: { _id: segmentId } },
        },
        { new: true },
      );

      if (!updatedTrip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      // Note: You might want to recalculate totals (CO2/Price) here since a segment was removed

      return res.status(200).json({
        message: "Segment deleted successfully",
        trip: updatedTrip,
      });
    }

    // CASE B: Delete the ENTIRE Trip
    const deletedTrip = await Trip.findByIdAndDelete(tripId);

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({
      message: "Trip deleted successfully",
      trip: deletedTrip,
    });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ message: "Failed to delete", error: error.message });
  }
};

// Mark trip as completed
export const markTripCompleted = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { status: "completed", endTime: new Date() },
      { new: true },
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Update achievements based on trip data
    const userId = trip.user.toString();
    const unlockedAchievements = [];

    try {
      // Update transport-based achievements
      if (trip.transportModeBreakdown) {
        const breakdown = trip.transportModeBreakdown;

        // Train kilometers
        if (breakdown.get("train") || breakdown.train) {
          const trainKm = breakdown.get("train") || breakdown.train || 0;
          const result = await updateAchievementProgress(
            userId,
            "rail_rider",
            trainKm,
          );
          if (result?.unlockedTiers?.length > 0) {
            unlockedAchievements.push(...result.unlockedTiers);
          }
        }

        // Bike kilometers
        if (breakdown.get("bike") || breakdown.bike) {
          const bikeKm = breakdown.get("bike") || breakdown.bike || 0;
          const result = await updateAchievementProgress(
            userId,
            "bike_champion",
            bikeKm,
          );
          if (result?.unlockedTiers?.length > 0) {
            unlockedAchievements.push(...result.unlockedTiers);
          }
        }

        // Walking kilometers
        if (breakdown.get("walk") || breakdown.walk) {
          const walkKm = breakdown.get("walk") || breakdown.walk || 0;
          const result = await updateAchievementProgress(
            userId,
            "walking_warrior",
            walkKm,
          );
          if (result?.unlockedTiers?.length > 0) {
            unlockedAchievements.push(...result.unlockedTiers);
          }
        }

        // Bus kilometers
        if (breakdown.get("bus") || breakdown.bus) {
          const busKm = breakdown.get("bus") || breakdown.bus || 0;
          const result = await updateAchievementProgress(
            userId,
            "bus_believer",
            busKm,
          );
          if (result?.unlockedTiers?.length > 0) {
            unlockedAchievements.push(...result.unlockedTiers);
          }
        }
      }
      const avgCarCo2PerKm = 0.171;
      const estimatedCarCo2 = (trip.totalDistanceKm || 0) * avgCarCo2PerKm;
      const co2Saved = Math.max(
        0,
        estimatedCarCo2 - (trip.totalCo2Emission || 0),
      );
      // Carbon saved achievement
      if (co2Saved > 0) {
        const result = await updateAchievementProgress(
          userId,
          "carbon_saver",
          co2Saved,
        );
        if (result?.unlockedTiers?.length > 0) {
          unlockedAchievements.push(...result.unlockedTiers);
        }

        // Update user's total CO2 saved
        await User.findByIdAndUpdate(userId, {
          $inc: { totalCo2Saved: co2Saved },
        });
      }

      // Trip collector achievement (count completed trips)
      const completedTripsResult = await updateAchievementProgress(
        userId,
        "trip_collector",
        1,
      );
      if (completedTripsResult?.unlockedTiers?.length > 0) {
        unlockedAchievements.push(...completedTripsResult.unlockedTiers);
      }

      // Update streak
      await updateUserStreak(userId);

      console.log(
        `Trip ${tripId} completed. Unlocked ${unlockedAchievements.length} achievement tiers.`,
      );
      if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach((tier) => {
          console.log(`  ${tier.name} tier unlocked! +${tier.points} points`);
        });
      }
    } catch (achievementError) {
      console.error(" Error updating achievements:", achievementError);
      // Don't fail the trip completion if achievement update fails
    }

    res.status(200).json({
      trip,
      unlockedAchievements, // Return to frontend for display
    });
  } catch (error) {
    console.error("Error marking trip as completed:", error);
    res.status(500).json({
      message: "Failed to mark trip as completed",
      error: error.message,
    });
  }
};
