import mongoose from "mongoose";

const WeatherCacheSchema = new mongoose.Schema({
  // Identificativo tecnico univoco per la cache
  // Può essere le coordinate ("41.90_12.49")
  locationKey: {
    type: String,
    required: true,
    unique: true,
  },

  // Nome leggibile del luogo (es. "Roma", "Milano", "New York")
  locationName: {
    type: String,
    required: true,
    trim: true,
  },

  // Coordinate salvate per riferimento
  coordinates: {
    lat: Number,
    lon: Number,
  },

  // L'intero oggetto JSON ricevuto dall'API meteo
  weatherData: {
    type: Object,
    required: true,
  },

  // Data di scadenza esatta
  expireAt: {
    type: Date,
    required: true,
  },
});

// 1. TTL: Cancella quando scade
WeatherCacheSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// 2. Ricerca veloce: Se vuoi cercare "Che meteo ho in cache per Roma?"
WeatherCacheSchema.index({ locationName: 1 });

export default mongoose.model("WeatherCache", WeatherCacheSchema);
