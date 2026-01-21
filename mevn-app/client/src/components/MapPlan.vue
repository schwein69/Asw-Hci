<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import {
  Plus,
  Plane,
  Train,
  Car,
  Footprints,
  Bike,
  Bus,
  Save,
  Trash2,
  Clock,
  Euro,
  Leaf,
  Shuffle,
  Loader2,
  Hotel,
  Utensils,
  ToggleLeft,
  ToggleRight,
  Armchair,
  DoorOpen,
  Ticket,
  Edit,
} from "lucide-vue-next";
import mapboxgl from "mapbox-gl";
import MapboxMap from "./maps/maps.vue";
import * as turf from "@turf/turf";
import axios from "axios";
import "@mapbox/search-js-web";
import { getLanguage, t as translate } from "../utils/translations.js";
import { useTripStore } from "../data/tripStore";
import EditTripModal from "./template/EditTripModal.vue";
import ComparisonModal from "./template/ComparisonModal.vue";

const tripStore = useTripStore();

const language = ref(getLanguage());

const t = computed(() => (key) => translate(key, language.value));

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const mapboxMapRef = ref(null);
const mapContainerRef = ref(null);
const activeTab = ref("world");
const mapCenter = ref([12.56, 41.87]);
const mapZoom = ref(9);
const userLocation = ref(null);

const fromSearchBox = ref(null);
const toSearchBox = ref(null);
const comparisonModalOpen = ref(false);
const targetSegmentIndex = ref(null);
const pendingComparisonData = ref(null);
const isLoadingComparison = ref(false);

const isEcoMode = ref(false);
const ecoCategory = ref("accommodation");
const currentEcoRating = ref(null);
const isCalculatingEco = ref(false);

const iconMap = {
  Airplane: Plane,
  Train: Train,
  Car: Car,
  Bus: Bus,
  Walking: Footprints,
  Cycling: Bike,
  Hotel: Hotel,
  Restaurant: Utensils,
};

const draggableMarkers = ref([
  { id: "red", color: "#ef4444", label: "Red" },
  { id: "blue", color: "#3b82f6", label: "Blue" },
  { id: "green", color: "#10b981", label: "Green" },
  { id: "orange", color: "#f59e0b", label: "Orange" },
  { id: "purple", color: "#8b5cf6", label: "Purple" },
]);

// --- AGGIORNATO: Aggiunti nuovi campi allo stato ---
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
  gate: "", // Partenza
  arrivalGate: "", // Arrivo (Nuovo)
  seat: "", // Posto (Nuovo)
  travelClass: "", // Classe (Nuovo)
  transportNumber: "",
  ecoScore: null,
});

const savedSegments = ref([]);
let tempMarkers = [];
let animationFrameId = null;
let resizeObserver = null;

const searchOptions = computed(() => {
  const base = {
    language: "en",
    limit: 6,
    proximity: userLocation.value
      ? userLocation.value.join(",")
      : mapCenter.value.join(","),
  };

  if (isEcoMode.value) {
    if (ecoCategory.value === "accommodation") {
      return {
        ...base,
        poi_category: ["hotel", "motel", "guest_house", "hostel", "campground"],
      };
    } else {
      return {
        ...base,
        poi_category: ["restaurant", "cafe", "fast_food", "bar", "bakery"],
      };
    }
  }
  if (newSegment.value.type === "Airplane")
    return { ...base, poi_category: ["airport"] };
  if (newSegment.value.type === "Train")
    return { ...base, poi_category: ["train_station"] };
  if (newSegment.value.type === "Bus")
    return { ...base, poi_category: ["bus_station"] };
  return { ...base, types: ["place", "locality", "poi", "address"] };
});

