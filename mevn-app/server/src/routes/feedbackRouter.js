import express from "express";
import {
  createFeedback,
  getCommunityFeedback,
  upvoteFeedback,
  updateFeedbackStatus,
  getReportedUserFeedback,
} from "../controllers/feedbackController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create new feedback
router.post("/", createFeedback);

// Get all community feedback
router.get("/", getCommunityFeedback);

// Upvote/un-upvote feedback
router.post("/:feedbackId/upvote", upvoteFeedback);

// Update feedback status (Admin)
router.put("/:feedbackId/status", updateFeedbackStatus);

// Get reported user feedback (Admin General)
router.get(
  "/admin/reports",
  authenticate,
  authorize("AdminGeneral"),
  getReportedUserFeedback
);

export default router;
