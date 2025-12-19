import express from "express";
import { generateDailyTips } from "../services/gemini.js";

const router = express.Router();

router.get("/tips", async (req, res) => {
  try {
    const tips = await generateDailyTips();

    res.status(200).json(tips);
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({
      message: "Failed to fetch tips",
      error: error.message,
    });
  }
});

export default router;
