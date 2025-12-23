<script setup>
import { ref, onMounted, watch } from "vue";
import {
  MapPin,
  Plus,
  Plane,
  Train,
  Car,
  Save,
  Clock,
  Bookmark,
} from "lucide-vue-next";
import MapboxMap from "./maps/maps.vue";
import * as turf from "@turf/turf";

const mapboxMapRef = ref(null);
const activeTab = ref("world");

const mapCenter = ref([-74.5, 40]);
const mapZoom = ref(9);

const newSegment = ref({
  from: "",
  to: "",
  type: "Airplane",
  date: "",
});
const savedSegments = ref([]);

const cityCoords = {
  Milan: [9.19, 45.4642],
  Naples: [14.2681, 40.8518],
  Rome: [12.4964, 41.9028],
  Paris: [2.3522, 48.8566],
  London: [-0.1276, 51.5074],
  Berlin: [13.405, 52.52],
  "New York": [-74.006, 40.7128],
};

onMounted(() => {
  handleMyLocation();
});

watch(activeTab, () => {
  setTimeout(() => {
    if (mapboxMapRef.value) {
      const map = mapboxMapRef.value.map;
      if (map) {
        map.resize();
      }
    }
  }, 550);
});

function handleMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Update reactive state
        mapCenter.value = [longitude, latitude];

        // Access child component method directly
        if (
          mapboxMapRef.value &&
          typeof mapboxMapRef.value.flyTo === "function"
        ) {
          try {
            mapboxMapRef.value.flyTo([longitude, latitude], 15);
          } catch (e) {
            console.warn("flyTo failed:", e);
          }
        }
      },
      (err) => {
        console.warn("Location access denied or failed:", err);
      }
    );
  } else {
    console.warn("Geolocation is not supported by this browser.");
  }
}

// --- PLANNING FUNCTIONS ---

function addSegment() {
  if (!newSegment.value.from || !newSegment.value.to) return;
  savedSegments.value.push({ ...newSegment.value });

  const start = cityCoords[newSegment.value.from];
  const end = cityCoords[newSegment.value.to];

  if (start && end) {
    visualizeRoute(start, end, newSegment.value.type);
  } else {
    alert("Demo: Try 'Milan' to 'Naples' to see the animation!");
  }
  newSegment.value = { from: "", to: "", type: "Airplane", date: "" };
}

function saveTripToDB() {
  console.log("💾 Saving Trip:", savedSegments.value);
  alert("Trip saved!");
}

