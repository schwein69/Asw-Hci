import express from "express";
import * as tipsController from "../controllers/tipsController.js";
const router = express.Router();

router.get("/", tipsController.getDailyTips);

export default router;
