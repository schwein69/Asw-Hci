<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const props = defineProps({
  center: {
    type: Array,
    default: () => [-74.5, 40],
  },
  zoom: {
    type: Number,
    default: 9,
  },
});

const mapContainer = ref(null);
const isLoading = ref(true);
const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const map = shallowRef(null);

const addMarker = (lngLat, options = {}) => {
  if (!map.value) return null;
  const marker = new mapboxgl.Marker(options)
    .setLngLat(lngLat)
    .addTo(map.value);
  return marker;
};

const flyTo = (center, zoom = 15) => {
  if (!map.value) return;
  map.value.flyTo({
    center,
    zoom,
    duration: 2000,
  });
};

defineExpose({
  addMarker,
  flyTo,
  map,
});

onMounted(() => {
  if (!accessToken) {
    console.error(
      "Mapbox token not found. Please set VITE_MAPBOX_TOKEN in .env file"
    );
    isLoading.value = false;
    return;
  }

  mapboxgl.accessToken = accessToken;

  try {
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: "mapbox://styles/mapbox/standard",
      center: props.center,
      zoom: props.zoom,
      attributionControl: true,
      crossSourceCollation: true,
    });

    map.value.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.value.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    map.value.on("load", () => {
      map.value.addSource("mapbox-traffic", {
        type: "vector",
        url: "mapbox://mapbox.mapbox-traffic-v1",
      });
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

    map.value.on("error", (error) => {
      console.error("Mapbox error:", error);
      isLoading.value = false;
    });
  } catch (error) {
    console.error("Error initializing map:", error);
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

  if (visibility === "visible") {
    map.value.setLayoutProperty("traffic-layer", "visibility", "none");
  } else {
    map.value.setLayoutProperty("traffic-layer", "visibility", "visible");
  }
};
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>

    <div v-if="isLoading" class="map-loading">
      <div class="loading loading-spinner text-success"></div>
    </div>

    <div class="map-overlay">
      <button @click="toggleTraffic" class="btn btn-sm btn-neutral flex gap-2">
        🚗 Toggle Traffic
      </button>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
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
  top: 4px;
  left: 4px;
  pointer-events: none;
  z-index: 1;
}

.map-overlay > * {
  pointer-events: auto;
}
</style>
