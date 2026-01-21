import {
  generateTravelItineraryEstimation,
  compareTravelModes,
} from "../services/gemini.js";
import Trip from "../models/trip.js";

export const getTravelItineraryEstimation = async (req, res) => {
  try {
    const estimation = await generateTravelItineraryEstimation(req.body);
    res.status(200).json(estimation);
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({
      message: "Failed to fetch travel itinerary estimation",
      error: error.message,
    });
  }
};

export const compareTravelOptions = async (req, res) => {
  try {
    const comparisonData = await compareTravelModes(req.body);
    const comparisonArray = Object.entries(comparisonData).map(
      ([mode, details]) => ({
        mode: mode,
        ...details,
      }),
    );

    res.status(200).json(comparisonArray);
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({
      message: "Failed to compare travel options",
      error: error.message,
    });
  }
};

export const saveTrip = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { segments, title } = req.body;

    if (!segments || segments.length === 0) {
      return res
        .status(400)
        .json({ message: "No itinerary segments provided" });
    }

    let totalDistanceKm = 0;
    let totalPrice = 0;
    let totalCo2Emission = 0;
    const transportModeBreakdown = {};

    const itinerary = segments.map((seg) => {
      let category = "Transport";
      let transportMode = null;
      const typeLower = (seg.type || "").toLowerCase();

      if (
        ["hotel", "motel", "resort", "b&b", "accommodation"].some((t) =>
          typeLower.includes(t),
        )
      ) {
        category = "Accommodation";
      } else if (
        ["restaurant", "bar", "cafe", "food"].some((t) => typeLower.includes(t))
      ) {
        category = "Restaurant";
      } else {
        // Map frontend types (Airplane, Car) to Schema enums (airplane, car)
        const modeMap = {
          airplane: "airplane",
          car: "car",
          train: "train",
          bus: "bus",
          walking: "walk",
          cycling: "bike",
        };
        transportMode = modeMap[typeLower] || null;
      }

      // Accumulate Totals
      const dist = parseFloat(seg.distance) || 0;
      const cost = parseFloat(seg.cost) || 0;
      const co2 = parseFloat(seg.co2) || 0;

      totalDistanceKm += dist;
      totalPrice += cost;
      totalCo2Emission += co2;

      // Update Breakdown map (e.g., { "airplane": 500, "car": 20 })
      if (transportMode) {
        transportModeBreakdown[transportMode] =
          (transportModeBreakdown[transportMode] || 0) + dist;
      }

      // Handle Dates
      let startDateTime = seg.date ? new Date(seg.date) : new Date();
      if (seg.date && seg.departureTime) {
        startDateTime = new Date(`${seg.date}T${seg.departureTime}`);
      }

      let endDateTime = startDateTime;
      if (seg.date && seg.arrivalTime) {
        endDateTime = new Date(`${seg.date}T${seg.arrivalTime}`);
        if (endDateTime < startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
      }

      // Return formatted object
      return {
        category,
        transportMode,
        fuelType: seg.fuelType ? seg.fuelType.toLowerCase() : null,
        distanceKm: dist,
        estimatedDurationMinutes: 0, // You can calculate this from times if needed

        // Specific Details
        transportNumber: seg.transportNumber,
        gate: seg.gate,
        arrivalGate: seg.arrivalGate,
        seatNumber: seg.seat,
        class: seg.travelClass,

        // Locations
        fromLocation: {
          name: seg.from || "Start",
          coordinates: seg.fromCoords || [0, 0],
          address: seg.fromAddress || "",
        },
        toLocation: {
          name: seg.to || "End",
          coordinates: seg.toCoords || [0, 0],
          address: seg.toAddress || "",
        },

        startTime: startDateTime,
        endTime: endDateTime,
        price: cost,
        co2: co2,
      };
    });

    // Create the Trip Document
    const newTrip = new Trip({
      user: userId,
      title:
        title || `Trip to ${itinerary[itinerary.length - 1].toLocation.name}`,
      status: "ongoing",
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      totalCo2Emission: parseFloat(totalCo2Emission.toFixed(2)),
      transportModeBreakdown,
      startTime: itinerary[0]?.startTime,
      endTime: itinerary[itinerary.length - 1]?.endTime,
      itinerary,
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Save Trip Error:", error);
    res.status(500).json({
      message: "Failed to save trip",
      error: error.message,
    });
  }
};
