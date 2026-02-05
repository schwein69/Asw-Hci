import mongoose from "mongoose";

// Sotto-schema per i singoli segmenti
const ItinerarySegmentSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Transport", "Accommodation", "Restaurant"],
    required: true,
  },

  transportMode: {
    type: String,
    enum: ["walk", "bike", "bus", "airplane", "car", "train", null],
    default: null,
  },

  fuelType: {
    type: String,
    enum: ["diesel", "gasoline", "electric", null],
    default: null,
  },

  isCompleted: { type: Boolean, default: false },

  distanceKm: { type: Number, default: 0 },
  estimatedDurationMinutes: { type: Number, default: 0 },

  // Dettagli specifici (opzionali)
  transportNumber: { type: String, trim: true },
  gate: { type: String, trim: true },
  arrivalGate: { type: String, trim: true },
  seatNumber: { type: String, trim: true },
  class: { type: String, trim: true },

  // LUOGHI
  fromLocation: {
    name: { type: String, required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
    },
    address: { type: String },
  },

  toLocation: {
    name: { type: String, required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
    },
    address: { type: String },
  },

  startTime: { type: Date },
  endTime: { type: Date },

  price: { type: Number, default: 0 },
  co2: { type: Number, default: 0 },
});

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  // STATO
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },

  // TOTALI VIAGGIO
  totalDurationHours: { type: Number, default: 0 },
  totalDistanceKm: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  totalCo2Emission: { type: Number, default: 0 },

  transportModeBreakdown: {
    type: Map,
    of: Number,
    default: {},
  }, // Esempio: { "plane": 1500, "train": 300, "walk": 5 }, serve per calcolare i charts

  fuelTypeBreakdown: {
    type: Map,
    of: Number,
    default: {
      diesel: 0,
      gasoline: 0,
      electric: 0,
    },
  },
  // TIMING DEL VIAGGIO
  startTime: { type: Date }, // Start time of the entire trip
  endTime: { type: Date }, // End time of the entire trip

  // L'ITINERARIO
  // L'ordine nell'array determina la sequenza del viaggio
  itinerary: [ItinerarySegmentSchema],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Trip", TripSchema);
