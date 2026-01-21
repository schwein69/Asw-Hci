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
    const { userId, segments, title } = req.body;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    if (!segments?.length)
      return res
        .status(400)
        .json({ message: "No itinerary segments provided" });

    // Parse time
    const parseDuration = (timeStr) => {
      if (!timeStr) return 0;

      // Matches: "1h", "1 h", "1 hour", "1 hours"
      const hoursMatch = timeStr.match(/(\d+)\s*(h|hour|hours)/i);
      // Matches: "45m", "45 m", "45 min", "45 minutes", "45 mins"
      const minutesMatch = timeStr.match(
        /(\d+)\s*(m|min|mins|minute|minutes)/i,
      );

      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

      return hours * 60 + minutes;
    };

    let totalDistanceKm = 0;
    let totalPrice = 0;
    let totalCo2Emission = 0;
    let totalDurationMinutes = 0;
    const transportModeBreakdown = {};

    // Track time for chaining segments
    let previousEndTime = new Date();

    const itinerary = segments.map((seg, index) => {
      const typeLower = (seg.type || "transport").toLowerCase();

      //  Map Transport Mode
      const modeMap = {
        airplane: "airplane",
        car: "car",
        train: "train",
        bus: "bus",
        walking: "walk",
        cycling: "bike",
      };
      const transportMode = modeMap[typeLower] || null;

      //  Map Category
      let category = "Transport";
      if (["hotel", "motel", "b&b"].some((t) => typeLower.includes(t)))
        category = "Accommodation";
      else if (["restaurant", "bar", "food"].some((t) => typeLower.includes(t)))
        category = "Restaurant";

      //  Parse Numbers
      const dist = Number(seg.distance) || 0;
      const cost = Number(seg.cost) || 0;
      const co2 = Number(seg.co2) || 0;
      const durationMins = parseDuration(seg.time); // Uses safe parser

      // Update Totals
      totalDistanceKm += dist;
      totalPrice += cost;
      totalCo2Emission += co2;
      totalDurationMinutes += durationMins;

      if (transportMode) {
        transportModeBreakdown[transportMode] =
          (transportModeBreakdown[transportMode] || 0) + dist;
      }

      let startDateTime;

      if (seg.date) {
        // CASE A: Date AND Time provided (e.g., "2023-01-01" and "14:30")
        if (seg.departureTime) {
          startDateTime = new Date(`${seg.date}T${seg.departureTime}`);
        }
        // CASE B: Only Date provided
        else {
          startDateTime = new Date(`${seg.date}T00:00:00`);
        }
      } else {
        startDateTime = index === 0 ? new Date() : new Date(previousEndTime);
      }

      // Calculate End Time
      const endDateTime = new Date(
        startDateTime.getTime() + durationMins * 60000,
      );
      previousEndTime = endDateTime; // Update for next segment

      return {
        category,
        transportMode,
        fuelType: seg.fuelType?.toLowerCase() || null,
        distanceKm: dist,
        estimatedDurationMinutes: durationMins,
        transportNumber: seg.transportNumber || "",
        gate: seg.gate || "",
        arrivalGate: seg.arrivalGate || "",
        seatNumber: seg.seat || "",
        class: seg.travelClass || "",
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

    // Create the Document
    const newTrip = new Trip({
      user: userId,
      title:
        title || `Trip to ${itinerary[itinerary.length - 1].toLocation.name}`,
      status: "ongoing",
      totalDurationHours: Number((totalDurationMinutes / 60).toFixed(2)),
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      totalCo2Emission: Number(totalCo2Emission.toFixed(2)),
      transportModeBreakdown,
      startTime: itinerary[0]?.startTime,
      endTime: itinerary[itinerary.length - 1]?.endTime,
      itinerary,
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Save Trip Error:", error);
    res
      .status(500)
      .json({ message: "Failed to save trip", error: error.message });
  }
};
