import { defineStore } from "pinia";
import { ref } from "vue";

export const useTripStore = defineStore("trip", () => {
  const currentTrip = ref({
    id: null,
    name: "",
    routes: [],
  });
  // Database locale
  const savedTrips = ref([]);

  function setTripToEdit(tripFromDashboard) {
    const convertedRoutes = tripFromDashboard.routes.map((route) => ({
      id: route.id,
      from: route.from,
      to: route.to,
      fromCoords: route.startCoords,
      toCoords: route.endCoords,
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
      class: route.class,
    }));

    currentTrip.value = {
      ...tripFromDashboard,
      routes: convertedRoutes,
    };
  }

  // Salva i dati dal Planner nel Database Locale
  function saveTrip(tripData) {
    // Controlla se stiamo aggiornando un viaggio esistente o creandone uno nuovo
    const index = savedTrips.value.findIndex((t) => t.id === tripData.id);

    if (index !== -1) {
      // Aggiorna esistente
      savedTrips.value[index] = tripData;
    } else {
      // Crea nuovo
      savedTrips.value.push(tripData);
    }
  }

  function clearTrip() {
    currentTrip.value = { id: null, name: "", routes: [] };
  }

  return { currentTrip, setTripToEdit, clearTrip };
});
