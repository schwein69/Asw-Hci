<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import {
  Plus,
  Plane,
  Train,
  Car,
  Footprints,
  Save,
  Trash2,
  Clock,
  Bookmark,
} from "lucide-vue-next";
import MapboxMap from "./maps/maps.vue";
import * as turf from "@turf/turf";

import "@mapbox/search-js-web";

const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const mapboxMapRef = ref(null);
const activeTab = ref("world");
const mapCenter = ref([12.56, 41.87]);
const mapZoom = ref(9);

const newSegment = ref({
  fromName: "",
  fromCoords: null,
  toName: "",
  toCoords: null,
  type: "Airplane",
  date: "",
  time: "",
});

const savedSegments = ref([]);
let animationFrameId = null;

const searchOptions = computed(() => {
  const base = { language: "en", limit: 5 };

  if (newSegment.value.type === "Airplane") {
    return { ...base, poi_category: ["airport"] };
  }
  if (newSegment.value.type === "Train") {
    return { ...base, poi_category: ["train_station"] };
  }

  return { ...base, types: ["place", "locality", "poi", "address"] };
});

onMounted(() => {
  handleMyLocation();
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

watch(activeTab, () => {
  setTimeout(() => {
    if (mapboxMapRef.value?.map) mapboxMapRef.value.map.resize();
  }, 550);
});

function handleMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapCenter.value = [longitude, latitude];
        if (mapboxMapRef.value?.flyTo) {
          mapboxMapRef.value.flyTo([longitude, latitude], 15);
        }
      },
      (err) => console.warn("Location denied:", err)
    );
  }
}

function handleRetrieveFrom(e) {
  const feature = e.detail?.features?.[0];
  if (feature) {
    newSegment.value.fromName =
      feature.properties.name_preferred || feature.properties.name;
    newSegment.value.fromCoords = feature.geometry.coordinates;
  }
}

function handleRetrieveTo(e) {
  const feature = e.detail?.features?.[0];
  if (feature) {
    newSegment.value.toName =
      feature.properties.name_preferred || feature.properties.name;
    newSegment.value.toCoords = feature.geometry.coordinates;
  }
}

async function addSegment() {
  if (!newSegment.value.fromCoords || !newSegment.value.toCoords) {
    alert("Please search and select valid locations.");
    return;
  }

  const segmentId = Date.now();
  const segment = {
    id: segmentId,
    from: newSegment.value.fromName,
    to: newSegment.value.toName,
    fromCoords: newSegment.value.fromCoords,
    toCoords: newSegment.value.toCoords,
    type: newSegment.value.type,
    date: newSegment.value.date,
    time: newSegment.value.time,
  };

  savedSegments.value.push(segment);
  await visualizeRoute(
    segment.fromCoords,
    segment.toCoords,
    segment.type,
    segment.id
  );

  newSegment.value.fromName = "";
  newSegment.value.fromCoords = null;
  newSegment.value.toName = "";
  newSegment.value.toCoords = null;
  newSegment.value.time = "";
}

function removeSegment(index) {
  const segment = savedSegments.value[index];
  const map = mapboxMapRef.value?.map;

  if (map) {
    const routeId = `route-${segment.id}`;
    const pointId = `point-${segment.id}`;
    if (map.getLayer(routeId)) map.removeLayer(routeId);
    if (map.getSource(routeId)) map.removeSource(routeId);
    if (map.getLayer(pointId)) map.removeLayer(pointId);
    if (map.getSource(pointId)) map.removeSource(pointId);
  }
  savedSegments.value.splice(index, 1);
}

function saveTripToDB() {
  console.log("Saving:", savedSegments.value);
  alert("Trip Saved!");
}

