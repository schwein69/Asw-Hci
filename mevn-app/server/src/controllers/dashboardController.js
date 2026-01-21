import Trip from "../models/trip.js";
import User from "../models/users.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select("ecoPoints");
    const trips = await Trip.find({ user: userId }).select(
      "totalDistanceKm totalCo2Emission co2Saved transportModeBreakdown"
    );

    const totals = trips.reduce(
      (acc, trip) => {
        acc.totalDistanceKm += trip.totalDistanceKm || 0;
        acc.totalCo2SavedKg += trip.co2Saved || 0;
        acc.totalCo2Emission += trip.totalCo2Emission || 0;

        const breakdown = trip.transportModeBreakdown || {};
        acc.greenDistanceKm +=
          (breakdown.get ? breakdown.get("walk") : breakdown.walk) || 0;
        acc.greenDistanceKm +=
          (breakdown.get ? breakdown.get("bike") : breakdown.bike) || 0;
        acc.greenDistanceKm +=
          (breakdown.get ? breakdown.get("train") : breakdown.train) || 0;

        if ((trip.totalCo2Emission || 0) === 0) {
          acc.zeroTrips += 1;
        }

        return acc;
      },
      {
        totalDistanceKm: 0,
        totalCo2SavedKg: 0,
        totalCo2Emission: 0,
        greenDistanceKm: 0,
        zeroTrips: 0,
      }
    );

    res.status(200).json({
      totalDistanceKm: Math.round(totals.totalDistanceKm),
      totalCo2SavedKg: Math.round(totals.totalCo2SavedKg),
      greenDistanceKm: Math.round(totals.greenDistanceKm),
      ecoScore: user?.ecoPoints || 0,
      zeroTrips: totals.zeroTrips,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

export const getMonthlyEmissions = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const year = Number(req.query.year) || new Date().getFullYear();
    const trips = await Trip.find({ user: userId }).select(
      "totalCo2Emission endTime startTime createdAt"
    );

    const months = Array.from({ length: 12 }, () => 0);
    trips.forEach((trip) => {
      const date = trip.endTime || trip.startTime || trip.createdAt;
      if (!date) return;
      const tripDate = new Date(date);
      if (tripDate.getFullYear() !== year) return;
      const monthIndex = tripDate.getMonth();
      months[monthIndex] += trip.totalCo2Emission || 0;
    });

    res.status(200).json({
      year,
      months: months.map((value) => Math.round(value)),
    });
  } catch (error) {
    console.error("Error fetching monthly emissions:", error);
    res.status(500).json({ error: "Failed to fetch monthly emissions" });
  }
};

export const getTransportModes = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const trips = await Trip.find({ user: userId }).select(
      "transportModeBreakdown"
    );

    const totals = {
      train: 0,
      bus: 0,
      bike: 0,
      walk: 0,
      car: 0,
      airplane: 0,
    };

    trips.forEach((trip) => {
      const breakdown = trip.transportModeBreakdown || {};
      Object.keys(totals).forEach((mode) => {
        const value = breakdown.get ? breakdown.get(mode) : breakdown[mode];
        totals[mode] += Number(value || 0);
      });
    });

    const totalDistance = Object.values(totals).reduce((a, b) => a + b, 0);
    const toPercent = (value) =>
      totalDistance > 0 ? Math.round((value / totalDistance) * 100) : 0;

    res.status(200).json({
      labels: ["train", "bus", "bike", "walk", "car", "airplane"],
      values: [
        toPercent(totals.train),
        toPercent(totals.bus),
        toPercent(totals.bike),
        toPercent(totals.walk),
        toPercent(totals.car),
        toPercent(totals.airplane),
      ],
    });
  } catch (error) {
    console.error("Error fetching transport modes:", error);
    res.status(500).json({ error: "Failed to fetch transport modes" });
  }
};

export const getTripEfficiency = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const trips = await Trip.find({ user: userId })
      .sort({ endTime: -1, createdAt: -1 })
      .limit(5)
      .select("title itinerary totalCo2Emission totalDistanceKm");

    const avgCarCo2PerKm = 0.171;
    const payload = trips.map((trip) => {
      const routeSummary = (trip.itinerary || [])
        .map((segment) => {
          const from = segment.fromLocation?.name || "";
          const to = segment.toLocation?.name || "";
          return from && to ? `${from}→${to}` : "";
        })
        .filter(Boolean)
        .join(", ");

      const myTotal = Math.round(trip.totalCo2Emission || 0);
      const avgTotal = Math.round(
        (trip.totalDistanceKm || 0) * avgCarCo2PerKm
      );

      return {
        name: trip.title || "Trip",
        routeSummary,
        myTotal,
        avgTotal,
      };
    });

    res.status(200).json({ trips: payload });
  } catch (error) {
    console.error("Error fetching trip efficiency:", error);
    res.status(500).json({ error: "Failed to fetch trip efficiency" });
  }
};

export const getEnvironmentalImpact = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const trips = await Trip.find({ user: userId }).select("co2Saved");
    const totalCo2SavedKg = trips.reduce(
      (sum, trip) => sum + (trip.co2Saved || 0),
      0
    );

    const trees = Math.round(totalCo2SavedKg / 22);
    const energyKwh = Math.round(totalCo2SavedKg * 1.5);
    const miles = Math.round(totalCo2SavedKg * 2);

    res.status(200).json({
      trees,
      energyKwh,
      miles,
    });
  } catch (error) {
    console.error("Error fetching environmental impact:", error);
    res.status(500).json({ error: "Failed to fetch environmental impact" });
  }
};
