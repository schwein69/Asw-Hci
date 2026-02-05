import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.GEMINI_API_KEY;
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

    const cleanedText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
}
export async function generateKnowledgeTips() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    Generate 4 distinct, educational, and statistical sustainability facts corresponding to the specific categories below.
    
    Return ONLY a raw JSON object (no markdown, no backticks).
    The object must have exactly these 4 keys with relevant content:
    
    1. "flightCo2": A specific statistic about CO2 emissions from flying (e.g., a specific route or general output).
    2. "treeAbsorption": A comparison of how many trees are needed to offset common emissions or how much one tree absorbs.
    3. "methodsVs": A percentage or factor comparison of travel methods, like walk, plane, train, Ev car, etcc... for the efficiency.
    4. "accomodations": A statistic about energy/water savings in eco-certified accommodation, like bnb is better than 5 start hotel.

    Keep each string under 30 words. Make them punchy and factual.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);

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

  let contextDetails = "";

  if (mode === "Airplane") {
    contextDetails =
      "Assume a standard Economy Class commercial airline ticket booked 2 weeks in advance. Include taxes and fees.";
  } else if (mode === "Train") {
    contextDetails = "Assume a standard second-class train ticket.";
  } else if (mode === "Car") {
    contextDetails = `Assume a vehicle powered by ${fuel_type}.`;
  } else if (mode === "Bus") {
    contextDetails = "Assume a standard intercity bus ticket.";
  }

  const prompt = `
    Act as a travel analyst. Estimate the average travel cost (in Euros), CO2 emissions (in kg) and time to travel for a ${mode} trip covering ${distance_km} km.
    
    Specific Constraints:
    - ${contextDetails}
    - Provide a realistic market price for this specific distance.
    
    Return a JSON object with exactly these keys:
    {
      "cost": "String (e.g. '125.50')",
      "co2": "String (e.g. '4.2')",
      "time": "String (e.g. '3 hours 15 minutes')"
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { cost: "0.00", co2: "0.0", time: "0" };
  }
}

export async function compareTravelModes(payload) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  const { distance_km } = payload;
  const prompt = `
    Act as a travel analyst. Compare the average travel cost (in Euros), CO2 emissions (in kg) and time to travel for Car, Train, Bus, Airplane over a distance of ${distance_km} km.
    Calculate time also for bycicle and walking.

    Return a JSON object with exactly these keys, for bicycle and walking return cost as "0.00" and co2 as "0.0":
    For Airplane and train is economy class ticket. For time e.g. '3 hours 15 minutes'.
    {
      "Car": {"cost": "String", "co2": "String", "time": "String"}, 
      "Train": {"cost": "String", "co2": "String", "time": "String"},
      "Airplane": {"cost": "String", "co2": "String", "time": "String"},
      "Bicycle": {"cost": "String", "co2": "String", "time": "String"},
      "Walking": {"cost": "String", "co2": "String", "time": "String"},
      "Bus": {"cost": "String", "co2": "String", "time": "String"}
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      Car: { cost: "0.00", co2: "0.0", time: "0" },
      Train: { cost: "0.00", co2: "0.0", time: "0" },
      Airplane: { cost: "0.00", co2: "0.0", time: "0" },
      Bicycle: { cost: "0.00", co2: "0.0", time: "0" },
      Walking: { cost: "0.00", co2: "0.0", time: "0" },
    };
  }
}
