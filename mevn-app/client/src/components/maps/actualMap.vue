<script setup>
import { onMounted, ref, watch, onUnmounted } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

const props = defineProps({
  routeGeoJson: { type: Object, default: null },
  markersGeoJson: { type: Object, default: null },
});

const mapContainer = ref(null);
let map = null;
const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

onMounted(() => {
  if (!accessToken) return;
  mapboxgl.accessToken = accessToken;

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/light-v11",
    center: [10.4515, 51.1657],
    zoom: 4,
    pitch: 0,
    attributionControl: false,
  });

  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }),
    "bottom-right"
  );

  map.on("load", () => {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
    updateMapData();
  });
});

onUnmounted(() => {
  if (map) map.remove();
});

watch(
  () => [props.routeGeoJson, props.markersGeoJson],
  () => {
    if (map && map.isStyleLoaded()) updateMapData();
  },
  { deep: true }
);

function updateMapData() {
  if (!map) return;

  const routeSourceId = "route-source";
  const routeLayerId = "route-layer";

  if (map.getSource(routeSourceId)) {
    map
      .getSource(routeSourceId)
      .setData(
        props.routeGeoJson || { type: "FeatureCollection", features: [] }
      );
  } else {
    map.addSource(routeSourceId, {
      type: "geojson",
      data: props.routeGeoJson || { type: "FeatureCollection", features: [] },
      lineMetrics: true,
    });

    map.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeSourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-width": 4,
        "line-opacity": 0.8,
        // CONDITIONAL COLORING
        "line-color": [
          "match",
          ["get", "completed"],
          "yes",
          "#9ca3af", // Gray if completed
          "#10b981", // Green if active
        ],
      },
    });
  }

  const markersSourceId = "markers-source";
  const markersCircleId = "markers-circle";
  const markersTextId = "markers-text";

  if (map.getSource(markersSourceId)) {
    map
      .getSource(markersSourceId)
      .setData(
        props.markersGeoJson || { type: "FeatureCollection", features: [] }
      );
  } else {
    map.addSource(markersSourceId, {
      type: "geojson",
      data: props.markersGeoJson || { type: "FeatureCollection", features: [] },
    });

    map.addLayer({
      id: markersCircleId,
      type: "circle",
      source: markersSourceId,
      paint: {
        "circle-radius": 14,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-color": [
          "match",
          ["get", "status"],
          "done",
          "#9ca3af", // Gray marker if done
          "#059669", // Green marker if active
        ],
      },
    });

    map.addLayer({
      id: markersTextId,
      type: "symbol",
      source: markersSourceId,
      layout: {
        "text-field": ["get", "number"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 14,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: { "text-color": "#ffffff" },
    });
  }

  if (props.routeGeoJson?.features?.length > 0) {
    const bbox = turf.bbox(props.routeGeoJson);
    map.fitBounds(bbox, { padding: 80, maxZoom: 8 });
  }
}

defineExpose({
  toggle3D: (enable) => {
    if (!map) return;
    if (enable) {
      map.easeTo({ pitch: 60, duration: 1000 });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
    } else {
      map.easeTo({ pitch: 0, duration: 1000 });
      map.setTerrain(null);
    }
  },
});
</script>

<template>
  <div ref="mapContainer" class="h-full w-full relative outline-none"></div>
</template>

<style scoped>
.mapboxgl-ctrl-logo {
  display: none !important;
}
</style>
