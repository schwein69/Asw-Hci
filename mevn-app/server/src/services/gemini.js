import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateDailyTips() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    Generate 6 unique, practical, and short sustainable travel tips.
    
    Return ONLY a raw JSON array (no markdown, no backticks).
    Each object must have these exact keys:
    - "text": The tip content (min12words, max 30 words).
    - "icon": A string keyword strictly chosen from this list: ["Globe", "Droplet", "Smartphone", "Luggage", "Plug", "Footprints", "Recycle", "ShoppingBag", "Leaf", "Sun", "Wind"].
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up if the AI wraps it in markdown code blocks
    const cleanedText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback data if API fails
    return [];
  }
}
export async function generateTravelItineraryEstimation(payload) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const { mode, distance_km, fuel_type } = payload;

  let vehicleContext = "";
  if (fuel_type) {
    vehicleContext = ` using a ${fuel_type} vehicle`;
  }

  const prompt = `
    Estimate the average travel cost (in Euros) and CO2 emissions (in kg) for a ${mode} trip covering ${distance_km} km${vehicleContext}.
    
    Return a JSON object with exactly these keys:
    {
      "cost": "String (e.g. '25.50')",
      "co2": "String (e.g. '4.2')"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { cost: "0.00", co2: "0.0" };
  }
}
