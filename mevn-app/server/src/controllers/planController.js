import {
  generateTravelItineraryEstimation,
  compareTravelModes,
} from "../services/gemini.js";

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
      })
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
