const express = require("express");
const router = express.Router();

// Simple placeholder routes for travelcards — replace handlers with real controllers

router.get("/", (req, res) => {
  res.send("Travelcards route working ✅");
});
router.get("/travelcards", (req, res) => {
  res.json({ message: "List movies (placeholder)" });
});

router.get("/travelcards/:id", (req, res) => {
  res.json({ message: `Get movie ${req.params.id} (placeholder)` });
});

router.post("/travelcards", (req, res) => {
  res
    .status(201)
    .json({ message: "Create movie (placeholder)", body: req.body });
});

router.put("/travelcards/:id", (req, res) => {
  res.json({
    message: `Update movie ${req.params.id} (placeholder)`,
    body: req.body,
  });
});

router.delete("/travelcards/:id", (req, res) => {
  res.json({ message: `Delete movie ${req.params.id} (placeholder)` });
});

module.exports = router;
