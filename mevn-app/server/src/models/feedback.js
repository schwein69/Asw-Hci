import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  type: { type: String, enum: ["Bug", "Suggestion", "Usability"] },
  travelCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TravelCard",
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", FeedbackSchema);