onMounted(async () => {
  handleMyLocation();
  // CARICAMENTO DATI DA PINIA
  if (
    tripStore.currentTrip &&
    tripStore.currentTrip.routes &&
    tripStore.currentTrip.routes.length > 0
  ) {
    savedSegments.value = JSON.parse(
      JSON.stringify(tripStore.currentTrip.routes),
    );

    const lastSeg = savedSegments.value[savedSegments.value.length - 1];
    if (lastSeg && lastSeg.toCoords) {
      mapCenter.value = lastSeg.toCoords;
      newSegment.value.fromName = lastSeg.to;
      newSegment.value.fromCoords = lastSeg.toCoords;

      setTimeout(() => {
        if (fromSearchBox.value) fromSearchBox.value.value = lastSeg.to;
      }, 500);
    }

    await waitForMap();

    savedSegments.value.forEach((seg) => {
      visualizeRoute(seg.fromCoords, seg.toCoords, seg.type, seg.id);
    });
  }
  if (mapContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (mapboxMapRef.value?.map) {
        mapboxMapRef.value.map.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.value);
  }
  if (tripStore.destinationFromDiscoverToPlan !== "") {
    const dest = tripStore.destinationFromDiscoverToPlan;
    newSegment.value.toName = dest;
    if (toSearchBox.value) {
      toSearchBox.value.value = dest;
    }
  }
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (resizeObserver) resizeObserver.disconnect();
  window.removeEventListener("languageChanged", handleLanguageChange);
});

watch(activeTab, () => {
  setTimeout(() => {
    if (mapboxMapRef.value?.map) mapboxMapRef.value.map.resize();
  }, 300);
});

