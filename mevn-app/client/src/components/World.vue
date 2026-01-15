<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  CheckCircle2,
  Train,
  Trash2,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Plane,
  Car,
  Bike,
  Bus,
  Armchair,
  DoorOpen,
  Hash,
  Check,
  AlertCircle,
  Edit,
} from "lucide-vue-next";
import actualMap from "./maps/actualMap.vue";
import * as turf from "@turf/turf";
import { getLanguage, t as translate } from "../utils/translations.js";
import { useRouter } from "vue-router";
import { useTripStore } from "../data/tripStore.js";

const router = useRouter();
const tripStore = useTripStore();
// --- TRANSLATION STATE & LOGIC ---
const language = ref(getLanguage());

// Computed function to allow reactivity when language changes
const t = computed(() => (key) => translate(key, language.value));

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

// --- DATA ---
const trips = ref([
  {
    id: 101,
    name: "Grand European Tour",
    routes: [
      {
        id: 1,
        from: "Paris",
        to: "Amsterdam",
        type: "Train",
        transportName: "TGV",
        transportCode: "TG9452",
        depTime: "10:30 AM",
        arrTime: "01:45 PM",
        duration: "3h 15m",
        distance: 430,
        co2: 14,
        cost: 95,
        startCoords: [2.3522, 48.8566],
        endCoords: [4.9041, 52.3676],
        completed: true,
        seat: "42A",
        gate: null,
        class: "1st",
      },
      {
        id: 2,
        from: "Amsterdam",
        to: "Berlin",
        type: "Car",
        transportName: "Rental",
        transportCode: "Tesla M3",
        depTime: "03:00 PM",
        arrTime: "09:30 PM",
        duration: "6h 30m",
        distance: 655,
        co2: 45,
        cost: 120,
        startCoords: [4.9041, 52.3676],
        endCoords: [13.405, 52.52],
        completed: false,
        seat: "Driver",
        gate: null,
        class: "Standard",
      },
    ],
  },
  {
    id: 102,
    name: "Eastern Connection",
    routes: [
      {
        id: 3,
        from: "Berlin",
        to: "Prague",
        type: "Bus",
        transportName: "FlixBus",
        transportCode: "FLX100",
        depTime: "10:00 AM",
        arrTime: "02:30 PM",
        duration: "4h 30m",
        distance: 350,
        co2: 12,
        cost: 35,
        startCoords: [13.405, 52.52],
        endCoords: [14.4378, 50.0755],
        completed: false,
        seat: "12",
        gate: null,
        class: "Eco",
      },
      {
        id: 4,
        from: "Prague",
        to: "Vienna",
        type: "Train",
        transportName: "Railjet",
        transportCode: "RJ79",
        depTime: "03:30 PM",
        arrTime: "07:30 PM",
        duration: "4h 00m",
        distance: 330,
        co2: 16,
        cost: 75,
        startCoords: [14.4378, 50.0755],
        endCoords: [16.3738, 48.2082],
        completed: false,
        seat: "22F",
        gate: null,
        class: "Business",
      },
    ],
  },
  {
    id: 103,
    name: "Italian Summer",
    routes: [
      {
        id: 7,
        from: "Venice",
        to: "Ferrara",
        type: "Bicycle",
        transportName: "My Bike",
        transportCode: "BIKE01",
        depTime: "08:00 AM",
        arrTime: "01:15 PM",
        duration: "5h 15m",
        distance: 110,
        co2: 0,
        cost: 0,
        startCoords: [12.3155, 45.4408],
        endCoords: [11.6198, 44.8381],
        completed: false,
        seat: null,
        gate: null,
        class: "Sport",
      },
      {
        id: 8,
        from: "Ferrara",
        to: "Rome",
        type: "Train",
        transportName: "Italo",
        transportCode: "IT892",
        depTime: "02:00 PM",
        arrTime: "05:35 PM",
        duration: "3h 35m",
        distance: 380,
        co2: 15,
        cost: 60,
        startCoords: [11.6198, 44.8381],
        endCoords: [12.4964, 41.9028],
        completed: false,
        seat: "12A",
        gate: null,
        class: "Prima",
      },
    ],
  },
]);

// --- HELPER FUNCTIONS ---

const getTripStats = (trip) => {
  return {
    totalDestinations: trip.routes.length + 1, // Start + End points
    carbonFootprint: trip.routes.reduce((acc, curr) => acc + curr.co2, 0),
    totalCost: trip.routes.reduce((acc, curr) => acc + curr.cost, 0),
    totalDistance: trip.routes.reduce(
      (acc, curr) => acc + (curr.distance || 0),
      0
    ),
  };
};

const isTripComplete = (trip) => {
  if (!trip.routes || trip.routes.length === 0) return false;
  return trip.routes.every((r) => r.completed);
};

