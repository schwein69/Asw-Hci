<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

const props = defineProps({
  center: { type: Array, default: () => [-74.5, 40] },
  zoom: { type: Number, default: 9 },
});

const mapContainer = ref(null);
const isLoading = ref(true);
const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const map = shallowRef(null);

let directions = null;

const addMarker = (lngLat, options = {}) => {
  if (!map.value) return null;
  return new mapboxgl.Marker(options).setLngLat(lngLat).addTo(map.value);
};

const flyTo = (center, zoom = 15) => {
  if (!map.value) return;
  map.value.flyTo({ center, zoom, duration: 2000 });
};

defineExpose({ addMarker, flyTo, map });

const clearRoute = () => {
  if (directions) {
    directions.removeRoutes();
    directions.setOrigin("");
    directions.setDestination("");
  }
  const inputs = document.querySelectorAll(".mapboxgl-ctrl-geocoder input");
  inputs.forEach((input) => {
    input.value = "";
  });
};

onMounted(() => {
  if (!accessToken) {
    isLoading.value = false;
    return;
  }
  mapboxgl.accessToken = accessToken;

  try {
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: "mapbox://styles/mapbox/streets-v12",
      center: props.center,
      zoom: props.zoom,
      attributionControl: true,
      crossSourceCollation: true,
    });

    map.value.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.value.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    // 3. Directions Setup
    directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving-traffic",
      alternatives: true,
      controls: { inputs: true, instructions: true, profileSwitcher: true },
    });
    map.value.addControl(directions, "top-left");

    map.value.on("load", () => {
      // Add Traffic Source
      map.value.addSource("mapbox-traffic", {
        type: "vector",
        url: "mapbox://mapbox.mapbox-traffic-v1",
      });
      // Add Traffic Layer
      map.value.addLayer({
        id: "traffic-layer",
        type: "line",
        source: "mapbox-traffic",
        "source-layer": "traffic",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-width": 2,
          "line-color": [
            "case",
            ["==", ["get", "congestion"], "low"],
            "#1aad5b",
            ["==", ["get", "congestion"], "moderate"],
            "#eeb830",
            ["==", ["get", "congestion"], "heavy"],
            "#e84236",
            ["==", ["get", "congestion"], "severe"],
            "#8b201d",
            "#000000",
          ],
        },
      });
      isLoading.value = false;
    });
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

const toggleTraffic = () => {
  if (!map.value) return;
  const visibility = map.value.getLayoutProperty("traffic-layer", "visibility");
  map.value.setLayoutProperty(
    "traffic-layer",
    "visibility",
    visibility === "visible" ? "none" : "visible"
  );
};
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>

    <div v-if="isLoading" class="map-loading">
      <div class="loading loading-spinner text-success"></div>
    </div>

    <div class="map-overlay">
      <div class="flex flex-col gap-2">
        <button
          @click="toggleTraffic"
          class="btn btn-sm btn-neutral shadow-lg w-full"
        >
          Traffic
        </button>
        <button
          @click="clearRoute"
          class="btn btn-sm btn-error text-white shadow-lg w-full"
        >
          Clear Route
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
}
.map-container {
  width: 100%;
  height: 100%;
}
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.map-overlay {
  position: absolute;
  top: 140px;
  right: 10px;
  pointer-events: none;
  z-index: 20;
}
.map-overlay > * {
  pointer-events: auto;
}

:deep(.mapboxgl-ctrl-directions) {
  min-width: 250px;
  max-width: 90vw;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
:deep(.mapboxgl-control-container) {
  z-index: 10 !important;
}
</style>