function visualizeRoute(startCoords, endCoords, type) {
  const map = mapboxMapRef.value.map;
  if (!map) return;

  const start = turf.point(startCoords);
  const end = turf.point(endCoords);
  let routeGeoJSON;

  if (type === "Airplane") {
    routeGeoJSON = turf.greatCircle(start, end, { npoints: 100 });
  } else {
    routeGeoJSON = turf.lineString([startCoords, endCoords]);
  }

  const idSuffix = Date.now();
  const routeId = `route-${idSuffix}`;
  const pointId = `point-${idSuffix}`;

  map.addSource(routeId, { type: "geojson", data: routeGeoJSON });
  map.addLayer({
    id: routeId,
    type: "line",
    source: routeId,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#10b981",
      "line-width": 3,
      "line-dasharray": [2, 2],
      "line-opacity": 0.8,
    },
  });

  const pointData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: startCoords },
      },
    ],
  };

  map.addSource(pointId, { type: "geojson", data: pointData });
  map.addLayer({
    id: pointId,
    type: "circle",
    source: pointId,
    paint: {
      "circle-radius": 6,
      "circle-color": "#34d399",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  const lineDistance = turf.length(routeGeoJSON);
  const duration = 5000;
  let startTimestamp = null;

  function animate(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = (timestamp - startTimestamp) / duration;

    if (progress < 1) {
      const point = turf.along(routeGeoJSON, progress * lineDistance);
      map.getSource(pointId).setData(point);
      requestAnimationFrame(animate);
    } else {
      map.getSource(pointId).setData(end);
    }
  }

  const bbox = turf.bbox(routeGeoJSON);
  map.fitBounds(bbox, { padding: 100, maxZoom: 6 });
  requestAnimationFrame(animate);
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col md:flex-row justify-between items-center gap-4 bg-success rounded-2xl"
    >
      <div class="flex gap-2 items-center">
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight p-2">
          EcoTravel Planner
        </h2>
      </div>

      <div class="tabs tabs-boxed rounded-xl p-1">
        <a
          class="tab rounded-lg transition-all duration-300"
          :class="{
            'tab-active bg-white shadow-sm text-green-700':
              activeTab === 'world',
          }"
          @click="activeTab = 'world'"
          >Plan Trip</a
        >
        <a
          class="tab rounded-lg transition-all duration-300"
          :class="{
            'tab-active bg-white shadow-sm text-green-700':
              activeTab === 'city',
          }"
          @click="activeTab = 'city'"
          >Navigate City</a
        >
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[650px]">
      <div
        v-show="activeTab === 'world'"
        class="lg:col-span-4 h-full flex flex-col"
      >
        <div
          class="card bg-white border border-green-100 shadow-lg flex-1 overflow-hidden rounded-2xl"
        >
          <div class="card-body p-5 overflow-y-auto custom-scrollbar">
            <h3 class="font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Plus class="w-5 h-5 text-green-600" /> Add Trip Segment
            </h3>

            <div
              class="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100"
            >
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase"
                  >Route</label
                >
                <div class="flex flex-col gap-2">
                  <input
                    v-model="newSegment.from"
                    type="text"
                    placeholder="From (e.g. Milan)"
                    class="input input-sm input-bordered bg-white w-full rounded-lg"
                  />
                  <input
                    v-model="newSegment.to"
                    type="text"
                    placeholder="To (e.g. Naples)"
                    class="input input-sm input-bordered bg-white w-full rounded-lg"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase"
                    >Mode</label
                  >
                  <select
                    v-model="newSegment.type"
                    class="select select-sm select-bordered bg-white w-full rounded-lg mt-1"
                  >
                    <option>Airplane</option>
                    <option>Train</option>
                    <option>Car</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase"
                    >Date</label
                  >
                  <input
                    v-model="newSegment.date"
                    type="date"
                    class="input input-sm input-bordered bg-white w-full rounded-lg mt-1"
                  />
                </div>
              </div>

              <button
                @click="addSegment"
                class="btn btn-sm btn-success w-full text-white rounded-lg shadow-sm mt-2"
              >
                Add Segment
              </button>
            </div>

            <div class="divider my-2 text-xs text-gray-400">YOUR ITINERARY</div>

            <div class="space-y-2 flex-1">
              <div
                v-if="savedSegments.length === 0"
                class="text-center py-8 text-gray-400 text-sm italic"
              >
                No trips added yet.
              </div>
              <div
                v-for="(seg, idx) in savedSegments"
                :key="idx"
                class="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-green-50 transition-colors bg-white shadow-sm"
              >
                <div class="text-green-600 bg-green-100 p-2 rounded-full">
                  <Plane v-if="seg.type === 'Airplane'" class="w-4 h-4" />
                  <Train v-else-if="seg.type === 'Train'" class="w-4 h-4" />
                  <Car v-else class="w-4 h-4" />
                </div>
                <div class="text-sm">
                  <div class="font-bold text-gray-800">
                    {{ seg.from }} <span class="text-gray-400 mx-1">➜</span>
                    {{ seg.to }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ seg.date || "No date" }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t bg-gray-50/80 backdrop-blur">
            <button
              @click="saveTripToDB"
              class="btn btn-success w-full text-white gap-2 rounded-xl shadow-md"
            >
              <Save class="w-4 h-4" /> Save Full Trip
            </button>
          </div>
        </div>
      </div>

      <div
        :class="activeTab === 'world' ? 'lg:col-span-8' : 'lg:col-span-12'"
        class="h-full transition-all duration-500 ease-in-out"
      >
        <div
          class="card bg-white border border-green-100 shadow-xl overflow-hidden h-full relative rounded-3xl"
          :class="{ 'hide-directions': activeTab === 'world' }"
        >
          <MapboxMap ref="mapboxMapRef" :center="mapCenter" :zoom="mapZoom" />

          <div
            class="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <div
              class="badge badge-lg gap-2 shadow-lg backdrop-blur-md border-white/20"
              :class="
                activeTab === 'world'
                  ? 'bg-green-600 text-white border-none'
                  : 'bg-white/90 text-gray-700'
              "
            >
              {{
                activeTab === "world" ? "🌍 World View" : "🏙️ Navigation Mode"
              }}
            </div>
          </div>

          <div
            v-if="activeTab === 'city'"
            class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          >
            <button
              @click="handleRecentRoutes"
              class="btn btn-sm glass text-gray-800 gap-2 rounded-full shadow-lg hover:text-green-700"
            >
              <Clock class="w-4 h-4" /> Recent
            </button>
            <button
              @click="handleSavedPlaces"
              class="btn btn-sm glass text-gray-800 gap-2 rounded-full shadow-lg hover:text-green-700"
            >
              <Bookmark class="w-4 h-4" /> Saved
            </button>
          </div>

          <button
            @click="handleMyLocation"
            class="absolute bottom-8 right-8 btn btn-circle btn-success text-white shadow-xl z-20 hover:scale-105 transition-transform"
            title="Find My Location"
          >
            <MapPin class="w-5 h-5" />
          </button>
        </div>
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

.hide-directions :deep(.mapboxgl-ctrl-directions) {
  display: none !important;
}
</style>
