import express from "express";
import * as tipsController from "../controllers/tipsController.js";
const router = express.Router();

router.get("/daily", tipsController.getDailyTips);
router.get("/knowledge", tipsController.getDailyTips);
export default router;
