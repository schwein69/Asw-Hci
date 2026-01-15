import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ["Like", "WeatherAlert", "System", "TripReminder", "trafficAlert"],
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  // Link interno (es. "/trip/123" )
  referenceLink: {
    type: String,
    default: null,
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
});

// Indice per velocizzare: "Dammi tutte le notifiche di questo utente, ordinate per data"
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
