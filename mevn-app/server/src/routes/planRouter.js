import express from "express";
import * as planController from "../controllers/planController.js";
const router = express.Router();

router.post("/estimate", planController.getTravelItineraryEstimation);
router.post("/compare", planController.compareTravelOptions);
router.post("/save", planController.saveTrip);
router.put("/:tripId", planController.updateTrip);
export default router;
