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

// save a new trip
export const saveTrip = async (req, res) => {
  try {
    const { userId, segments, title } = req.body;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    if (!segments?.length)
      return res
        .status(400)
        .json({ message: "No itinerary segments provided" });

    // Build the data object using the shared helper
    const tripData = buildTripData(userId, segments, title);

    // Save to DB
    const newTrip = new Trip(tripData);
    const savedTrip = await newTrip.save();

    return res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Create Trip Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create trip", error: error.message });
  }
};

// update an existing trip
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId, segments, title } = req.body;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    if (!segments?.length)
      return res
        .status(400)
        .json({ message: "No itinerary segments provided" });

    // Recalculate everything based on new segments
    const tripData = buildTripData(userId, segments, title);

    // Update in DB
    const updatedTrip = await Trip.findByIdAndUpdate(tripId, tripData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Update Trip Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update trip", error: error.message });
  }
};
const buildTripData = (userId, segments, title) => {
  const parseDuration = (timeStr) => {
    if (!timeStr) return 0;
    const hoursMatch = timeStr.match(/(\d+)\s*(h|hour|hours)/i);
    const minutesMatch = timeStr.match(/(\d+)\s*(m|min|mins|minute|minutes)/i);

    return (
      (hoursMatch ? parseInt(hoursMatch[1]) * 60 : 0) +
      (minutesMatch ? parseInt(minutesMatch[1]) : 0)
    );
  };

  const createLocalDate = (dateStr, timeStr = "00:00") => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0);
  };

  let totalDistanceKm = 0;
  let totalPrice = 0;
  let totalCo2Emission = 0;
  let totalDurationMinutes = 0;
  const transportModeBreakdown = {};
  const fuelTypeBreakdown = {
    diesel: 0,
    gasoline: 0,
    electric: 0,
  };
  let previousEndTime = new Date();

  const itinerary = segments.map((seg, index) => {
    const typeLower = (seg.type || "transport").toLowerCase();

    // Map Mode
    const modeMap = {
      airplane: "airplane",
      car: "car",
      train: "train",
      bus: "bus",
      walking: "walk",
      cycling: "bike",
    };
    const transportMode = modeMap[typeLower] || null;

    // Map Category
    let category = "Transport";
    if (["hotel", "motel", "b&b"].some((t) => typeLower.includes(t)))
      category = "Accommodation";
    else if (["restaurant", "bar", "food"].some((t) => typeLower.includes(t)))
      category = "Restaurant";

    // Metrics
    const dist = Number(seg.distance) || 0;
    const cost = Number(seg.cost) || 0;
    const co2 = Number(seg.co2) || 0;

    // Parse the string "0 hours 25 minutes" into number (25)
    const durationMins = parseDuration(seg.time);
    const fuelType = seg.fuelType?.toLowerCase() || null;
    // Totals
    totalDistanceKm += dist;
    totalPrice += cost;
    totalCo2Emission += co2;
    totalDurationMinutes += durationMins;

    if (transportMode) {
      transportModeBreakdown[transportMode] =
        (transportModeBreakdown[transportMode] || 0) + dist;
    }
    if (fuelType && fuelTypeBreakdown.hasOwnProperty(fuelType)) {
      fuelTypeBreakdown[fuelType] += dist;
    }

    // Date Logic
    let startDateTime;
    if (seg.date) {
      startDateTime = createLocalDate(seg.date, seg.departureTime || "00:00");
    } else {
      startDateTime = index === 0 ? new Date() : new Date(previousEndTime);
    }

    const endDateTime = new Date(
      startDateTime.getTime() + durationMins * 60000,
    );
    previousEndTime = endDateTime;

    return {
      category,
      transportMode,
      fuelType,
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

  return {
    user: userId,
    title:
      title || `Trip to ${itinerary[itinerary.length - 1].toLocation.name}`,
    status: "ongoing",
    totalDurationHours: Number((totalDurationMinutes / 60).toFixed(2)), // Converted to hours for total
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
    totalCo2Emission: Number(totalCo2Emission.toFixed(2)),
    transportModeBreakdown,
    fuelTypeBreakdown,
    startTime: itinerary[0]?.startTime,
    endTime: itinerary[itinerary.length - 1]?.endTime,
    itinerary,
  };
};
