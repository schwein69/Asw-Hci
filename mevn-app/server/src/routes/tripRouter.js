import express from "express";
import {
  getUserTrips,
  getUpcomingTrips,
  getActiveTrips,
  getCompletedTripsAuth,
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

// Mark trip as completed
router.put("/:tripId/complete", markTripCompleted);

// Delete trip
router.delete("/:tripId", deleteTrip);

export default router;
