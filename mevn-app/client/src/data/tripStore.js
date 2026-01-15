import { defineStore } from "pinia";
import { ref } from "vue";

export const useTripStore = defineStore("trip", () => {
  const currentTrip = ref({
    routes: [],
  });

  function setTripToEdit(tripFromDashboard) {
    const convertedRoutes = tripFromDashboard.routes.map((route) => ({
      id: route.id,
      from: route.from,
      to: route.to,
      fromCoords: route.startCoords, // Mappatura nomi
      toCoords: route.endCoords, // Mappatura nomi
      type: route.type,
      date: "",
      departureTime: route.depTime,
      arrivalTime: route.arrTime,
      gate: route.gate,
      transportNumber: route.transportCode,
      cost: route.cost,
      co2: route.co2,
      time: route.duration,
      distance: route.distance,
      seatNumber: route.seat,
    }));

    currentTrip.value = {
      ...tripFromDashboard,
      routes: convertedRoutes,
    };
  }

  function clearTrip() {
    currentTrip.value = { routes: [] };
  }

  return { currentTrip, setTripToEdit, clearTrip };
});
