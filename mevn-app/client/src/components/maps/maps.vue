<script>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map as MapIcon } from "lucide-vue-next";

export default {
  name: "MapboxMap",
  components: { MapIcon },
  props: {
    center: {
      type: Array,
      default: () => [-74.5, 40],
    },
    zoom: {
      type: Number,
      default: 9,
    },
  },
  data() {
    return {
      map: null,
      isLoading: true,
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
    };
  },
  mounted() {
    if (!this.accessToken) {
      console.error(
        "Mapbox token not found. Please set VITE_MAPBOX_TOKEN in .env file"
      );
      this.isLoading = false;
      return;
    }

    mapboxgl.accessToken = this.accessToken;

    try {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: "mapbox://styles/mapbox/standard",
        center: this.center,
        zoom: this.zoom,
        attributionControl: true,
        crossSourceCollation: true,
      });

      // Add navigation controls
      this.map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add geolocate control
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right"
      );

      this.map.on("load", () => {
        console.log("Mapbox map loaded successfully");
        this.isLoading = false;
      });

      this.map.on("error", (error) => {
        console.error("Mapbox error:", error);
        this.isLoading = false;
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      this.isLoading = false;
    }
  },

  unmounted() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },

  methods: {
    addMarker(lngLat, options = {}) {
      if (!this.map) return null;
      const marker = new mapboxgl.Marker(options)
        .setLngLat(lngLat)
        .addTo(this.map);
      return marker;
    },

    flyTo(center, zoom = 15) {
      if (!this.map) return;
      this.map.flyTo({
        center,
        zoom,
        duration: 2000,
      });
    },
  },
};
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="map-loading">
      <div class="loading loading-spinner text-success"></div>
    </div>

    <!-- Optional: Overlay UI elements with daisyUI -->
    <div class="map-overlay">
      <div class="badge badge-success gap-2">
        <MapIcon class="w-4 h-4" />
        <span>Map View</span>
      </div>
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

.map-overlay .badge {
  pointer-events: auto;
}
</style>
