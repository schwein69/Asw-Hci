<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Edit,
  AlertCircle,
} from "lucide-vue-next";
import actualMap from "./maps/actualMap.vue";
import * as turf from "@turf/turf";
import { getLanguage, t as translate } from "../utils/translations.js";
import { useRouter } from "vue-router";
import { useTripStore } from "../data/tripStore.js";
import TripStats from "./template/TripStats.vue";

const router = useRouter();
const tripStore = useTripStore();
const language = ref(getLanguage());
const t = computed(() => (key) => translate(key, language.value));

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id || user.id;
};

// --- DATA ---
const trips = ref([]);

const fetchActiveTrips = async () => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/trips/active/${userId}`,
    );
    const activeTrips = await response.json();

    if (activeTrips && activeTrips.length > 0) {
      trips.value = activeTrips.map((trip) => ({
        id: trip._id,
        name: trip.title,
        routes: trip.itinerary.map((segment, index) => {
          const rawMode =
            segment.transportMode || segment.category || "General";
          const displayMode =
            rawMode.charAt(0).toUpperCase() + rawMode.slice(1);

          return {
            id: segment._id,
            from: segment.fromLocation.name,
            to: segment.toLocation.name,
            type: displayMode,
            transportName: displayMode,
            transportCode: segment.transportNumber || "N/A",
            date: new Date(segment.startTime).toLocaleDateString(),
            depTime: new Date(segment.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            arrTime: new Date(segment.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: `${Math.round(segment.estimatedDurationMinutes / 60)}h ${
              segment.estimatedDurationMinutes % 60
            }m`,
            distance: segment.distanceKm,
            co2: segment.co2 || 0,
            cost: segment.price,
            startCoords: segment.fromLocation.coordinates,
            endCoords: segment.toLocation.coordinates,
            completed: segment.isCompleted,
            seat: segment.seatNumber || null,
            gate: segment.gate || null,
            arrivalGate: segment.arrivalGate || null,
            class: segment.class || null,
          };
        }),
      }));
    } else {
      trips.value = [];
    }
  } catch (error) {
    console.error("❌ Failed to fetch active trips:", error);
    trips.value = [];
  }
};

const getTripStats = (trip) => {
  return {
    totalDestinations: trip.routes.length + 1,
    carbonFootprint: trip.routes.reduce((acc, curr) => acc + curr.co2, 0),
    totalCost: trip.routes.reduce((acc, curr) => acc + curr.cost, 0),
    totalDistance: trip.routes.reduce(
      (acc, curr) => acc + (curr.distance || 0),
      0,
    ),
  };
};

const isTripComplete = (trip) => {
  if (!trip.routes || trip.routes.length === 0) return false;
  return trip.routes.every((r) => r.completed);
};

const routeGeoJSON = computed(() => {
  const features = [];
  trips.value.forEach((trip) => {
    trip.routes.forEach((seg) => {
      const start = turf.point(seg.startCoords);
      const end = turf.point(seg.endCoords);
      const curvedLine = turf.greatCircle(start, end, { npoints: 50 });
      curvedLine.properties = { completed: seg.completed ? "yes" : "no" };
      features.push(curvedLine);
    });
  });
  return { type: "FeatureCollection", features };
});

const markersGeoJSON = computed(() => {
  const features = [];
  trips.value.forEach((trip) => {
    if (trip.routes.length === 0) return;
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: trip.routes[0].startCoords },
      properties: {
        name: trip.routes[0].from,
        status: trip.routes[0].completed ? "done" : "pending",
      },
    });
    trip.routes.forEach((seg) => {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: seg.endCoords },
        properties: {
          name: seg.to,
          status: seg.completed ? "done" : "pending",
        },
      });
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

const removeRoute = async (tripId, routeId) => {
  const tripIndex = trips.value.findIndex((t) => t.id === tripId);
  if (tripIndex === -1) return;

  const trip = trips.value[tripIndex];

  // Check if this is the last segment
  const isLastSegment = trip.routes.length === 1;

  //  Snapshot for rollback
  const originalRoutes = [...trip.routes];
  const originalTrip = trip;
  if (confirm(`Are you sure you want to delete?`)) {
    if (isLastSegment) {
      // Remove the ENTIRE TRIP from the list
      trips.value.splice(tripIndex, 1);
    } else {
      // Remove ONLY the segment
      trip.routes = trip.routes.filter((s) => s.id !== routeId);
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/trips/${tripId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            segmentId: isLastSegment ? null : routeId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      console.log(isLastSegment ? "Trip deleted" : "Segment deleted");
    } catch (error) {
      console.error("Error removing:", error);

      if (isLastSegment) {
        trips.value.splice(tripIndex, 0, originalTrip);
      } else {
        trip.routes = originalRoutes;
      }
      alert("Failed to delete. Please check connection.");
    }
  }
};

const toggleComplete = async (tripId, segmentId) => {
  const trip = trips.value.find((t) => t.id === tripId);
  if (!trip) return;
  const seg = trip.routes.find((t) => t.id === segmentId);
  if (!seg) return;
  const previousState = seg.completed;
  seg.completed = !seg.completed;

  try {
    const response = await fetch(
      `http://localhost:3000/api/trips/${tripId}/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segmentId: seg.id,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update segment");
    }
  } catch (error) {
    console.error("Error toggling status:", error);
    seg.completed = previousState;
  }
};

