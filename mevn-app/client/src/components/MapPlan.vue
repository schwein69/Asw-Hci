<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import {
  Plus,
  Plane,
  Train,
  Car,
  Footprints,
  Bike,
  Save,
  Trash2,
  Clock,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Euro,
  Leaf,
  Shuffle,
} from "lucide-vue-next";
import mapboxgl from "mapbox-gl";
import MapboxMap from "./maps/maps.vue";
import * as turf from "@turf/turf";
import axios from "axios";
import "@mapbox/search-js-web";

const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const mapboxMapRef = ref(null);
const activeTab = ref("world");
const mapCenter = ref([12.56, 41.87]);
const mapZoom = ref(9);

const fromSearchBox = ref(null);
const toSearchBox = ref(null);

const iconMap = {
  Airplane: Plane,
  Train: Train,
  Car: Car,
  Walking: Footprints,
  Cycling: Bike,
};

const isRecsOpen = ref(true);
const draggableMarkers = ref([
  { id: "red", color: "#ef4444", label: "Red Marker" },
  { id: "blue", color: "#3b82f6", label: "Blue Marker" },
  { id: "green", color: "#10b981", label: "Green Marker" },
  { id: "orange", color: "#f59e0b", label: "Orange Marker" },
  { id: "purple", color: "#8b5cf6", label: "Purple Marker" },
]);

const newSegment = ref({
  fromName: "",
  fromCoords: null,
  toName: "",
  toCoords: null,
  type: "Airplane",
  fuelType: "Gasoline",
  date: "",
  departureTime: "",
  arrivalTime: "",
  gate: "",
  transportNumber: "",
});

const savedSegments = ref([]);
let tempMarkers = [];
let animationFrameId = null;

const searchOptions = computed(() => {
  const base = { language: "en", limit: 5 };
  if (newSegment.value.type === "Airplane")
    return { ...base, poi_category: ["airport"] };
  if (newSegment.value.type === "Train")
    return { ...base, poi_category: ["train_station"] };
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

function areCoordsEqual(c1, c2) {
  if (!c1 || !c2) return false;
  const epsilon = 0.000001;
  return Math.abs(c1[0] - c2[0]) < epsilon && Math.abs(c1[1] - c2[1]) < epsilon;
}

function onDragStart(event, markerItem) {
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("application/json", JSON.stringify(markerItem));
}

async function onMapDrop(event) {
  const json = event.dataTransfer.getData("application/json");
  if (!json) return;

  const markerItem = JSON.parse(json);
  const map = mapboxMapRef.value?.map;
  if (!map) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const lngLat = map.unproject([x, y]);
  const finalCoords = [lngLat.lng, lngLat.lat];

  const newMarker = new mapboxgl.Marker({ color: markerItem.color })
    .setLngLat(finalCoords)
    .addTo(map);

  tempMarkers.push(newMarker);

  let placeName = "Dropped Location";
  newMarker.setPopup(new mapboxgl.Popup().setHTML(`<b>Loading...</b>`));

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?types=poi,address,place,locality&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      placeName = data.features[0].place_name || data.features[0].text;
      newMarker.setPopup(new mapboxgl.Popup().setHTML(`<b>${placeName}</b>`));
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }

  if (!newSegment.value.fromCoords) {
    newSegment.value.fromName = placeName;
    newSegment.value.fromCoords = finalCoords;
    if (fromSearchBox.value) fromSearchBox.value.value = placeName;
  } else {
    newSegment.value.toName = placeName;
    newSegment.value.toCoords = finalCoords;
    if (toSearchBox.value) toSearchBox.value.value = placeName;
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

async function geminiEstimation(mode, distanceKm, fuelType) {
  try {
    const payload = { mode, distance_km: distanceKm };
    if (mode === "Car") payload.fuel_type = fuelType;

    const response = await axios.post(
      "http://localhost:3000/api/plan/estimate",
      payload
    );
    return response.data;
  } catch (err) {
    console.error("Error calling Gemini estimation API:", err);
    return { cost: "0.00", co2: "0.0" };
  }
}

async function geocodeText(searchText) {
  if (!searchText) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchText
    )}.json?access_token=${accessToken}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      return {
        name: data.features[0].place_name || data.features[0].text,
        coords: data.features[0].geometry.coordinates,
      };
    }
  } catch (err) {
    console.error("Geocoding fallback failed", err);
  }
  return null;
}

