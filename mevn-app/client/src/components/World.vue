<script setup>
import { ref, computed } from "vue";
import {
  CheckCircle2, // Changed icon
  Train,
  Trash2,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Plane,
  Car,
  Armchair,
  DoorOpen,
  Hash,
  Building2,
  Check,
} from "lucide-vue-next";
import actualMap from "./maps/actualMap.vue";
import * as turf from "@turf/turf";

const tripSummary = ref({
  totalDestinations: 6,
  carbonFootprint: 229,
  totalCost: 465,
});

const journeySegments = ref([
  {
    id: 1,
    from: "Paris",
    to: "Amsterdam",
    type: "Train",
    transportName: "TGV",
    transportCode: "TG9452",
    depTime: "10:30 AM",
    depPlatform: "Platform 7",
    arrTime: "01:45 PM",
    arrPlatform: "Platform 12",
    duration: "3h 15m",
    co2: 14,
    cost: 95,
    startCoords: [2.3522, 48.8566],
    endCoords: [4.9041, 52.3676],
    completed: true,
    seat: "42A",
    gate: null,
    terminal: "Gare du Nord",
    class: "1st",
  },
  {
    id: 2,
    from: "Amsterdam",
    to: "Berlin",
    type: "Train",
    transportName: "ICE",
    transportCode: "ICE123",
    depTime: "03:00 PM",
    depPlatform: "Platform 2",
    arrTime: "09:30 PM",
    arrPlatform: "Platform 5",
    duration: "6h 30m",
    co2: 22,
    cost: 120,
    startCoords: [4.9041, 52.3676],
    endCoords: [13.405, 52.52],
    completed: false,
    seat: "15C",
    gate: null,
    terminal: "Centraal",
    class: "2nd",
  },
  {
    id: 3,
    from: "Berlin",
    to: "Prague",
    type: "Train",
    transportName: "EC",
    transportCode: "EC173",
    depTime: "10:00 AM",
    depPlatform: "Platform 1",
    arrTime: "02:30 PM",
    arrPlatform: "Platform 3",
    duration: "4h 30m",
    co2: 18,
    cost: 80,
    startCoords: [13.405, 52.52],
    endCoords: [14.4378, 50.0755],
    completed: false,
    seat: "88",
    gate: null,
    terminal: "Hbf",
    class: "2nd",
  },
  {
    id: 4,
    from: "Prague",
    to: "Vienna",
    type: "Train",
    transportName: "Railjet",
    transportCode: "RJ79",
    depTime: "03:30 PM",
    depPlatform: "Platform 4",
    arrTime: "07:30 PM",
    arrPlatform: "Platform 8",
    duration: "4h 00m",
    co2: 16,
    cost: 75,
    startCoords: [14.4378, 50.0755],
    endCoords: [16.3738, 48.2082],
    completed: false,
    seat: "22F",
    gate: null,
    terminal: "Hlavní Nádraží",
    class: "Business",
  },
  {
    id: 5,
    from: "Vienna",
    to: "Budapest",
    type: "Train",
    transportName: "EC",
    transportCode: "EC145",
    depTime: "09:00 AM",
    depPlatform: "Platform 9",
    arrTime: "11:40 AM",
    arrPlatform: "Platform 2",
    duration: "2h 40m",
    co2: 12,
    cost: 55,
    startCoords: [16.3738, 48.2082],
    endCoords: [19.0402, 47.4979],
    completed: false,
    seat: "Open",
    gate: null,
    terminal: "Westbahnhof",
    class: "2nd",
  },
  {
    id: 6,
    from: "Budapest",
    to: "Venice",
    type: "Train",
    transportName: "Nightjet",
    transportCode: "NJ236",
    depTime: "10:00 PM",
    depPlatform: "Platform 1",
    arrTime: "08:00 AM",
    arrPlatform: "Platform 14",
    duration: "10h 00m",
    co2: 28,
    cost: 140,
    startCoords: [19.0402, 47.4979],
    endCoords: [12.3155, 45.4408],
    completed: false,
    seat: "Berth 4",
    gate: null,
    terminal: "Keleti",
    class: "Sleeper",
  },
]);

const routeGeoJSON = computed(() => {
  if (journeySegments.value.length === 0)
    return { type: "FeatureCollection", features: [] };

  const features = [];

  journeySegments.value.forEach((seg) => {
    const start = turf.point(seg.startCoords);
    const end = turf.point(seg.endCoords);
    // Create individual curve for each segment
    const curvedLine = turf.greatCircle(start, end, { npoints: 50 });

    // Add 'completed' status to properties so Mapbox can style it
    curvedLine.properties = { completed: seg.completed ? "yes" : "no" };
    features.push(curvedLine);
  });

  return { type: "FeatureCollection", features };
});

