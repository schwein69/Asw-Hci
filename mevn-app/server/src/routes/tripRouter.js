import express from "express";
import {
  getUserTrips,
  getUpcomingTrips,
  getActiveTrips,
  getCompletedTripsAuth,
  updateSegment,
  getTripById,
  deleteTrip,
  markTripCompleted,
} from "../controllers/tripController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all trips for a user
router.get("/user/:userId", getUserTrips);

// Get upcoming trips (within 24 hours)
router.get("/upcoming/:userId", getUpcomingTrips);

// Get active/ongoing trips
router.get("/active/:userId", getActiveTrips);

// Get completed trips for current user (auth)
router.get("/completed", authenticate, getCompletedTripsAuth);

// Get single trip by ID
router.get("/:tripId", getTripById);

// ----- Active trips actions -----
// Mark segment as completed
router.put("/:tripId/update", updateSegment);

// Mark trip as completed
router.put("/complete/:tripId", markTripCompleted);

// Delete trip or delete segment
router.delete("/:tripId", deleteTrip);

export default router;