async function visualizeRoute(startCoords, endCoords, type, segmentId) {
  const map = mapboxMapRef.value?.map;
  if (!map) return;

  let routeGeoJSON = null;

  try {
    if (type === "Airplane") {
      routeGeoJSON = turf.greatCircle(startCoords, endCoords, {
        npoints: 100,
      }).geometry;
    } else {
      let profile = type === "Walking" ? "walking" : "driving";
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${accessToken}`
      );
      if (!res.ok) throw new Error("API Failed");
      const json = await res.json();
      if (json.routes?.[0]) {
        routeGeoJSON = json.routes[0].geometry;
      } else {
        throw new Error("No route found");
      }
    }
  } catch (e) {
    console.warn("Using fallback route:", e);
    routeGeoJSON = turf.lineString([startCoords, endCoords]).geometry;
  }

  if (!routeGeoJSON) return;

  const routeId = `route-${segmentId}`;
  const pointId = `point-${segmentId}`;

  // 1. Add Source FIRST
  map.addSource(routeId, {
    type: "geojson",
    data: { type: "Feature", geometry: routeGeoJSON },
  });

  // 2. Add Layer referencing the Source
  map.addLayer({
    id: routeId,
    type: "line",
    source: routeId, // Must match addSource ID
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": type === "Airplane" ? "#3b82f6" : "#10b981",
      "line-width": 4,
      "line-dasharray": type === "Airplane" ? [2, 2] : [1],
      "line-opacity": 0.8,
    },
  });

  // 3. Add Point Source & Layer
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
      "circle-color": "#ffffff",
      "circle-stroke-width": 3,
      "circle-stroke-color": type === "Airplane" ? "#3b82f6" : "#10b981",
    },
  });

  const pathFeature = { type: "Feature", geometry: routeGeoJSON };
  const lineDistance = turf.length(pathFeature);
  const duration = 10000;
  let startTimestamp = null;

  function animate(timestamp) {
    if (!map || !map.getSource(pointId)) return;
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = (timestamp - startTimestamp) / duration;

    if (progress < 1) {
      const point = turf.along(pathFeature, progress * lineDistance);
      map.getSource(pointId).setData(point);
      animationFrameId = requestAnimationFrame(animate);
    } else {
      startTimestamp = null;
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  const bbox = turf.bbox(pathFeature);
  map.fitBounds(bbox, { padding: 80, maxZoom: 8 });

  animationFrameId = requestAnimationFrame(animate);
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
          class="tab rounded-lg"
          :class="{
            'tab-active bg-white text-green-700': activeTab === 'world',
          }"
          @click="activeTab = 'world'"
          >Plan Trip</a
        >
        <a
          class="tab rounded-lg"
          :class="{
            'tab-active bg-white text-green-700': activeTab === 'city',
          }"
          @click="activeTab = 'city'"
          >Navigate City</a
        >
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[650px]">
      <div
        v-if="activeTab === 'world'"
        class="lg:col-span-4 h-full flex flex-col"
      >
        <div
          class="card bg-white border border-green-100 shadow-lg flex-1 overflow-visible rounded-2xl z-20"
        >
          <div class="card-body p-5">
            <h3 class="font-bold text-gray-700 flex items-center gap-2 mb-2">
              <Plus class="w-5 h-5 text-green-600" /> Add Trip Segment
            </h3>

            <div
              class="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100 relative"
            >
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500 uppercase"
                  >From</label
                >
                <div
                  class="rounded-lg overflow-hidden border border-gray-200 bg-white"
                >
                  <mapbox-search-box
                    :access-token="accessToken"
                    :options="searchOptions"
                    placeholder="Search start location..."
                    @retrieve="handleRetrieveFrom"
                  >
                  </mapbox-search-box>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500 uppercase"
                  >To</label
                >
                <div
                  class="rounded-lg overflow-hidden border border-gray-200 bg-white"
                >
                  <mapbox-search-box
                    :access-token="accessToken"
                    :options="searchOptions"
                    placeholder="Search destination..."
                    @retrieve="handleRetrieveTo"
                  >
                  </mapbox-search-box>
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
                    <option>Walking</option>
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

              <div
                v-if="
                  newSegment.type === 'Airplane' || newSegment.type === 'Train'
                "
                class="space-y-1"
              >
                <label class="text-xs font-bold text-gray-500 uppercase"
                  >Departure Time</label
                >
                <input
                  v-model="newSegment.time"
                  type="time"
                  class="input input-sm input-bordered bg-white w-full rounded-lg"
                />
              </div>

              <button
                @click="addSegment"
                class="btn btn-sm btn-success w-full text-white rounded-lg shadow-sm mt-2"
              >
                Add Segment
              </button>
            </div>

            <div class="divider my-2 text-xs text-gray-400">YOUR ITINERARY</div>
            <div class="space-y-2 flex-1 overflow-y-auto custom-scrollbar h-48">
              <div
                v-if="savedSegments.length === 0"
                class="text-center py-8 text-gray-400 text-sm italic"
              >
                No trips added yet.
              </div>
              <div
                v-for="(seg, idx) in savedSegments"
                :key="seg.id"
                class="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-green-50 bg-white shadow-sm"
              >
                <div class="flex items-center gap-3">
                  <div class="text-green-600 bg-green-100 p-2 rounded-full">
                    <Plane v-if="seg.type === 'Airplane'" class="w-4 h-4" />
                    <Train v-else-if="seg.type === 'Train'" class="w-4 h-4" />
                    <Car v-else-if="seg.type === 'Car'" class="w-4 h-4" />
                    <Footprints v-else class="w-4 h-4" />
                  </div>
                  <div class="text-sm">
                    <div class="font-bold text-gray-800">
                      {{ seg.from }} <span class="text-gray-400 mx-1">➜</span>
                      {{ seg.to }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ seg.date || "No date" }}
                      <span v-if="seg.time">• {{ seg.time }}</span>
                      • {{ seg.type }}
                    </div>
                  </div>
                </div>
                <button
                  @click="removeSegment(idx)"
                  class="btn btn-ghost btn-xs text-gray-400 hover:text-red-500"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
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
              class="btn btn-sm glass text-gray-800 gap-2 rounded-full shadow-lg hover:text-green-700"
            >
              <Clock class="w-4 h-4" /> Recent
            </button>
            <button
              class="btn btn-sm glass text-gray-800 gap-2 rounded-full shadow-lg hover:text-green-700"
            >
              <Bookmark class="w-4 h-4" /> Saved
            </button>
          </div>
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
