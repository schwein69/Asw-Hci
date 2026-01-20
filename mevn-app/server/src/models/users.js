import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Standard", "AdminGeneral", "AdminForum"],
    default: "Standard",
  },

  profileImage: { type: String },

  // --- APP PREFERENCES  ---
  preferences: {
    language: {
      type: String,
      enum: ["en", "it"],
      default: "en",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },

  // --- GAMIFICATION & ECO STATS ---
  ecoLevel: { type: Number, default: 1 },
  ecoPoints: { type: Number, default: 0 },
  totalCo2Saved: { type: Number, default: 0 },
  badges: [{ type: String }],

  // Streak tracking
  currentStreak: { type: Number, default: 0 }, // Consecutive days of eco-friendly trips
  longestStreak: { type: Number, default: 0 },
  lastTripDate: { type: Date }, // To calculate streak continuity

  // --- RELATIONS ---
  travelCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "TravelCard" }],
  feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
  savedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
  savedDiscoveries: [
    { type: mongoose.Schema.Types.ObjectId, ref: "TravelCard" },
  ],

  // --- AUTH SYSTEM ---
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