const translateTransportType = (type) => {
  const typeMap = {
    Train: t.value("world.transportTypes.train"),
    Airplane: t.value("world.transportTypes.airplane"),
    Car: t.value("world.transportTypes.car"),
    Bus: "Bus",
    Bicycle: "Bici",
  };
  return typeMap[type] || type;
};

// --- MAP & GEOJSON COMPUTED ---

const routeGeoJSON = computed(() => {
  const features = [];
  trips.value.forEach((trip) => {
    trip.routes.forEach((seg) => {
      const start = turf.point(seg.startCoords);
      const end = turf.point(seg.endCoords);
      const curvedLine = turf.greatCircle(start, end, { npoints: 50 });
      curvedLine.properties = { completed: seg.completed ? "yes" : "no" };
      features.push(curvedLine);
    });
  });
  return { type: "FeatureCollection", features };
});

const markersGeoJSON = computed(() => {
  const features = [];
  trips.value.forEach((trip) => {
    if (trip.routes.length === 0) return;

    // Start Node of the trip
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: trip.routes[0].startCoords,
      },
      properties: {
        name: trip.routes[0].from,
        status: trip.routes[0].completed ? "done" : "pending",
      },
    });

    // End Nodes of all segments
    trip.routes.forEach((seg) => {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: seg.endCoords },
        properties: {
          name: seg.to,
          status: seg.completed ? "done" : "pending",
        },
      });
    });
  });
  return { type: "FeatureCollection", features };
});

const is3D = ref(false);
const mapRef = ref(null);

function toggle3D() {
  is3D.value = !is3D.value;
  if (mapRef.value) {
    mapRef.value.toggle3D(is3D.value);
  }
}

// --- ACTIONS ---

function removeRoute(tripId, routeId) {
  const trip = trips.value.find((t) => t.id === tripId);
  if (trip) {
    trip.routes = trip.routes.filter((s) => s.id !== routeId);
  }
}

function toggleComplete(tripId, routeId) {
  const trip = trips.value.find((t) => t.id === tripId);
  if (trip) {
    const seg = trip.routes.find((s) => s.id === routeId);
    if (seg) seg.completed = !seg.completed;
  }
}

function completeTrip(tripId) {
  const trip = trips.value.find((t) => t.id === tripId);
  if (!trip) return;
  if (!isTripComplete(trip)) return;
  if (
    confirm(`Are you sure you want to complete and archive "${trip.name}"?`)
  ) {
    trips.value = trips.value.filter((t) => t.id !== tripId);
  }
}

function modifyTrip(tripId) {
  const tripToPass = trips.value.find((t) => t.id === tripId);
  if (tripToPass) {
    tripStore.setTripToEdit(tripToPass);
    router.push({ name: "Plan" });
  }
}

