<script>
import {
  Calendar,
  MapPin,
  TrendingUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";
import actualMap from "./maps/actualMap.vue";
import * as turf from "@turf/turf";

export default {
  name: "PastTrips",
  components: {
    Calendar,
    MapPin,
    TrendingUp,
    Trash2,
    ChevronDown,
    ChevronUp,
    X,
    actualMap,
  },
  inject: ["apiBase"],
  data() {
    return {
      language: getLanguage(),
      showMapForTrip: null,
      trips: [],
      isLoadingTrips: false,
      cityCoordsCache: {},
      isGeocoding: false,
      geocodeError: null,
    };
  },
  computed: {
    t() {
      return (key) => translate(key, this.language);
    },
    routeGeoJSON() {
      if (!this.showMapForTrip)
        return { type: "FeatureCollection", features: [] };

      const trip = this.trips.find((t) => t.id === this.showMapForTrip);
      if (
        !trip ||
        !trip.transportMethods ||
        trip.transportMethods.length === 0
      ) {
        return { type: "FeatureCollection", features: [] };
      }

      const features = [];
      trip.transportMethods.forEach((method) => {
        const { fromCity, toCity } = this.parseRoute(method.route);
        const fromCoords =
          method.fromCoords || this.getCityCoordinates(fromCity);
        const toCoords = method.toCoords || this.getCityCoordinates(toCity);

        if (fromCoords && toCoords) {
          const start = turf.point(fromCoords);
          const end = turf.point(toCoords);
          const curvedLine = turf.greatCircle(start, end, { npoints: 50 });
          curvedLine.properties = { completed: "yes" };
          features.push(curvedLine);
        }
      });

      return { type: "FeatureCollection", features };
    },
    markersGeoJSON() {
      if (!this.showMapForTrip)
        return { type: "FeatureCollection", features: [] };

      const trip = this.trips.find((t) => t.id === this.showMapForTrip);
      if (
        !trip ||
        !trip.transportMethods ||
        trip.transportMethods.length === 0
      ) {
        return { type: "FeatureCollection", features: [] };
      }

      const features = [];
      trip.transportMethods.forEach((method, index) => {
        const { fromCity, toCity } = this.parseRoute(method.route);
        const fromCoords =
          method.fromCoords || this.getCityCoordinates(fromCity);
        const toCoords = method.toCoords || this.getCityCoordinates(toCity);

        if (fromCoords) {
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: fromCoords },
            properties: {
              name: fromCity,
              status: "done",
              number: index + 1,
            },
          });
        }

        if (toCoords && index === trip.transportMethods.length - 1) {
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: toCoords },
            properties: {
              name: toCity,
              status: "done",
              number: trip.transportMethods.length + 1,
            },
          });
        }
      });

      return { type: "FeatureCollection", features };
    },
  },
  mounted() {
    window.addEventListener("languageChanged", this.handleLanguageChange);
    this.fetchCompletedTrips();
  },
  beforeUnmount() {
    window.removeEventListener("languageChanged", this.handleLanguageChange);
  },
  methods: {
    formatDate(value) {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    },
    formatTime(value) {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatDuration(hours) {
      if (!Number.isFinite(hours)) return "";
      if (hours < 1) return `${Math.round(hours * 60)} min`;
      return `${Math.round(hours)} h`;
    },
    formatMoney(value) {
      if (!Number.isFinite(value)) return "";
      return `€${Math.round(value)}`;
    },
    async fetchCompletedTrips() {
      this.isLoadingTrips = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${this.apiBase}/trips/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch completed trips");
        }

        const trips = await response.json();
        this.trips = (trips || []).map((trip) => {
          const itinerary = trip.itinerary || [];
          const transportMethods = itinerary.map((segment, index) => {
            const fromName = segment.fromLocation?.name || "";
            const toName = segment.toLocation?.name || "";
            const fromCoords = segment.fromLocation?.coordinates || null;
            const toCoords = segment.toLocation?.coordinates || null;
            return {
              id: `${trip._id}-${index}`,
              route: fromName && toName ? `${fromName} → ${toName}` : "Route",
              fromCoords,
              toCoords,
              provider: segment.transportNumber || "EcoGo",
              code: segment.transportNumber || "",
              departure: this.formatTime(segment.startTime || trip.startTime),
              departureType: segment.gate || segment.departureGate || "",
              arrival: this.formatTime(segment.endTime || trip.endTime),
              arrivalType: segment.arrivalGate || "",
              time: this.formatDuration(
                segment.estimatedDurationMinutes
                  ? segment.estimatedDurationMinutes / 60
                  : segment.durationHours,
              ),
              co2: `${Math.round(segment.co2 || 0)}kg`,
              cost: this.formatMoney(segment.price || 0),
              type: segment.transportMode || segment.category || "travel",
            };
          });

          return {
            id: trip._id,
            title: trip.title || "Trip",
            date: this.formatDate(trip.startTime || trip.createdAt),
            endDate: this.formatDate(trip.endTime || trip.createdAt),
            segments: itinerary.length,
            emissions: `${Math.round(trip.totalCo2Emission || 0)} kg`,
            cost: this.formatMoney(trip.totalPrice || 0),
            duration: this.formatDuration(trip.totalDurationHours || 0),
            status: "Completed",
            isExpanded: false,
            transportMethods,
          };
        });
      } catch (error) {
        console.error("Failed to fetch completed trips:", error);
      } finally {
        this.isLoadingTrips = false;
      }
    },
    deleteTrip(id) {
      this.trips = this.trips.filter((trip) => trip.id !== id);
      if (this.showMapForTrip === id) {
        this.showMapForTrip = null;
      }
    },
    handleLanguageChange(event) {
      this.language = event.detail.language;
    },
    toggleExpand(trip) {
      trip.isExpanded = !trip.isExpanded;
    },
    parseRoute(route) {
      if (!route) return { fromCity: "", toCity: "" };
      let routeParts = route.split("→");
      if (routeParts.length === 1) {
        routeParts = route.split("->");
      }
      const fromCity = routeParts[0] ? routeParts[0].trim() : "";
      const toCity = routeParts[1] ? routeParts[1].trim() : "";
      return { fromCity, toCity };
    },
    async loadToMap(tripId) {
      this.showMapForTrip = this.showMapForTrip === tripId ? null : tripId;
      if (!this.showMapForTrip) return;
      const trip = this.trips.find((t) => t.id === this.showMapForTrip);
      if (trip) {
        await this.ensureTripCoordinates(trip);
      }
    },
    getCityCoordinates(cityName) {
      if (!cityName) return null;

      cityName = cityName.trim();
      if (!cityName) return null;

      const cityCoords = {
        Paris: [2.3522, 48.8566],
        Berlin: [13.405, 52.52],
        Amsterdam: [4.9041, 52.3676],
        London: [-0.1276, 51.5074],
        Rome: [12.4964, 41.9028],
        Madrid: [-3.7038, 40.4168],
        Vienna: [16.3738, 48.2082],
        Barcelona: [2.1734, 41.3851],
        Prague: [14.4378, 50.0755],
        Warsaw: [21.0122, 52.2297],
        Stockholm: [18.0686, 59.3293],
        Copenhagen: [12.5683, 55.6761],
        Brussels: [4.3517, 50.8503],
        Dublin: [-6.2603, 53.3498],
        Lisbon: [-9.1393, 38.7223],
        Athens: [23.7275, 37.9838],
        Budapest: [19.0402, 47.4979],
        Munich: [11.582, 48.1351],
        Milan: [9.19, 45.4642],
        Zurich: [8.5417, 47.3769],
        Lisboa: [-9.1393, 38.7223],
        Roma: [12.4964, 41.9028],
        Atene: [23.7275, 37.9838],
      };

      if (cityCoords[cityName]) {
        return cityCoords[cityName];
      }

      const cityKey = Object.keys(cityCoords).find(
        (key) => key.toLowerCase() === cityName.toLowerCase(),
      );
      if (cityKey) {
        return cityCoords[cityKey];
      }

      return null;
    },
    async ensureTripCoordinates(trip) {
      if (!trip || !Array.isArray(trip.transportMethods)) return;
      const names = new Set();
      trip.transportMethods.forEach((method) => {
        const { fromCity, toCity } = this.parseRoute(method.route);
        if (fromCity) names.add(fromCity);
        if (toCity) names.add(toCity);
      });

      const missing = Array.from(names).filter(
        (name) => !this.getCityCoordinates(name),
      );
      if (missing.length === 0) return;

      this.isGeocoding = true;
      this.geocodeError = null;
      try {
        await Promise.all(missing.map((name) => this.geocodeCity(name)));
      } catch (error) {
        this.geocodeError = "Failed to geocode some cities.";
        console.error("Geocoding error:", error);
      } finally {
        this.isGeocoding = false;
      }
    },
    async geocodeCity(cityName) {
      if (!cityName) return null;
      if (this.cityCoordsCache[cityName]) {
        return this.cityCoordsCache[cityName];
      }

      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) return null;

      const query = encodeURIComponent(cityName);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?limit=1&types=place&access_token=${token}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox geocoding failed: ${response.status}`);
      }
      const data = await response.json();
      const coords = data?.features?.[0]?.center || null;
      if (coords) {
        this.cityCoordsCache[cityName] = coords;
      }
      return coords;
    },
  },
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 mb-6">
      <Calendar class="w-6 h-6 text-success" />
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ t("pastTrips.title") }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ trips.length }} {{ t("pastTrips.subtitle") }}
        </p>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="trip in trips"
        :key="trip.id"
        class="card bg-white border border-green-100 shadow-md overflow-hidden"
      >
        <div class="card-body">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-gray-800">
                  {{ trip.title }}
                </h3>
                <span class="badge badge-sm badge-neutral">{{
                  trip.status === "Completed"
                    ? t("pastTrips.completed")
                    : trip.status
                }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ trip.date }} to {{ trip.endDate }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="toggleExpand(trip)"
                class="btn btn-ghost btn-sm p-1"
                :title="trip.isExpanded ? 'Hide details' : 'Show details'"
              >
                <ChevronDown
                  v-if="!trip.isExpanded"
                  class="w-5 h-5 text-gray-600"
                />
                <ChevronUp v-else class="w-5 h-5 text-gray-600" />
              </button>
              <button @click="deleteTrip(trip.id)" class="btn btn-ghost btn-sm">
                <Trash2 class="w-4 h-4 text-error" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">
                {{ trip.segments }}
              </div>
              <div class="text-xs text-gray-600">
                {{ t("pastTrips.segments") }}
              </div>
            </div>
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">
                {{ trip.emissions }}
              </div>
              <div class="text-xs text-gray-600">
                {{ t("pastTrips.emissions") }}
              </div>
            </div>
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">{{ trip.cost }}</div>
              <div class="text-xs text-gray-600">{{ t("pastTrips.cost") }}</div>
            </div>
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">
                {{ trip.duration }}
              </div>
              <div class="text-xs text-gray-600">
                {{ t("pastTrips.duration") }}
              </div>
            </div>
          </div>

          <div
            v-if="trip.isExpanded"
            class="mt-4 pt-4 border-t border-gray-200"
          >
            <div v-if="trip.transportMethods.length > 0" class="mt-4">
              <h4
                class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
              >
                <TrendingUp class="w-4 h-4" />
                {{ t("pastTrips.route") }}
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(method, idx) in trip.transportMethods"
                  :key="method.id"
                  class="border border-green-100 rounded-lg p-3 bg-green-50"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="badge badge-sm badge-success">{{
                        idx + 1
                      }}</span>
                      <span class="text-sm font-semibold text-gray-800">{{
                        method.route
                      }}</span>
                      <span class="badge badge-sm badge-outline">{{
                        method.type
                      }}</span>
                    </div>
                  </div>

                  <div class="text-xs text-gray-600 mb-3">
                    <div class="font-medium">{{ method.provider }}</div>
                    <div>{{ method.code }}</div>
                  </div>

                  <div class="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <div class="text-gray-500">
                        {{ t("pastTrips.departure") }}
                      </div>
                      <div class="font-semibold text-gray-800">
                        {{ method.departure }}
                      </div>
                      <div class="text-gray-500">
                        {{ method.departureType }}
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-gray-500">{{ t("pastTrips.time") }}</div>
                      <div class="font-semibold text-gray-800">
                        {{ method.time }}
                      </div>
                    </div>
                    <div>
                      <div class="text-gray-500">
                        {{ t("pastTrips.arrival") }}
                      </div>
                      <div class="font-semibold text-gray-800">
                        {{ method.arrival }}
                      </div>
                      <div class="text-gray-500">{{ method.arrivalType }}</div>
                    </div>
                  </div>

                  <div
                    class="flex items-center justify-between text-xs border-t border-green-200 pt-2"
                  >
                    <div>
                      <span class="text-gray-600">CO₂: </span>
                      <span class="font-semibold text-gray-800">{{
                        method.co2
                      }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Cost: </span>
                      <span class="font-semibold text-gray-800">{{
                        method.cost
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                @click="loadToMap(trip.id)"
                class="btn btn-outline btn-sm w-full mt-4 text-success border-success hover:bg-success hover:text-white"
              >
                <MapPin class="w-4 h-4" />
                {{ showMapForTrip === trip.id ? "Hide Map" : "Load to Map" }}
              </button>

              <div
                v-if="
                  showMapForTrip === trip.id && trip.transportMethods.length > 0
                "
                class="mt-4 border border-green-200 rounded-xl overflow-hidden bg-white"
              >
                <div
                  class="bg-green-50 px-4 py-2 flex items-center justify-between border-b border-green-200"
                >
                  <h4
                    class="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <MapPin class="w-4 h-4 text-green-600" />
                    {{ t("world.interactiveRouteMap") }}
                  </h4>
                  <button
                    @click="showMapForTrip = null"
                    class="btn btn-ghost btn-xs p-1"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div class="h-96 w-full">
                  <actualMap
                    :routeGeoJson="routeGeoJSON"
                    :markersGeoJson="markersGeoJSON"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
