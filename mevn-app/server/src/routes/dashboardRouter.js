import express from "express";
import {
  getDashboardSummary,
  getMonthlyEmissions,
  getTransportModes,
  getTripEfficiency,
  getEnvironmentalImpact,
} from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummary);
router.get("/emissions", authenticate, getMonthlyEmissions);
router.get("/transport-modes", authenticate, getTransportModes);
router.get("/trip-efficiency", authenticate, getTripEfficiency);
router.get("/impact", authenticate, getEnvironmentalImpact);

export default router;
