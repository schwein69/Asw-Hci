import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: [
      "Like",
      "WeatherAlert",
      "System",
      "TripReminder",
      "trafficAlert",
      "weather",
      "social",
      "location",
      "tourist",
      "transport",
    ],
    required: true,
  },

  city: {
    type: String,
    default: null,
  },

  message: {
    type: String,
    required: true,
  },

  icon: {
    type: String,
    default: "Bell",
  },

  // Link interno (es. "/trip/123" )
  referenceLink: {
    type: String,
    default: null,
  },

  // Weather-specific data
  weatherData: {
    condition: String,
    temperature: Number,
    weatherCode: Number,
    windSpeed: Number,
    alert: Boolean,
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
