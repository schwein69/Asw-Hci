import express from "express";
import tipsRoutes from "./tipsRouter.js";
import planRoutes from "./planRouter.js";
import userRoutes from "./userRouter.js";

const router = express.Router();

router.use("/tips", tipsRoutes);
router.use("/plan", planRoutes);
router.use("/users", userRoutes);

export default router;