// --- LIFECYCLE ---
onMounted(() => {
  language.value = getLanguage();
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<template>
  <div class="space-y-12">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2
          class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"
        >
          <Clock class="w-6 h-6 text-green-600" />
          {{ t("world.title") }}
        </h2>
        <p class="text-gray-500 dark:text-gray-300 text-sm">
          {{ t("world.description") }}
        </p>
      </div>
    </div>

    <div
      v-for="trip in trips"
      :key="trip.id"
      class="border-b-4 border-gray-100 pb-8 last:border-0"
    >
      <div class="mb-4 px-1">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ trip.name }}
        </h3>
        <div class="text-xs text-gray-400 font-mono">ID: #{{ trip.id }}</div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
        >
          <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {{ t("world.totalDestinations") }}
          </div>
          <div class="text-4xl font-extrabold text-gray-800 mt-2">
            {{ getTripStats(trip).totalDestinations }}
          </div>
        </div>

        <div
          class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
        >
          <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Total Km
          </div>
          <div class="text-4xl font-extrabold text-blue-600 mt-2">
            {{ getTripStats(trip).totalDistance }}
          </div>
        </div>

        <div
          class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
        >
          <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {{ t("world.carbonFootprint") }}
          </div>
          <div
            class="text-4xl font-extrabold text-green-600 mt-2 flex justify-center items-center gap-1"
          >
            {{ getTripStats(trip).carbonFootprint }}
            <span class="text-lg text-gray-500 font-normal">kg</span>
          </div>
        </div>
        <div
          class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
        >
          <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {{ t("world.totalCost") }}
          </div>
          <div
            class="text-4xl font-extrabold text-gray-800 mt-2 flex justify-center items-center"
          >
            €{{ getTripStats(trip).totalCost }}
          </div>
        </div>
      </div>

      <div
        class="space-y-3 border border-green-500 rounded-2xl p-4 bg-green-50/30"
      >
        <h3 class="text-lg font-bold text-green-800 dark:text-white">
          {{ t("world.journeySegments") }}
        </h3>

        <div
          class="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar p-1"
        >
          <div
            v-for="(segment, index) in trip.routes"
            :key="segment.id"
            class="card bg-white border shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            :class="
              segment.completed
                ? 'border-gray-200 opacity-60 grayscale-[0.5]'
                : 'border-green-500 ring-1 ring-green-100'
            "
          >
            <div
              class="p-3 flex justify-between items-center border-b"
              :class="
                segment.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-green-50/50 border-green-100'
              "
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors"
                  :class="
                    segment.completed
                      ? 'bg-gray-400 text-white'
                      : 'bg-green-600 text-white'
                  "
                >
                  {{ index + 1 }}
                </div>
                <div
                  class="text-base font-bold"
                  :class="
                    segment.completed
                      ? 'text-gray-500 line-through decoration-gray-400'
                      : 'text-gray-800'
                  "
                >
                  {{ segment.from }}
                  <span
                    :class="
                      segment.completed ? 'text-gray-400' : 'text-green-400'
                    "
                    class="mx-1"
                    >➜</span
                  >
                  {{ segment.to }}
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="toggleComplete(trip.id, segment.id)"
                  class="btn btn-sm btn-ghost btn-circle transition-all duration-200"
                  :class="
                    segment.completed
                      ? 'text-green-600 bg-green-100'
                      : 'text-gray-300 hover:text-green-600 hover:bg-green-50'
                  "
                  :title="
                    segment.completed
                      ? t('world.markIncomplete')
                      : t('world.markComplete')
                  "
                >
                  <Check class="w-5 h-5" />
                </button>

                <button
                  @click="removeRoute(trip.id, segment.id)"
                  class="btn btn-sm btn-ghost btn-circle text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  :title="t('world.deleteSegment')"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="p-4">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="p-3 rounded-xl transition-colors"
                    :class="
                      segment.completed
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-100 text-green-700'
                    "
                  >
                    <Train v-if="segment.type === 'Train'" class="w-5 h-5" />
                    <Plane
                      v-else-if="segment.type === 'Airplane'"
                      class="w-5 h-5"
                    />
                    <Car v-else-if="segment.type === 'Car'" class="w-5 h-5" />
                    <Bike
                      v-else-if="segment.type === 'Bicycle'"
                      class="w-5 h-5"
                    />
                    <Bus v-else-if="segment.type === 'Bus'" class="w-5 h-5" />
                    <Car v-else class="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      class="font-bold text-sm"
                      :class="
                        segment.completed ? 'text-gray-500' : 'text-gray-800'
                      "
                    >
                      {{ segment.transportName }}
                    </div>
                    <div
                      class="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                      :class="
                        segment.completed ? 'text-gray-400' : 'text-green-600'
                      "
                    >
                      <Hash class="w-3 h-3" /> {{ segment.transportCode }}
                    </div>
                  </div>
                </div>
                <div
                  class="badge border-none font-bold px-3 py-3 rounded-lg text-xs transition-colors"
                  :class="
                    segment.completed
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-50 text-green-700'
                  "
                >
                  {{ translateTransportType(segment.type).toUpperCase() }}
                </div>
              </div>

              <div
                class="grid grid-cols-3 gap-2 mb-4 p-2 rounded-xl border transition-colors"
                :class="
                  segment.completed
                    ? 'bg-gray-50 border-gray-100'
                    : 'bg-green-50/30 border-green-100'
                "
              >
                <div v-if="segment.gate">
                  <div
                    class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                  >
                    <DoorOpen class="w-3 h-3" /> {{ t("world.gate") }}
                  </div>
                  <div class="text-xs font-semibold text-gray-700">
                    {{ segment.gate }}
                  </div>
                </div>
                <div v-if="segment.seat">
                  <div
                    class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                  >
                    <Armchair class="w-3 h-3" /> {{ t("world.seat") }}
                  </div>
                  <div class="text-xs font-semibold text-gray-700">
                    {{ segment.seat }}
                  </div>
                </div>
                <div v-if="segment.class">
                  <div class="text-[9px] text-gray-400 font-bold uppercase">
                    {{ t("world.class") }}
                  </div>
                  <div class="text-xs font-semibold text-gray-700">
                    {{ segment.class }}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div
                  class="rounded-xl p-3 border transition-colors"
                  :class="
                    segment.completed
                      ? 'bg-gray-50 border-gray-100'
                      : 'bg-white border-green-100'
                  "
                >
                  <div
                    class="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 mb-1"
                  >
                    <Clock class="w-3 h-3" /> {{ t("world.departure") }}
                  </div>
                  <div
                    class="text-lg font-bold"
                    :class="
                      segment.completed ? 'text-gray-500' : 'text-gray-800'
                    "
                  >
                    {{ segment.depTime }}
                  </div>
                </div>
                <div
                  class="rounded-xl p-3 border transition-colors"
                  :class="
                    segment.completed
                      ? 'bg-gray-50 border-gray-100'
                      : 'bg-white border-green-100'
                  "
                >
                  <div
                    class="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 mb-1"
                  >
                    <MapPin class="w-3 h-3" /> {{ t("world.arrival") }}
                  </div>
                  <div
                    class="text-lg font-bold"
                    :class="
                      segment.completed ? 'text-gray-500' : 'text-gray-800'
                    "
                  >
                    {{ segment.arrTime }}
                  </div>
                </div>
              </div>

              <div
                class="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-3"
              >
                <div class="text-center">
                  <div class="text-[10px] text-gray-400 font-bold uppercase">
                    {{ t("world.duration") }}
                  </div>
                  <div class="font-bold text-gray-700">
                    {{ segment.duration }}
                  </div>
                </div>

                <div class="text-center">
                  <div class="text-[10px] text-gray-400 font-bold uppercase">
                    Distance
                  </div>
                  <div class="font-bold text-blue-600">
                    {{ segment.distance }} km
                  </div>
                </div>

                <div class="text-center">
                  <div class="text-[10px] text-gray-400 font-bold uppercase">
                    {{ t("world.carbonFootprint") }}
                  </div>
                  <div
                    class="font-bold"
                    :class="
                      segment.completed ? 'text-gray-500' : 'text-green-600'
                    "
                  >
                    {{ segment.co2 }} kg
                  </div>
                </div>

                <div class="text-center">
                  <div class="text-[10px] text-gray-400 font-bold uppercase">
                    {{ t("world.cost") }}
                  </div>
                  <div class="font-bold text-gray-800">€{{ segment.cost }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-green-200 mt-2"
        >
          <div class="flex-1">
            <div
              v-if="!isTripComplete(trip)"
              class="text-xs text-orange-500 font-medium flex items-center gap-1 animate-pulse"
            >
              <AlertCircle class="w-3 h-3" />
              {{ t("world.finishSegments") }}
            </div>
            <div
              v-else
              class="text-xs text-green-600 font-medium flex items-center gap-1"
            >
              <CheckCircle2 class="w-3 h-3" />
              {{ t("world.allSegmentsDone") }}
            </div>
          </div>

          <div class="flex gap-3 w-full md:w-auto">
            <button
              @click="modifyTrip(trip.id)"
              class="btn btn-outline btn-success gap-2 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              <Edit class="w-4 h-4" /> {{ t("world.modifyTrip") }}
            </button>

            <button
              @click="completeTrip(trip.id)"
              :disabled="!isTripComplete(trip)"
              class="btn text-white gap-2 rounded-xl shadow-md font-bold transition-all duration-300"
              :class="
                isTripComplete(trip)
                  ? 'btn-success hover:scale-105'
                  : 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
              "
            >
              <CheckCircle2 class="w-5 h-5" /> {{ t("world.completed") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="card bg-white border border-green-100 shadow-sm rounded-2xl overflow-hidden"
    >
      <div
        class="p-4 border-b border-green-100 flex justify-between items-center bg-white z-10 relative"
      >
        <div>
          <h3 class="text-lg font-bold text-green-800 flex items-center gap-2">
            <MapPin class="w-5 h-5" /> {{ t("world.interactiveRouteMap") }}
          </h3>
          <p class="text-gray-500 text-xs">
            {{ t("world.visualizeJourney") }}
          </p>
        </div>
        <button
          @click="toggle3D"
          class="btn btn-xs sm:btn-sm btn-outline btn-success gap-2 font-bold rounded-full"
        >
          <component :is="is3D ? Minimize2 : Maximize2" class="w-4 h-4" />
          {{ is3D ? "2D" : "3D" }} {{ t("world.view") }}
        </button>
      </div>

      <div class="h-[500px] relative w-full">
        <actualMap
          ref="mapRef"
          :route-geo-json="routeGeoJSON"
          :markers-geo-json="markersGeoJSON"
        />

        <div
          class="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none"
        >
          <button
            class="btn btn-xs bg-white/90 backdrop-blur text-gray-600 shadow-md border-none pointer-events-auto"
          >
            {{ t("world.reset") }}
          </button>
        </div>
      </div>

      <div
        class="p-3 bg-green-50 text-[10px] text-green-700 flex justify-between items-center font-medium"
      >
        <div class="flex gap-4">
          <span class="flex items-center gap-1"
            ><MousePointerClick class="w-3 h-3" />
            {{ t("world.useControlsToNavigate") }}</span
          >
          <span class="flex items-center gap-1"
            ><Maximize2 class="w-3 h-3" /> {{ is3D ? "3D" : "2D" }}
            {{ t("world.view") }} {{ t("world.active") }}</span
          >
        </div>
        <span>{{ trips.length }} </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
</style>