function completeTrip(tripId) {
  const trip = trips.value.find((t) => t.id === tripId);
  if (!trip || !isTripComplete(trip)) return;
  if (confirm(`Are you sure you want to complete "${trip.name}"?`)) {
    fetch(`http://localhost:3000/api/trips/complete/${tripId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to complete trip");
        alert(`Trip "${trip.name}" marked as completed!`);
      })
      .catch((err) => alert("Error: " + err.message));
    trips.value = trips.value.filter((t) => t.id !== tripId);
  }
}

function modifyTrip(tripId) {
  const tripToPass = trips.value.find((t) => t.id === tripId);
  if (tripToPass) {
    tripStore.setTripToEdit(tripToPass);
    router.push({ name: "Plan" });
  }
}

onMounted(() => {
  language.value = getLanguage();
  window.addEventListener("languageChanged", handleLanguageChange);
  fetchActiveTrips();
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});
</script>

<template>
  <div class="space-y-12">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2
          class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"
        >
          <Clock class="w-6 h-6 text-green-600" />
          {{ t("world.title") }}
        </h2>
        <p class="text-gray-500 dark:text-gray-300 text-sm">
          {{ t("world.description") }}
        </p>
      </div>
    </div>

    <div
      v-for="trip in trips"
      :key="trip.id"
      class="border-b-4 border-gray-100 pb-8 last:border-0"
    >
      <div class="mb-4 px-1">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ trip.name }}
        </h3>
        <div class="text-xs text-gray-400 font-mono">ID: #{{ trip.id }}</div>
      </div>

      <TripStats
        :trip="trip"
        :stats="getTripStats(trip)"
        :t="t"
        @toggle-complete="toggleComplete"
        @remove-route="removeRoute"
      />

      <div
        class="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2"
      >
        <div class="flex-1">
          <div
            v-if="!isTripComplete(trip)"
            class="text-xs text-orange-500 font-medium flex items-center gap-1 animate-pulse"
          >
            <AlertCircle class="w-3 h-3" />
            {{ t("world.finishSegments") }}
          </div>
          <div
            v-else
            class="text-xs text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle2 class="w-3 h-3" />
            {{ t("world.allSegmentsDone") }}
          </div>
        </div>

        <div class="flex gap-3 w-full md:w-auto">
          <button
            @click="modifyTrip(trip.id)"
            class="btn btn-outline btn-success gap-2 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <Edit class="w-4 h-4" /> {{ t("world.modifyTrip") }}
          </button>

          <button
            @click="completeTrip(trip.id)"
            :disabled="!isTripComplete(trip)"
            class="btn text-white gap-2 rounded-xl shadow-md font-bold transition-all duration-300"
            :class="
              isTripComplete(trip)
                ? 'btn-success hover:scale-105'
                : 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
            "
          >
            <CheckCircle2 class="w-5 h-5" /> {{ t("world.completed") }}
          </button>
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
            <MapPin class="w-5 h-5" /> {{ t("world.interactiveRouteMap") }}
          </h3>
          <p class="text-gray-500 text-xs">
            {{ t("world.visualizeJourney") }}
          </p>
        </div>
        <button
          @click="toggle3D"
          class="btn btn-xs sm:btn-sm btn-outline btn-success gap-2 font-bold rounded-full"
        >
          <component :is="is3D ? Minimize2 : Maximize2" class="w-4 h-4" />
          {{ is3D ? "2D" : "3D" }} {{ t("world.view") }}
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
            {{ t("world.reset") }}
          </button>
        </div>
      </div>

      <div
        class="p-3 bg-green-50 text-[10px] text-green-700 flex justify-between items-center font-medium"
      >
        <div class="flex gap-4">
          <span class="flex items-center gap-1"
            ><MousePointerClick class="w-3 h-3" />
            {{ t("world.useControlsToNavigate") }}</span
          >
          <span class="flex items-center gap-1"
            ><Maximize2 class="w-3 h-3" /> {{ is3D ? "3D" : "2D" }}
            {{ t("world.view") }} {{ t("world.active") }}</span
          >
        </div>
        <span>{{ trips.length }} </span>
      </div>
    </div>
  </div>
</template>
