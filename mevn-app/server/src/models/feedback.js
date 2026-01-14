import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Bug", "Suggestion", "Other", "Content Report"],
    required: true,
  },

  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
  },

  // Opzionale: Se il feedback riguarda una specifica TravelCard Content Report
  travelCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TravelCard",
    default: null,
  },

  status: {
    type: String,
    enum: ["Open", "In Progress", "Closed"],
    default: "Open",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", FeedbackSchema);
