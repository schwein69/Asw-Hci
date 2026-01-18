import Trip from "../models/trip.js";

// Get all trips for a user
export const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({ user: userId }).sort({ startTime: -1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching user trips:", error);
    res.status(500).json({ message: "Failed to fetch trips", error: error.message });
  }
};

// Get upcoming trips (within next 24 hours) for Live page
export const getUpcomingTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const trips = await Trip.find({
      user: userId,
      status: "ongoing",
      startTime: {
        $gte: now,
        $lte: next24Hours,
      },
    }).sort({ startTime: 1 });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching upcoming trips:", error);
    res.status(500).json({ message: "Failed to fetch upcoming trips", error: error.message });
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
    res.status(500).json({ message: "Failed to fetch active trips", error: error.message });
  }
};

// Get completed trips for PastTrips page
export const getCompletedTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({
      user: userId,
      status: "completed",
    }).sort({ endTime: -1 });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching completed trips:", error);
    res.status(500).json({ message: "Failed to fetch completed trips", error: error.message });
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
    res.status(500).json({ message: "Failed to fetch trip", error: error.message });
  }
};

// Create new trip
export const createTrip = async (req, res) => {
  try {
    const tripData = req.body;
    
    // Calculate totals from itinerary
    let totalDurationHours = 0;
    let totalDistanceKm = 0;
    let totalPrice = 0;
    let totalCo2Emission = 0;
    const transportModeBreakdown = new Map();

    if (tripData.itinerary && tripData.itinerary.length > 0) {
      tripData.itinerary.forEach((segment) => {
        // Add to totals
        if (segment.durationHours) totalDurationHours += segment.durationHours;
        if (segment.distanceKm) totalDistanceKm += segment.distanceKm;
        if (segment.price) totalPrice += segment.price;
        if (segment.co2) totalCo2Emission += segment.co2;

        // Track transport modes
        if (segment.category === "Transport" && segment.transportMode) {
          const mode = segment.transportMode;
          const current = transportModeBreakdown.get(mode) || 0;
          transportModeBreakdown.set(mode, current + (segment.distanceKm || 0));
        }
      });
    }

    // Calculate CO2 saved (compared to average car travel)
    const avgCarCo2PerKm = 0.171; // kg CO2 per km
    const carCo2 = totalDistanceKm * avgCarCo2PerKm;
    const co2Saved = Math.max(0, carCo2 - totalCo2Emission);

    const newTrip = new Trip({
      ...tripData,
      totalDurationHours,
      totalDistanceKm,
      totalPrice,
      totalCo2Emission,
      co2Saved,
      transportModeBreakdown: Object.fromEntries(transportModeBreakdown),
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Failed to create trip", error: error.message });
  }
};

// Update trip
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const updateData = req.body;

    // Recalculate totals if itinerary is updated
    if (updateData.itinerary) {
      let totalDurationHours = 0;
      let totalDistanceKm = 0;
      let totalPrice = 0;
      let totalCo2Emission = 0;
      const transportModeBreakdown = new Map();

      updateData.itinerary.forEach((segment) => {
        if (segment.durationHours) totalDurationHours += segment.durationHours;
        if (segment.distanceKm) totalDistanceKm += segment.distanceKm;
        if (segment.price) totalPrice += segment.price;
        if (segment.co2) totalCo2Emission += segment.co2;

        if (segment.category === "Transport" && segment.transportMode) {
          const mode = segment.transportMode;
          const current = transportModeBreakdown.get(mode) || 0;
          transportModeBreakdown.set(mode, current + (segment.distanceKm || 0));
        }
      });

      const avgCarCo2PerKm = 0.171;
      const carCo2 = totalDistanceKm * avgCarCo2PerKm;
      const co2Saved = Math.max(0, carCo2 - totalCo2Emission);

      updateData.totalDurationHours = totalDurationHours;
      updateData.totalDistanceKm = totalDistanceKm;
      updateData.totalPrice = totalPrice;
      updateData.totalCo2Emission = totalCo2Emission;
      updateData.co2Saved = co2Saved;
      updateData.transportModeBreakdown = Object.fromEntries(transportModeBreakdown);
    }

    const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Failed to update trip", error: error.message });
  }
};

// Delete trip
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const deletedTrip = await Trip.findByIdAndDelete(tripId);

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({ message: "Trip deleted successfully", trip: deletedTrip });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: "Failed to delete trip", error: error.message });
  }
};

// Mark trip as completed
export const markTripCompleted = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { status: "completed", endTime: new Date() },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error marking trip as completed:", error);
    res.status(500).json({ message: "Failed to mark trip as completed", error: error.message });
  }
};


