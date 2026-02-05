import { defineStore } from "pinia";
import { ref } from "vue";

export const useTripStore = defineStore("trip", () => {
  const currentTrip = ref({
    id: null,
    name: "",
    routes: [],
  });
  const destinationFromDiscoverToPlan = ref("");
  function setDestination(address) {
    destinationFromDiscoverToPlan.value = address;
  }
  function setTripToEdit(tripFromDashboard) {
    const convertedRoutes = tripFromDashboard.routes.map((route) => {
      let dateStr = "";
      let depTimeStr = "";
      let arrTimeStr = "";

      if (route.rawStartTime) {
        const start = new Date(route.rawStartTime);
        dateStr = start.toISOString().split("T")[0]; // "YYYY-MM-DD"
        depTimeStr = start.toTimeString().slice(0, 5); // "HH:mm"
      }
      if (route.rawEndTime) {
        const end = new Date(route.rawEndTime);
        arrTimeStr = end.toTimeString().slice(0, 5); // "HH:mm"
      }

      return {
        id: route.id,
        from: route.from,
        to: route.to,
        fromCoords: route.startCoords,
        toCoords: route.endCoords,
        type: route.type,

        date: dateStr,
        departureTime: depTimeStr || route.depTime,
        arrivalTime: arrTimeStr || route.arrTime,

        gate: route.gate,
        transportNumber: route.transportCode,
        cost: route.cost,
        co2: route.co2,
        time: route.duration,
        distance: route.distance,
        seat: route.seat,
        class: route.class,
        travelClass: route.class,
      };
    });

    currentTrip.value = {
      ...tripFromDashboard,
      routes: convertedRoutes,
    };
  }

  return {
    currentTrip,
    setTripToEdit,
    setDestination,
    destinationFromDiscoverToPlan,
  };
});