async function addSegment() {
  if (
    !newSegment.value.fromCoords &&
    fromSearchBox.value &&
    fromSearchBox.value.value
  ) {
    const result = await geocodeText(fromSearchBox.value.value);
    if (result) {
      newSegment.value.fromName = result.name;
      newSegment.value.fromCoords = result.coords;
    }
  }

  if (
    !newSegment.value.toCoords &&
    toSearchBox.value &&
    toSearchBox.value.value
  ) {
    const result = await geocodeText(toSearchBox.value.value);
    if (result) {
      newSegment.value.toName = result.name;
      newSegment.value.toCoords = result.coords;
    }
  }

  if (!newSegment.value.fromCoords || !newSegment.value.toCoords) {
    alert("Please select Start and End locations.");
    return;
  }

  const rawDistance = turf.distance(
    newSegment.value.fromCoords,
    newSegment.value.toCoords,
    { units: "kilometers" }
  );
  const distanceKm = parseFloat(rawDistance.toFixed(2));

  const geminiData = await geminiEstimation(
    newSegment.value.type,
    distanceKm,
    newSegment.value.fuelType
  );

  const segmentId = Date.now();
  const nextStartName = newSegment.value.toName;
  const nextStartCoords = newSegment.value.toCoords;

  const segment = {
    id: segmentId,
    from: newSegment.value.fromName,
    to: newSegment.value.toName,
    fromCoords: newSegment.value.fromCoords,
    toCoords: newSegment.value.toCoords,
    type: newSegment.value.type,
    fuelType:
      newSegment.value.type === "Car" ? newSegment.value.fuelType : null,
    date: newSegment.value.date,
    departureTime: newSegment.value.departureTime,
    arrivalTime: newSegment.value.arrivalTime,
    gate: newSegment.value.gate,
    transportNumber: newSegment.value.transportNumber,
    markers: [...tempMarkers],
    cost: geminiData.cost,
    co2: geminiData.co2,
    distance: distanceKm,
    activeRoute: "fastest",
    alternatives: null,
  };

  tempMarkers = [];

  savedSegments.value.push(segment);
  await visualizeRoute(
    segment.fromCoords,
    segment.toCoords,
    segment.type,
    segment.id
  );

  newSegment.value.fromName = nextStartName;
  newSegment.value.fromCoords = nextStartCoords;

  if (fromSearchBox.value) fromSearchBox.value.value = nextStartName;
  if (toSearchBox.value) toSearchBox.value.value = "";

  newSegment.value.toName = "";
  newSegment.value.toCoords = null;
  newSegment.value.departureTime = "";
  newSegment.value.arrivalTime = "";
  newSegment.value.gate = "";
  newSegment.value.transportNumber = "";
}

async function toggleAlternativeRoute(index) {
  const segment = savedSegments.value[index];

  // If we haven't generated an alternative yet, simulate one
  if (!segment.alternatives) {
    // Simulation: Eco route saves 15% CO2 but costs 10% more (or takes longer)
    const baseCo2 = parseFloat(segment.co2);
    const baseCost = parseFloat(segment.cost);

    segment.alternatives = {
      fastest: { cost: segment.cost, co2: segment.co2 },
      eco: {
        cost: (baseCost * 1.1).toFixed(2),
        co2: (baseCo2 * 0.85).toFixed(1),
      },
    };
  }

  // Toggle state
  if (segment.activeRoute === "fastest") {
    segment.activeRoute = "eco";
    segment.cost = segment.alternatives.eco.cost;
    segment.co2 = segment.alternatives.eco.co2;
  } else {
    segment.activeRoute = "fastest";
    segment.cost = segment.alternatives.fastest.cost;
    segment.co2 = segment.alternatives.fastest.co2;
  }
}

