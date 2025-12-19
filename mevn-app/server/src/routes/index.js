import express from "express";
import tipsRoutes from "./tipsRouter.js";
const router = express.Router();

// Combine all route modules
router.use("/tips", tipsRoutes);

export default router;
