import express from "express";
import tipsRoutes from "./tipsRouter.js";
import planRoutes from "./planRouter.js";
import userRoutes from "./userRouter.js";
import notificationRoutes from "./notificationRouter.js";
import tripRoutes from "./tripRouter.js";

const router = express.Router();

router.use("/tips", tipsRoutes);
router.use("/plan", planRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/trips", tripRoutes);

export default router;
