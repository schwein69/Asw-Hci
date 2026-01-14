import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // Profilo Utente
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

  // Gamification & Statistiche Eco
  ecoLevel: { type: Number, default: 1 },
  ecoPoints: { type: Number, default: 0 },
  totalCo2Saved: { type: Number, default: 0 }, // In base al calcolo dei viaggi pianificati rispetto a viaggi medi in auto/aereo
  badges: [{ type: String }], // Array di badge ottenuti

  // Relazioni
  travelCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "TravelCard" }], // I post creati dall'utente
  feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }], // I feedback inviati
  savedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }], // Viaggi salvati dall'utente
  savedDiscoveries: [
    { type: mongoose.Schema.Types.ObjectId, ref: "TravelCard" },
  ], // Salvare TravelCard interessanti di altri utenti

  // Auth & System
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
