<script setup>
import { ref } from "vue";
import { Search, MapPin, Navigation2 } from "lucide-vue-next";
import MapboxMap from "./maps/maps.vue";

const searchQuery = ref("");
const mapCenter = ref([-74.5, 40]);
const mapZoom = ref(9);
const mapboxMap = ref(null);

function handleSearch() {
  if (searchQuery.value.trim()) {
    console.log("Searching for:", searchQuery.value);
    // TODO: Implement search functionality
  }
}

function handleMyLocation() {
  console.log("Getting user location...");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      mapCenter.value = [longitude, latitude];
      // call child's flyTo method if available
      if (mapboxMap.value && typeof mapboxMap.value.flyTo === "function") {
        try {
          mapboxMap.value.flyTo([longitude, latitude], 15);
        } catch (e) {
          console.warn("flyTo failed:", e);
        }
      }
    });
  }
}

function handleRecentRoutes() {
  console.log("Loading recent routes...");
  // TODO: Implement recent routes functionality
}

function handleSavedPlaces() {
  console.log("Loading saved places...");
  // TODO: Implement saved places functionality
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search Section -->
    <div class="flex gap-3">
      <div class="join flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Where to next?"
          class="input input-bordered join-item w-full focus:outline-none focus:ring-2 focus:ring-success"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="btn btn-success join-item gap-2">
          <Search class="w-4 h-4" />
          Search
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div
      class="card bg-white border border-green-100 shadow-sm overflow-hidden"
    >
      <div class="h-[500px] w-full">
        <MapboxMap ref="mapboxMap" :center="mapCenter" :zoom="mapZoom" />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <button
        @click="handleMyLocation"
        class="btn btn-success btn-outline btn-sm gap-2"
      >
        <MapPin class="w-4 h-4" />
        My Location
      </button>
      <button
        @click="handleRecentRoutes"
        class="btn btn-success btn-outline btn-sm gap-2"
      >
        <Navigation2 class="w-4 h-4" />
        Recent Routes
      </button>
      <button
        @click="handleSavedPlaces"
        class="btn btn-success btn-outline btn-sm gap-2"
      >
        <Navigation2 class="w-4 h-4" />
        Saved Places
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
