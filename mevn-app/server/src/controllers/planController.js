import { generateTravelItineraryEstimation } from "../services/gemini.js";

export const getTravelItineraryEstimation = async (req, res) => {
  try {
    const estimation = await generateTravelItineraryEstimation(req.body);
    res.status(200).json(estimation);
  } catch (error) {
    console.error("Route Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch travel itinerary estimation",
        error: error.message,
      });
  }
};
