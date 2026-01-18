import express from "express";
import {
  createFeedback,
  getCommunityFeedback,
  upvoteFeedback,
  updateFeedbackStatus,
} from "../controllers/feedbackController.js";

const router = express.Router();

// Create new feedback
router.post("/", createFeedback);

// Get all community feedback
router.get("/", getCommunityFeedback);

// Upvote/un-upvote feedback
router.post("/:feedbackId/upvote", upvoteFeedback);

// Update feedback status (Admin)
router.put("/:feedbackId/status", updateFeedbackStatus);

export default router;
