import express from "express";
import tipsRoutes from "./tipsRouter.js";
import userRoutes from "./userRouter.js";
const router = express.Router();

// Combine all route modules
router.use("/tips", tipsRoutes);
router.use("/users", userRoutes);

export default router;
