import mongoose from "mongoose";

const TravelCardSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{ type: String }],

  category: {
    type: String,
    enum: ["Attraction", "Restaurant", "Accommodation", "Activity"],
    default: "Activity",
  },

  // DATI GEOGRAFICI
  // Questo permette di mostrare la card come marker sulla mappa principale
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [Longitudine, Latitudine]
    address: { type: String }, // Indirizzo
  },

  price: {
    type: String,
    enum: ["Free", "$", "$$", "$$$"],
    default: "Free",
  },
  // Array di ID per evitare voti doppi
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  numberOfLikes: {
    type: Number,
    default: 0,
  },

  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  status: {
    type: String,
    enum: ["Pending", "Approved", "Suspicious", "Rejected"],
    default: "Pending",
  },
  reports: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  numberOfReports: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

// Indice Geospaziale per cercare "TravelCard vicine a me"
TravelCardSchema.index({ location: "2dsphere" });

export default mongoose.model("TravelCard", TravelCardSchema);
