import express from "express";
import tipsRoutes from "./tipsRouter.js";
import planRoutes from "./planRouter.js";
const router = express.Router();

// Combine all route modules
router.use("/tips", tipsRoutes);
router.use("/plan", planRoutes);

export default router;
