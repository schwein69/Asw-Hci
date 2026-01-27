import express from "express";
const router = express.Router();
import * as travelCardsController from "../controllers/travelCardsController.js";

// Create a new travel card
router.post("/", travelCardsController.createTravelCard);

// Get all travel cards (randomized feed)
router.get("/discover", travelCardsController.getTravelCards);

// Get user's travel card by ID
router.get("/myTravelCards", travelCardsController.getUserTravelCards);

// Get saved travel cards for a user
router.get("/savedTravelCards", travelCardsController.getSavedTravelCards);

// Update a travel card
router.put("/:cardId", travelCardsController.updateTravelCard);

// Delete a travel card
router.delete("/:cardId", travelCardsController.deleteTravelCard);

// Like a travel card
router.put("/:cardId/like", travelCardsController.toggleLikeCard);

// Report a travel card
router.put("/:cardId/report", travelCardsController.reportTravelCard);

// Save/Unsave a travel card
router.put("/:cardId/save", travelCardsController.toggleSaveCard);

export default router;
