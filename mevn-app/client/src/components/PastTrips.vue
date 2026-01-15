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
  data() {
    return {
      language: getLanguage(),
      showMapForTrip: null,
      trips: [
        {
          id: 1,
          title: "European Summer Adventure",
          date: "2024-08-15",
          endDate: "2024-08-25",
          segments: 2,
          emissions: "125 kg",
          cost: "€1850",
          duration: "2 days",
          status: "Completed",
          isExpanded: false,
          transportMethods: [
            {
              id: 1,
              route: "Paris → Berlin",
              provider: "TGV",
              code: "TG456",
              departure: "08:30 AM",
              departureType: "Platform 12",
              arrival: "02:15 PM",
              arrivalType: "Platform 8",
              time: "5h 45m",
              co2: "18kg",
              cost: "€120",
              type: "train",
            },
            {
              id: 2,
              route: "Berlin → Amsterdam",
              provider: "FlixBus",
              code: "BUS234",
              departure: "09:00 AM",
              departureType: "Bay 5",
              arrival: "04:30 PM",
              arrivalType: "Bay 12",
              time: "7h 30m",
              co2: "22kg",
              cost: "€45",
              type: "bus",
            },
          ],
        },
        {
          id: 2,
          title: "Asian Discovery Tour",
          date: "2024-07-01",
          endDate: "2024-07-15",
          segments: 3,
          emissions: "240 kg",
          cost: "€2450",
          duration: "3 days",
          status: "Completed",
          isExpanded: false,
          transportMethods: [
            {
              id: 3,
              route: "London → Rome",
              provider: "British Airways",
              code: "BA456",
              departure: "10:00 AM",
              departureType: "Terminal 5, Gate 12",
              arrival: "01:30 PM",
              arrivalType: "Terminal 3, Gate 8",
              time: "3h 30m",
              co2: "180kg",
              cost: "€450",
              type: "airplane",
            },
            {
              id: 4,
              route: "Rome → Athens",
              provider: "Alitalia",
              code: "AZ789",
              departure: "08:00 AM",
              departureType: "Terminal 1, Gate 5",
              arrival: "11:15 AM",
              arrivalType: "Terminal 2, Gate 3",
              time: "3h 15m",
              co2: "45kg",
              cost: "€280",
              type: "airplane",
            },
            {
              id: 5,
              route: "Athens → Barcelona",
              provider: "Aegean Airlines",
              code: "A3 234",
              departure: "02:00 PM",
              departureType: "Terminal 1, Gate 10",
              arrival: "04:45 PM",
              arrivalType: "Terminal 1, Gate 7",
              time: "2h 45m",
              co2: "15kg",
              cost: "€320",
              type: "airplane",
            },
          ],
        },
        {
          id: 3,
          title: "Caribbean Escape",
          date: "2024-06-10",
          endDate: "2024-06-20",
          segments: 2,
          emissions: "180 kg",
          cost: "€1650",
          duration: "2 days",
          status: "Completed",
          isExpanded: false,
          transportMethods: [
            {
              id: 6,
              route: "Madrid → Lisbon",
              provider: "Renfe",
              code: "REN123",
              departure: "09:00 AM",
              departureType: "Platform 3",
              arrival: "02:30 PM",
              arrivalType: "Platform 1",
              time: "5h 30m",
              co2: "25kg",
              cost: "€85",
              type: "train",
            },
            {
              id: 7,
              route: "Lisbon → Barcelona",
              provider: "TAP Air Portugal",
              code: "TP567",
              departure: "11:00 AM",
              departureType: "Terminal 2, Gate 15",
              arrival: "01:20 PM",
              arrivalType: "Terminal 1, Gate 12",
              time: "2h 20m",
              co2: "155kg",
              cost: "€450",
              type: "airplane",
            },
          ],
        },
      ],
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
        let routeParts = method.route.split("→");
        if (routeParts.length === 1) {
          routeParts = method.route.split("->");
        }
        const fromCity = routeParts[0] ? routeParts[0].trim() : "";
        const toCity = routeParts[1] ? routeParts[1].trim() : "";
        const fromCoords = this.getCityCoordinates(fromCity);
        const toCoords = this.getCityCoordinates(toCity);

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
        let routeParts = method.route.split("→");
        if (routeParts.length === 1) {
          routeParts = method.route.split("->");
        }
        const fromCity = routeParts[0] ? routeParts[0].trim() : "";
        const toCity = routeParts[1] ? routeParts[1].trim() : "";
        const fromCoords = this.getCityCoordinates(fromCity);
        const toCoords = this.getCityCoordinates(toCity);

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
  },
  beforeUnmount() {
    window.removeEventListener("languageChanged", this.handleLanguageChange);
  },
  methods: {
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
    loadToMap(tripId) {
      this.showMapForTrip = this.showMapForTrip === tripId ? null : tripId;
    },
    getCityCoordinates(cityName) {
      if (!cityName) return null;

      cityName = cityName.trim();

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
        (key) => key.toLowerCase() === cityName.toLowerCase()
      );
      if (cityKey) {
        return cityCoords[cityKey];
      }

      return null;
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
