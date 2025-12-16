import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateDailyTips() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Generate 8 unique, practical, and short sustainable travel tips.
    
    Return ONLY a raw JSON array (no markdown, no backticks).
    Each object must have these exact keys:
    - "text": The tip content (max 12 words).
    - "icon": A string keyword strictly chosen from this list: ["Globe", "Droplet", "Smartphone", "Luggage", "Plug", "Footprints", "Recycle", "ShoppingBag", "Leaf", "Sun", "Wind", "Bicycle"].
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