const markersGeoJSON = computed(() => {
  if (journeySegments.value.length === 0) return null;
  const features = [];

  // Start Node
  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: journeySegments.value[0].startCoords,
    },
    properties: {
      number: 1,
      name: journeySegments.value[0].from,
      status: journeySegments.value[0].completed ? "done" : "pending",
    },
  });

  // End Nodes
  journeySegments.value.forEach((seg, index) => {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: seg.endCoords },
      properties: {
        number: index + 2,
        name: seg.to,
        status: seg.completed ? "done" : "pending",
      },
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

function removeSegment(id) {
  journeySegments.value = journeySegments.value.filter((s) => s.id !== id);
}

function toggleComplete(id) {
  const seg = journeySegments.value.find((s) => s.id === id);
  if (seg) seg.completed = !seg.completed;
}

function completeTrip() {
  if (confirm("Are you sure you want to complete and archive this trip?")) {
    journeySegments.value = [];
    tripSummary.value = {
      totalDestinations: 0,
      carbonFootprint: 0,
      totalCost: 0,
    };
    // In real app: router.push('/dashboard') or save to history DB
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock class="w-6 h-6 text-green-600" /> Actual Trip - Detailed
          Itinerary
        </h2>
        <p class="text-gray-500 text-sm">
          Complete breakdown of your journey with all transport methods and
          timings.
        </p>
      </div>
      <button
        @click="completeTrip"
        class="btn btn-success text-white gap-2 rounded-xl shadow-md font-bold hover:scale-105 transition-transform"
      >
        <CheckCircle2 class="w-5 h-5" /> Complete Trip
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          Total Destinations
        </div>
        <div class="text-4xl font-extrabold text-gray-800 mt-2">
          {{ tripSummary.totalDestinations }}
        </div>
      </div>
      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          Carbon Footprint
        </div>
        <div
          class="text-4xl font-extrabold text-green-600 mt-2 flex justify-center items-center gap-1"
        >
          {{ tripSummary.carbonFootprint }}
          <span class="text-lg text-gray-500 font-normal">kg CO₂</span>
        </div>
      </div>
      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          Total Cost
        </div>
        <div
          class="text-4xl font-extrabold text-gray-800 mt-2 flex justify-center items-center"
        >
          €{{ tripSummary.totalCost }}
        </div>
      </div>
    </div>

    <div
      class="space-y-3 border border-green-500 rounded-2xl p-4 bg-green-50/30"
    >
      <h3 class="text-lg font-bold text-green-800">Journey Segments</h3>

      <div
        class="max-h-[600px] overflow-y-auto pr-2 space-y-4 custom-scrollbar p-1"
      >
        <div
          v-for="(segment, index) in journeySegments"
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
                @click="toggleComplete(segment.id)"
                class="btn btn-sm btn-ghost btn-circle transition-all duration-200"
                :class="
                  segment.completed
                    ? 'text-green-600 bg-green-100'
                    : 'text-gray-300 hover:text-green-600 hover:bg-green-50'
                "
                :title="segment.completed ? 'Mark Incomplete' : 'Mark Complete'"
              >
                <Check class="w-5 h-5" />
              </button>

              <button
                @click="removeSegment(segment.id)"
                class="btn btn-sm btn-ghost btn-circle text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Segment"
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
                {{ segment.type.toUpperCase() }}
              </div>
            </div>

            <div
              class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-2 rounded-xl border transition-colors"
              :class="
                segment.completed
                  ? 'bg-gray-50 border-gray-100'
                  : 'bg-green-50/30 border-green-100'
              "
            >
              <div v-if="segment.terminal">
                <div
                  class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                >
                  <Building2 class="w-3 h-3" /> Terminal
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.terminal }}
                </div>
              </div>
              <div v-if="segment.gate">
                <div
                  class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                >
                  <DoorOpen class="w-3 h-3" /> Gate
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.gate }}
                </div>
              </div>
              <div v-if="segment.seat">
                <div
                  class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                >
                  <Armchair class="w-3 h-3" /> Seat
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.seat }}
                </div>
              </div>
              <div v-if="segment.class">
                <div class="text-[9px] text-gray-400 font-bold uppercase">
                  Class
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
                  <Clock class="w-3 h-3" /> Departure
                </div>
                <div
                  class="text-lg font-bold"
                  :class="segment.completed ? 'text-gray-500' : 'text-gray-800'"
                >
                  {{ segment.depTime }}
                </div>
                <div
                  class="text-xs font-medium"
                  :class="
                    segment.completed ? 'text-gray-400' : 'text-green-600'
                  "
                >
                  {{ segment.depPlatform }}
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
                  <MapPin class="w-3 h-3" /> Arrival
                </div>
                <div
                  class="text-lg font-bold"
                  :class="segment.completed ? 'text-gray-500' : 'text-gray-800'"
                >
                  {{ segment.arrTime }}
                </div>
                <div
                  class="text-xs font-medium"
                  :class="
                    segment.completed ? 'text-gray-400' : 'text-green-600'
                  "
                >
                  {{ segment.arrPlatform }}
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-3"
            >
              <div class="text-center">
                <div class="text-[10px] text-gray-400 font-bold uppercase">
                  Duration
                </div>
                <div class="font-bold text-gray-700">
                  {{ segment.duration }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-[10px] text-gray-400 font-bold uppercase">
                  Emissions
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
                  Cost
                </div>
                <div class="font-bold text-gray-800">€{{ segment.cost }}</div>
              </div>
            </div>
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
            <MapPin class="w-5 h-5" /> Interactive Route Map
          </h3>
          <p class="text-gray-500 text-xs">
            Visualize your journey on an interactive world map
          </p>
        </div>
        <button
          @click="toggle3D"
          class="btn btn-xs sm:btn-sm btn-outline btn-success gap-2 font-bold rounded-full"
        >
          <component :is="is3D ? Minimize2 : Maximize2" class="w-4 h-4" />
          {{ is3D ? "2D View" : "Switch to 3D" }}
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
            Reset
          </button>
        </div>
      </div>

      <div
        class="p-3 bg-green-50 text-[10px] text-green-700 flex justify-between items-center font-medium"
      >
        <div class="flex gap-4">
          <span class="flex items-center gap-1"
            ><MousePointerClick class="w-3 h-3" /> Use controls to
            navigate</span
          >
          <span class="flex items-center gap-1"
            ><Maximize2 class="w-3 h-3" /> {{ is3D ? "3D" : "2D" }} view
            active</span
          >
        </div>
        <span>{{ tripSummary.totalDestinations }} destinations on route</span>
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
