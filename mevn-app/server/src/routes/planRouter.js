import express from "express";
import * as planController from "../controllers/planController.js";
const router = express.Router();

router.post("/estimate", planController.getTravelItineraryEstimation);
router.post("/compare", planController.compareTravelOptions);
export default router;
