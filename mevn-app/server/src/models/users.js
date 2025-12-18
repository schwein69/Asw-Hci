import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Standard", "ForumAdmin", "GeneralAdmin"],
    default: "Standard",
  },
  ecoLevel: { type: Number, default: 1 },
  ecoPoints: { type: Number, default: 0 },
  travelCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "TravelCard" }],
  feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