function removeSegment(index) {
  const segmentToRemove = savedSegments.value[index];
  const nextSegment = savedSegments.value[index + 1];

  const map = mapboxMapRef.value?.map;

  if (map) {
    const routeId = `route-${segmentToRemove.id}`;
    const pointId = `point-${segmentToRemove.id}`;
    if (map.getLayer(routeId)) map.removeLayer(routeId);
    if (map.getSource(routeId)) map.removeSource(routeId);
    if (map.getLayer(pointId)) map.removeLayer(pointId);
    if (map.getSource(pointId)) map.removeSource(pointId);
  }

  if (segmentToRemove.markers && segmentToRemove.markers.length > 0) {
    segmentToRemove.markers.forEach((marker) => {
      const markerLngLat = marker.getLngLat();
      const isShared =
        nextSegment &&
        areCoordsEqual(
          [markerLngLat.lng, markerLngLat.lat],
          nextSegment.fromCoords
        );

      if (isShared) {
        if (!nextSegment.markers) nextSegment.markers = [];
        nextSegment.markers.push(marker);
      } else {
        marker.remove();
      }
    });
  }

  savedSegments.value.splice(index, 1);

  if (savedSegments.value.length === 0) {
    newSegment.value.fromName = "";
    newSegment.value.fromCoords = null;
    if (fromSearchBox.value) fromSearchBox.value.value = "";
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
  }
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
      let profile = "driving";
      if (type === "Walking") profile = "walking";
      if (type === "Cycling") profile = "cycling";

      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${accessToken}`
      );
      const json = await res.json();
      if (json.routes?.[0]) routeGeoJSON = json.routes[0].geometry;
    }
  } catch (e) {
    routeGeoJSON = turf.lineString([startCoords, endCoords]).geometry;
  }

  if (!routeGeoJSON) return;

  const routeId = `route-${segmentId}`;
  const pointId = `point-${segmentId}`;

  map.addSource(routeId, {
    type: "geojson",
    data: { type: "Feature", geometry: routeGeoJSON },
  });
  map.addLayer({
    id: routeId,
    type: "line",
    source: routeId,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": type === "Airplane" ? "#3b82f6" : "#10b981",
      "line-width": 4,
      "line-dasharray": type === "Airplane" ? [2, 2] : [1],
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
  map.fitBounds(bbox, { padding: 80, maxZoom: 10 });
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

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
                    ref="fromSearchBox"
                    :access-token="accessToken"
                    :options="searchOptions"
                    placeholder="Search start location..."
                    @retrieve="handleRetrieveFrom"
                  ></mapbox-search-box>
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
                    ref="toSearchBox"
                    :access-token="accessToken"
                    :options="searchOptions"
                    placeholder="Search destination..."
                    @retrieve="handleRetrieveTo"
                  ></mapbox-search-box>
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
                    <option>Cycling</option>
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
                v-if="newSegment.type === 'Airplane'"
                class="grid grid-cols-2 gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div class="col-span-2 text-xs font-bold text-blue-500">
                  FLIGHT DETAILS
                </div>
                <input
                  v-model="newSegment.transportNumber"
                  placeholder="Flight #"
                  class="input input-sm input-bordered w-full rounded-md"
                />
                <input
                  v-model="newSegment.gate"
                  placeholder="Gate"
                  class="input input-sm input-bordered w-full rounded-md"
                />
                <input
                  v-model="newSegment.departureTime"
                  type="time"
                  class="input input-sm input-bordered w-full rounded-md"
                  aria-label="Departure"
                />
                <input
                  v-model="newSegment.arrivalTime"
                  type="time"
                  class="input input-sm input-bordered w-full rounded-md"
                  aria-label="Arrival"
                />
              </div>

              <div
                v-if="newSegment.type === 'Train'"
                class="grid grid-cols-2 gap-2 p-2 bg-orange-50 rounded-lg border border-orange-100"
              >
                <div class="col-span-2 text-xs font-bold text-orange-500">
                  TRAIN DETAILS
                </div>
                <input
                  v-model="newSegment.transportNumber"
                  placeholder="Train #"
                  class="input input-sm input-bordered w-full col-span-2 rounded-md"
                />
                <div class="text-[10px] text-gray-500 uppercase">Departs</div>
                <div class="text-[10px] text-gray-500 uppercase">Arrives</div>
                <input
                  v-model="newSegment.departureTime"
                  type="time"
                  class="input input-sm input-bordered w-full rounded-md"
                />
                <input
                  v-model="newSegment.arrivalTime"
                  type="time"
                  class="input input-sm input-bordered w-full rounded-md"
                />
              </div>

              <div v-if="newSegment.type === 'Car'" class="space-y-1">
                <label class="text-xs font-bold text-gray-500 uppercase"
                  >Fuel Type</label
                >
                <select
                  v-model="newSegment.fuelType"
                  class="select select-sm select-bordered bg-white w-full rounded-lg"
                >
                  <option>Gasoline</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                </select>
              </div>

              <button
                @click="addSegment"
                class="btn btn-sm btn-success w-full text-white rounded-lg shadow-sm mt-2"
              >
                Add Segment
              </button>
            </div>

            <div
              class="mt-4 border border-green-100 rounded-xl overflow-hidden"
            >
              <div
                @click="isRecsOpen = !isRecsOpen"
                class="p-3 bg-green-50 flex justify-between items-center cursor-pointer hover:bg-green-100 transition-colors"
              >
                <span class="text-sm font-bold text-green-800"
                  >Drag & Drop Markers</span
                >
                <component
                  :is="isRecsOpen ? ChevronUp : ChevronDown"
                  class="w-4 h-4 text-green-700"
                />
              </div>

              <div v-if="isRecsOpen" class="p-4 bg-white">
                <div class="text-xs text-gray-400 mb-2">
                  Drag a pin to the map to set a location:
                </div>
                <div class="flex gap-3 justify-between">
                  <div
                    v-for="marker in draggableMarkers"
                    :key="marker.id"
                    draggable="true"
                    @dragstart="onDragStart($event, marker)"
                    class="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    :title="marker.label"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      :style="{
                        fill: marker.color,
                        filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))',
                      }"
                      stroke="white"
                      stroke-width="1.5"
                    >
                      <path
                        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                      ></path>
                      <circle cx="12" cy="10" r="3" fill="white"></circle>
                    </svg>
                  </div>
                </div>
              </div>
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
                class="flex flex-col p-3 border border-gray-100 rounded-xl hover:bg-green-50 bg-white shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="text-green-600 bg-green-100 p-2 rounded-full">
                      <component
                        :is="iconMap[seg.type]"
                        class="w-4 h-4"
                        v-if="iconMap[seg.type]"
                      />
                      <Footprints v-else class="w-4 h-4" />
                    </div>
                    <div class="text-sm">
                      <div class="font-bold text-gray-800">
                        {{ seg.from }} <span class="text-gray-400 mx-1">➜</span>
                        {{ seg.to }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ seg.date || "No date" }}
                        <span v-if="seg.type === 'Car' && seg.fuelType"
                          >({{ seg.fuelType }})</span
                        >
                        <span class="font-bold text-green-700 ml-1"
                          >• {{ seg.distance }} km</span
                        >
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

                <div
                  v-if="seg.type === 'Airplane' || seg.type === 'Train'"
                  class="mt-2 ml-12 text-xs text-gray-600 grid grid-cols-2 gap-x-2 bg-gray-50 p-1.5 rounded"
                >
                  <div v-if="seg.transportNumber">
                    <b>#:</b> {{ seg.transportNumber }}
                  </div>
                  <div v-if="seg.gate"><b>Gate:</b> {{ seg.gate }}</div>
                  <div v-if="seg.departureTime">
                    <b>Dep:</b> {{ seg.departureTime }}
                  </div>
                  <div v-if="seg.arrivalTime">
                    <b>Arr:</b> {{ seg.arrivalTime }}
                  </div>
                </div>

                <div class="flex items-center justify-between mt-2 ml-12">
                  <div class="flex gap-2">
                    <div
                      class="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded"
                    >
                      <Euro class="w-3 h-3 mr-1 text-gray-500" />
                      {{ seg.cost || "0.00" }}
                    </div>
                    <div
                      class="flex items-center text-xs font-medium bg-green-100 px-2 py-1 rounded"
                      :class="
                        seg.activeRoute === 'eco'
                          ? 'text-green-800 ring-1 ring-green-500'
                          : 'text-green-700'
                      "
                    >
                      <Leaf class="w-3 h-3 mr-1" />
                      {{ seg.co2 || "0.0" }} kg
                    </div>
                  </div>

                  <button
                    @click="toggleAlternativeRoute(idx)"
                    class="btn btn-xs rounded-full gap-1 border-none shadow-sm"
                    :class="
                      seg.activeRoute === 'eco'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                    "
                    title="Find Eco Alternative"
                  >
                    <Shuffle class="w-3 h-3" />
                    {{ seg.activeRoute === "eco" ? "Eco Mode" : "Alt" }}
                  </button>
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
          @dragover.prevent
          @drop="onMapDrop"
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
.cursor-grab {
  cursor: grab;
}
.cursor-grabbing {
  cursor: grabbing;
}
</style>
