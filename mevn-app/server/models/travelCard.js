import mongoose from "mongoose";

const TravelCardSchema = new mongoose.Schema({
  title: String,
  description: String,
  sustainabilityScore: Number,
  itinerary: {
    type: [
      {
        country: { type: String, required: true },
        city: { type: String, required: true },
        type: {
          type: String,
          enum: ["restaurant", "tourism spot", "transport"],
          required: true,
        },
        price: { type: Number, required: false },
      },
    ],
    required: true,
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: Number,
  dislikes: Number,
  status: {
    type: String,
    enum: ["Approved", "Suspecious", "Rejected"],
    default: "Aproved",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TravelCard", TravelCardSchema);
