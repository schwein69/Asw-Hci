import express from "express";
import {
  getUserTrips,
  getUpcomingTrips,
  getActiveTrips,
  getCompletedTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  markTripCompleted,
} from "../controllers/tripController.js";

const router = express.Router();

// Get all trips for a user
router.get("/user/:userId", getUserTrips);

// Get upcoming trips (within 24 hours)
router.get("/upcoming/:userId", getUpcomingTrips);

// Get active/ongoing trips
router.get("/active/:userId", getActiveTrips);

// Get completed trips
router.get("/completed/:userId", getCompletedTrips);

// Get single trip by ID
router.get("/:tripId", getTripById);

// Create new trip
router.post("/", createTrip);

// Update trip
router.put("/:tripId", updateTrip);

// Mark trip as completed
router.put("/:tripId/complete", markTripCompleted);

// Delete trip
router.delete("/:tripId", deleteTrip);

export default router;