function waitForMap() {
  return new Promise((resolve) => {
    const check = () => {
      if (
        mapboxMapRef.value &&
        mapboxMapRef.value.map &&
        mapboxMapRef.value.map.isStyleLoaded()
      ) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function handleMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        mapCenter.value = coords;
        userLocation.value = coords;
        if (mapboxMapRef.value?.flyTo) {
          mapboxMapRef.value.flyTo(coords, 15);
        }
      },
      (err) => console.warn("Location denied:", err),
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

  if (isEcoMode.value) {
    newSegment.value.toName = placeName;
    newSegment.value.toCoords = finalCoords;
    if (toSearchBox.value) toSearchBox.value.value = placeName;
    if (mapboxMapRef.value?.flyTo) mapboxMapRef.value.flyTo(finalCoords, 16);
    await getEcoRating(placeName, ecoCategory.value);
  } else {
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
}

function handleRetrieveFrom(e) {
  const feature = e.detail?.features?.[0];
  if (feature) {
    newSegment.value.fromName =
      feature.properties.name_preferred || feature.properties.name;
    const coords = feature.geometry.coordinates;
    newSegment.value.fromCoords = coords;
    if (mapboxMapRef.value?.flyTo) mapboxMapRef.value.flyTo(coords, 14);
  }
}

async function handleRetrieveTo(e) {
  const feature = e.detail?.features?.[0];
  if (feature) {
    const name = feature.properties.name_preferred || feature.properties.name;
    const coords = feature.geometry.coordinates;
    newSegment.value.toName = name;
    newSegment.value.toCoords = coords;

    if (mapboxMapRef.value?.flyTo) {
      mapboxMapRef.value.flyTo(coords, 16);
    }
    if (isEcoMode.value) {
      await getEcoRating(name, ecoCategory.value);
    }
  }
}

async function getEcoRating(name, category) {
  isCalculatingEco.value = true;
  currentEcoRating.value = null;
  setTimeout(() => {
    const lowerName = name.toLowerCase();
    let score = 3;
    if (category === "food") {
      if (lowerName.includes("mcdonald") || lowerName.includes("burger king"))
        score = 1;
      else if (lowerName.includes("vegan") || lowerName.includes("farm"))
        score = 5;
      else if (lowerName.includes("local")) score = 4;
    } else {
      if (lowerName.includes("resort")) score = 2;
      else if (lowerName.includes("b&b") || lowerName.includes("eco"))
        score = 5;
      else if (lowerName.includes("hotel")) score = 3;
    }
    currentEcoRating.value = score;
    newSegment.value.ecoScore = score;
    isCalculatingEco.value = false;
  }, 800);
}

async function geminiEstimation(mode, distanceKm, fuelType) {
  try {
    const payload = { mode, distance_km: distanceKm };
    if (mode === "Car") payload.fuel_type = fuelType;
    const response = await axios.post(
      "http://localhost:3000/api/plan/estimate",
      payload,
    );
    return response.data;
  } catch (err) {
    return { cost: "0.00", co2: "0.0", time: "N/A" };
  }
}

async function geocodeText(searchText) {
  if (!searchText) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchText,
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
  if (isEcoMode.value) {
    if (!newSegment.value.toCoords || !newSegment.value.toName) {
      alert("Please search for a place first.");
      return;
    }
    const segmentId = Date.now();
    const segment = {
      id: segmentId,
      from: "Trip Stop",
      to: newSegment.value.toName,
      fromCoords: newSegment.value.toCoords,
      toCoords: newSegment.value.toCoords,
      type: ecoCategory.value === "accommodation" ? "Hotel" : "Restaurant",
      date: newSegment.value.date,
      ecoScore: currentEcoRating.value,
      cost: "N/A",
      co2: "0.0",
      time: "",
      distance: 0,
      markers: [...tempMarkers],
    };
    tempMarkers = [];
    savedSegments.value.push(segment);
    visualizeRoute(
      segment.toCoords,
      segment.toCoords,
      segment.type,
      segment.id,
    );
    if (toSearchBox.value) toSearchBox.value.value = "";
    newSegment.value.toName = "";
    newSegment.value.ecoScore = null;
    currentEcoRating.value = null;
    return;
  }
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
    { units: "kilometers" },
  );
  const distanceKm = parseFloat(rawDistance.toFixed(2));
  const geminiData = await geminiEstimation(
    newSegment.value.type,
    distanceKm,
    newSegment.value.fuelType,
  );
  const segmentId = Date.now();
  const nextStartName = newSegment.value.toName;
  const nextStartCoords = newSegment.value.toCoords;

  // --- AGGIORNATO: Salvataggio nuovi campi ---
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
    gate: newSegment.value.gate, // Gate Partenza
    arrivalGate: newSegment.value.arrivalGate, // Gate Arrivo
    seat: newSegment.value.seat, // Posto
    travelClass: newSegment.value.travelClass, // Classe
    transportNumber: newSegment.value.transportNumber,
    markers: [...tempMarkers],
    cost: geminiData.cost,
    co2: geminiData.co2,
    time: geminiData.time,
    distance: distanceKm,
  };
  tempMarkers = [];
  savedSegments.value.push(segment);
  await visualizeRoute(
    segment.fromCoords,
    segment.toCoords,
    segment.type,
    segment.id,
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
  newSegment.value.arrivalGate = ""; // Reset
  newSegment.value.seat = ""; // Reset
  newSegment.value.travelClass = ""; // Reset
  newSegment.value.transportNumber = "";
}

async function openComparisonModal(index) {
  const segment = savedSegments.value[index];
  if (segment.type === "Hotel" || segment.type === "Restaurant") return;
  targetSegmentIndex.value = index;
  comparisonModalOpen.value = true;
  isLoadingComparison.value = true;
  pendingComparisonData.value = null;
  try {
    const response = await axios.post(
      "http://localhost:3000/api/plan/compare",
      { distance_km: segment.distance },
    );
    const allOptions = response.data;
    const alternatives = allOptions.filter((opt) => opt.mode !== segment.type);
    pendingComparisonData.value = alternatives;
  } catch (err) {
    alert("Could not load alternatives.");
    comparisonModalOpen.value = false;
  } finally {
    isLoadingComparison.value = false;
  }
}

async function confirmRouteSelection(selectionData) {
  if (targetSegmentIndex.value === null) return;
  const segment = savedSegments.value[targetSegmentIndex.value];
  segment.type = selectionData.mode;
  segment.cost = selectionData.cost;
  segment.co2 = selectionData.co2;
  segment.time = selectionData.time;
  await visualizeRoute(
    segment.fromCoords,
    segment.toCoords,
    segment.type,
    segment.id,
  );
  comparisonModalOpen.value = false;
  targetSegmentIndex.value = null;
  pendingComparisonData.value = null;
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
      marker.remove();
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

//TODO: Implementare salvataggio su DB
function saveTripToDB() {
  alert("Trip Saved!");
}

async function visualizeRoute(startCoords, endCoords, type, segmentId) {
  const map = mapboxMapRef.value?.map;
  if (!map) return;
  const routeId = `route-${segmentId}`;
  const pointId = `point-${segmentId}`;
  if (map.getLayer(routeId)) map.removeLayer(routeId);
  if (map.getSource(routeId)) map.removeSource(routeId);
  if (map.getLayer(pointId)) map.removeLayer(pointId);
  if (map.getSource(pointId)) map.removeSource(pointId);
  if (type === "Hotel" || type === "Restaurant") {
    const pointData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: endCoords },
        },
      ],
    };
    map.addSource(pointId, { type: "geojson", data: pointData });
    map.addLayer({
      id: pointId,
      type: "circle",
      source: pointId,
      paint: {
        "circle-radius": 8,
        "circle-color": type === "Restaurant" ? "#f59e0b" : "#8b5cf6",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
    map.flyTo({ center: endCoords, zoom: 13 });
    return;
  }
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
      if (type === "Train" || type === "Bus") profile = "driving";
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${accessToken}`,
      );
      const json = await res.json();
      if (json.routes?.[0]) routeGeoJSON = json.routes[0].geometry;
    }
  } catch (e) {
    routeGeoJSON = turf.lineString([startCoords, endCoords]).geometry;
  }
  if (!routeGeoJSON) return;
  map.addSource(routeId, {
    type: "geojson",
    data: { type: "Feature", geometry: routeGeoJSON },
  });
  let lineColor = "#10b981";
  if (type === "Airplane") lineColor = "#3b82f6";
  if (type === "Train") lineColor = "#f97316";
  if (type === "Bus") lineColor = "#8b5cf6"; // Purple for Bus
  map.addLayer({
    id: routeId,
    type: "line",
    source: routeId,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": lineColor,
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
      "circle-stroke-color": lineColor,
    },
  });
  const pathFeature = { type: "Feature", geometry: routeGeoJSON };
  const lineDistance = turf.length(pathFeature);
  const duration = 4000;
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
    }
  }
  const bbox = turf.bbox(pathFeature);
  map.fitBounds(bbox, { padding: 80, maxZoom: 10 });
  animationFrameId = requestAnimationFrame(animate);
}

// --- Funzioni per modifica segmenti ---
const editingSegmentIndex = ref(null);
const segmentToEdit = computed(() => {
  if (
    editingSegmentIndex.value !== null &&
    savedSegments.value[editingSegmentIndex.value]
  ) {
    return savedSegments.value[editingSegmentIndex.value];
  }
  return {};
});
function openEditModal(index) {
  editingSegmentIndex.value = index;
}

function handleSaveEdit(updatedData) {
  if (editingSegmentIndex.value !== null) {
    const original = savedSegments.value[editingSegmentIndex.value];
    Object.assign(original, updatedData);
    closeEditModal();
  }
}

function closeEditModal() {
  editingSegmentIndex.value = null;
}
</script>

<template>
  <div class="pb-20">
    <div
      class="flex flex-col md:flex-row justify-between items-center gap-4 bg-success rounded-2xl my-2"
    >
      <div class="flex gap-2 items-center">
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight p-2">
          {{ t("plan.ecoTravelPlanner") }}
        </h2>
      </div>
      <div class="tabs tabs-boxed rounded-xl p-1">
        <a
          class="tab rounded-lg"
          :class="{
            'tab-active bg-white text-green-700': activeTab === 'world',
          }"
          @click="activeTab = 'world'"
          >{{ t("plan.planTrip") }}</a
        >
        <a
          class="tab rounded-lg"
          :class="{
            'tab-active bg-white text-green-700': activeTab === 'city',
          }"
          @click="activeTab = 'city'"
          >{{ t("plan.navigateCity") }}</a
        >
      </div>
    </div>

    <div
      class="grid gap-5 h-auto lg:min-h-[85vh]"
      :class="
        activeTab === 'world'
          ? 'grid-cols-1 lg:grid-cols-[24rem_1fr] lg:grid-rows-[auto_1fr]'
          : 'grid-cols-1 lg:grid-rows-1'
      "
    >
      <div
        v-if="activeTab === 'world'"
        class="lg:col-start-1 lg:row-start-1 card bg-white border border-green-100 shadow-lg rounded-2xl flex-none"
      >
        <div class="card-body p-5">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-gray-700 flex items-center gap-2">
              <Plus class="w-5 h-5 text-green-600" />
              {{ t("plan.addTripSegment") }}
            </h3>
            <div
              class="flex items-center gap-2 cursor-pointer bg-gray-100 p-1 rounded-full"
              @click="isEcoMode = !isEcoMode"
            >
              <span
                class="text-[10px] font-bold uppercase pl-2"
                :class="!isEcoMode ? 'text-green-600' : 'text-gray-400'"
                >Travel</span
              >
              <component
                :is="isEcoMode ? ToggleRight : ToggleLeft"
                class="w-6 h-6 text-green-600 transition-all"
              />
              <span
                class="text-[10px] font-bold uppercase pr-2"
                :class="isEcoMode ? 'text-green-600' : 'text-gray-400'"
                >Eat/Stay</span
              >
            </div>
          </div>

          <div
            class="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100 relative"
          >
            <div class="space-y-1" v-if="!isEcoMode">
              <label class="text-xs font-bold text-gray-500 uppercase">{{
                t("plan.from")
              }}</label>
              <div
                class="rounded-lg overflow-hidden border border-gray-200 bg-white"
              >
                <mapbox-search-box
                  ref="fromSearchBox"
                  :access-token="accessToken"
                  :options="searchOptions"
                  :placeholder="t('plan.searchStartLocation')"
                  @retrieve="handleRetrieveFrom"
                ></mapbox-search-box>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-500 uppercase">{{
                isEcoMode ? "Find Place" : t("plan.to")
              }}</label>
              <div
                class="rounded-lg overflow-hidden border border-gray-200 bg-white"
              >
                <mapbox-search-box
                  ref="toSearchBox"
                  :access-token="accessToken"
                  :options="searchOptions"
                  :placeholder="
                    isEcoMode
                      ? ecoCategory === 'accommodation'
                        ? 'Search hotels...'
                        : 'Search restaurants...'
                      : t('plan.searchDestination')
                  "
                  @retrieve="handleRetrieveTo"
                ></mapbox-search-box>
              </div>
            </div>
            <div v-if="isEcoMode" class="grid grid-cols-2 gap-2">
              <button
                @click="ecoCategory = 'accommodation'"
                class="btn btn-sm"
                :class="
                  ecoCategory === 'accommodation'
                    ? 'btn-primary text-white'
                    : 'btn-outline bg-white border-gray-200 text-gray-500'
                "
              >
                <Hotel class="w-4 h-4 mr-1" /> Stay
              </button>
              <button
                @click="ecoCategory = 'food'"
                class="btn btn-sm"
                :class="
                  ecoCategory === 'food'
                    ? 'btn-warning text-white'
                    : 'btn-outline bg-white border-gray-200 text-gray-500'
                "
              >
                <Utensils class="w-4 h-4 mr-1" /> Eat
              </button>
            </div>
            <div
              v-if="isEcoMode && (isCalculatingEco || currentEcoRating)"
              class="p-3 bg-white rounded-lg border border-green-100 shadow-sm transition-all"
            >
              <div
                v-if="isCalculatingEco"
                class="flex items-center justify-center gap-2 text-gray-400 text-xs py-2"
              >
                <Loader2 class="w-4 h-4 animate-spin text-green-500" /> AI
                Evaluating Eco Level...
              </div>
              <div v-else class="flex flex-col items-center">
                <div
                  class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1"
                >
                  Eco Rating
                </div>
                <div class="flex gap-1">
                  <Leaf
                    v-for="n in 5"
                    :key="n"
                    class="w-6 h-6"
                    :class="
                      n <= currentEcoRating
                        ? 'text-green-500 fill-green-500'
                        : 'text-gray-200'
                    "
                  />
                </div>
              </div>
            </div>
            <div v-if="!isEcoMode" class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase">{{
                  t("plan.mode")
                }}</label>
                <select
                  v-model="newSegment.type"
                  class="select select-sm select-bordered bg-white w-full rounded-lg mt-1"
                >
                  <option value="Airplane">
                    {{ t("plan.transportTypes.airplane") }}
                  </option>
                  <option value="Train">
                    {{ t("plan.transportTypes.train") }}
                  </option>
                  <option value="Car">
                    {{ t("plan.transportTypes.car") }}
                  </option>
                  <option value="Bus">
                    {{ t("plan.transportTypes.bus") }}
                  </option>
                  <option value="Walking">
                    {{ t("plan.transportTypes.walking") }}
                  </option>
                  <option value="Cycling">
                    {{ t("plan.transportTypes.cycling") }}
                  </option>
                </select>
              </div>
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase">{{
                  t("plan.date")
                }}</label
                ><input
                  v-model="newSegment.date"
                  type="date"
                  class="input input-sm input-bordered bg-white w-full rounded-lg mt-1"
                />
              </div>
            </div>

            <div
              v-if="!isEcoMode && newSegment.type === 'Airplane'"
              class="grid grid-cols-2 gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100"
            >
              <input
                v-model="newSegment.transportNumber"
                :placeholder="t('plan.flightDetails')"
                class="input input-sm input-bordered w-full rounded-md"
              />
              <select
                v-model="newSegment.travelClass"
                class="select select-sm select-bordered w-full rounded-md"
              >
                <option value="" disabled selected>Select Class</option>
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Prem. Eco</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>

              <input
                v-model="newSegment.gate"
                placeholder="Dep Gate"
                class="input input-sm input-bordered w-full rounded-md"
              />
              <input
                v-model="newSegment.arrivalGate"
                placeholder="Arr Gate"
                class="input input-sm input-bordered w-full rounded-md"
              />

              <input
                v-model="newSegment.seat"
                placeholder="Seat (e.g. 12A)"
                class="input input-sm input-bordered w-full rounded-md col-span-2"
              />

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

            <div
              v-if="
                !isEcoMode &&
                (newSegment.type === 'Train' || newSegment.type === 'Bus')
              "
              class="grid grid-cols-2 gap-2 p-2 rounded-lg"
              :class="
                newSegment.type === 'Train'
                  ? 'bg-orange-50 border border-orange-100'
                  : 'bg-purple-50 border border-purple-100'
              "
            >
              <input
                v-model="newSegment.transportNumber"
                :placeholder="newSegment.type === 'Train' ? 'Train #' : 'Bus #'"
                class="input input-sm input-bordered w-full col-span-2 rounded-md"
              />
              <select
                v-model="newSegment.travelClass"
                class="select select-sm select-bordered w-full rounded-md"
              >
                <option value="" disabled selected>Class</option>
                <option value="Standard">Standard</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
                <option v-if="newSegment.type === 'Bus'" value="Sleeper">
                  Sleeper
                </option>
              </select>
              <input
                v-model="newSegment.seat"
                placeholder="Seat"
                class="input input-sm input-bordered w-full rounded-md"
              />

              <input
                v-model="newSegment.gate"
                :placeholder="
                  newSegment.type === 'Train' ? 'Dep Platform' : 'Dep Bay'
                "
                class="input input-sm input-bordered w-full rounded-md"
              />
              <input
                v-model="newSegment.arrivalGate"
                :placeholder="
                  newSegment.type === 'Train' ? 'Arr Platform' : 'Arr Bay'
                "
                class="input input-sm input-bordered w-full rounded-md"
              />

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

            <div
              v-if="!isEcoMode && newSegment.type === 'Car'"
              class="space-y-1"
            >
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
            <div class="mt-2 pt-2 border-t border-gray-200">
              <div class="text-[10px] text-gray-400 font-bold mb-2 uppercase">
                Drag Markers to Map
              </div>
              <div class="flex gap-4 overflow-x-auto pb-1">
                <div
                  v-for="marker in draggableMarkers"
                  :key="marker.id"
                  draggable="true"
                  @dragstart="onDragStart($event, marker)"
                  class="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform p-1 border rounded bg-gray-50 shrink-0"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    :style="{
                      fill: marker.color,
                      filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))',
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
            <button
              @click="addSegment"
              class="btn btn-sm w-full text-white rounded-lg shadow-sm mt-2"
              :class="isEcoMode ? 'btn-primary' : 'btn-success'"
            >
              {{ isEcoMode ? "Add Stop to Itinerary" : "Add Segment" }}
            </button>
          </div>
        </div>
      </div>

      <div
        ref="mapContainerRef"
        class="relative rounded-3xl overflow-hidden shadow-xl border border-green-100"
        :class="
          activeTab === 'world'
            ? 'lg:col-start-2 lg:row-start-1 lg:row-span-2 h-[50vh] lg:h-full'
            : 'lg:col-start-1 lg:row-start-1 lg:col-span-1 h-[65vh] lg:h-full'
        "
      >
        <div
          class="absolute inset-0"
          :class="{ 'hide-directions': activeTab === 'world' }"
          @dragover.prevent
          @drop="onMapDrop"
        >
          <MapboxMap
            ref="mapboxMapRef"
            :center="mapCenter"
            :zoom="mapZoom"
            class="w-full h-full"
          />
          <div
            class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
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
            class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
          >
            <button
              class="btn btn-sm text-gray-800 gap-2 rounded-full shadow-lg"
            >
              {{ t("common.save") }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'world'"
        class="lg:col-start-1 lg:row-start-2 card bg-white border border-green-100 shadow-lg flex flex-col min-h-0 rounded-2xl"
      >
        <div class="card-body p-4 lg:p-5 overflow-y-auto custom-scrollbar">
          <div class="divider my-0 text-xs text-gray-400 mb-4">
            {{ t("plan.yourItinerary") }}
          </div>
          <div class="space-y-3">
            <div
              v-if="savedSegments.length === 0"
              class="text-center py-8 text-gray-400 text-sm italic"
            >
              {{ t("plan.noTripsAdded") }}
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
                  </div>
                  <div class="text-sm">
                    <div
                      v-if="seg.type !== 'Hotel' && seg.type !== 'Restaurant'"
                      class="font-bold text-gray-800"
                    >
                      {{ seg.from }} <span class="text-gray-400 mx-1">➜</span>
                      {{ seg.to }}
                    </div>
                    <div v-else class="font-bold text-gray-800">
                      {{ seg.to }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ seg.date }}
                      <span
                        v-if="seg.distance"
                        class="font-bold text-green-700 ml-1"
                        >• {{ seg.distance }} km</span
                      >
                      <span
                        v-if="seg.time"
                        class="mt-1 text-gray-400 flex items-center"
                      >
                        <Clock class="w-3 h-3 mr-1" /> {{ seg.time }}
                      </span>
                      <span v-if="seg.ecoScore" class="flex gap-0.5 mt-1"
                        ><Leaf
                          v-for="n in 5"
                          :key="n"
                          class="w-3 h-3"
                          :class="
                            n <= seg.ecoScore
                              ? 'text-green-500 fill-green-500'
                              : 'text-gray-200'
                          "
                      /></span>
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
                v-if="
                  seg.type === 'Airplane' ||
                  seg.type === 'Train' ||
                  seg.type === 'Bus'
                "
                class="ml-12 mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-100"
              >
                <div
                  v-if="seg.transportNumber"
                  class="col-span-2 font-bold text-gray-700"
                >
                  {{ seg.transportNumber }}
                </div>
                <div v-if="seg.travelClass" class="flex items-center gap-1">
                  <Ticket class="w-3 h-3" /> {{ seg.travelClass }}
                </div>
                <div v-if="seg.seat" class="flex items-center gap-1">
                  <Armchair class="w-3 h-3" /> {{ seg.seat }}
                </div>
                <div v-if="seg.gate" class="flex items-center gap-1">
                  <DoorOpen class="w-3 h-3" /> Dep: {{ seg.gate }}
                </div>
                <div v-if="seg.arrivalGate" class="flex items-center gap-1">
                  <DoorOpen class="w-3 h-3" /> Arr: {{ seg.arrivalGate }}
                </div>
              </div>

              <div
                v-if="seg.type !== 'Hotel' && seg.type !== 'Restaurant'"
                class="flex items-center justify-between mt-2 ml-12"
              >
                <div class="flex gap-2">
                  <div
                    class="flex items-center text-xs font-medium bg-gray-100 px-2 py-1 rounded"
                  >
                    <Euro class="w-3 h-3 mr-1 text-gray-500" /> {{ seg.cost }}
                  </div>
                  <div
                    class="flex items-center text-xs font-medium bg-green-100 px-2 py-1 rounded text-green-700"
                  >
                    <Leaf class="w-3 h-3 mr-1" /> {{ seg.co2 }} kg
                  </div>
                </div>
                <button
                  @click="openEditModal(idx)"
                  class="btn btn-xs rounded-full gap-1 border border-gray-200 bg-white text-gray-500 shadow-sm"
                >
                  <Edit class="w-3 h-3" />{{ t("common.edit") }}
                </button>
                <button
                  @click="openComparisonModal(idx)"
                  class="btn btn-xs rounded-full gap-1 border border-gray-200 bg-white text-gray-500 shadow-sm"
                >
                  <Shuffle class="w-3 h-3" /> {{ t("plan.compare") }}
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
            <Save class="w-4 h-4" /> {{ t("plan.saveFullTrip") }}
          </button>
        </div>
      </div>
    </div>

    <ComparisonModal
      :is-open="comparisonModalOpen"
      :is-loading="isLoadingComparison"
      :segment-data="savedSegments[targetSegmentIndex]"
      :alternatives="pendingComparisonData"
      @close="comparisonModalOpen = false"
      @confirm="confirmRouteSelection"
    />
    <EditTripModal
      :is-open="editingSegmentIndex !== null"
      :segment-data="segmentToEdit"
      @close="closeEditModal"
      @save="handleSaveEdit"
    />
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
