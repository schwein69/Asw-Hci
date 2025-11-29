<script>
import { Calendar, MapPin, TrendingUp, Trash2 } from "lucide-vue-next";

export default {
  name: "PastTrips",
  components: {
    Calendar,
    MapPin,
    TrendingUp,
    Trash2,
  },
  data() {
    return {
      trips: [
        {
          id: 1,
          title: "European Summer Adventure",
          date: "2024-08-15",
          endDate: "2024-08-25",
          segments: 2,
          emissions: "125 kg",
          cost: "€1850",
          duration: "2 days",
          status: "Completed",
          transportMethods: [
            {
              id: 1,
              route: "Paris → Berlin",
              provider: "TGV",
              code: "TG456",
              departure: "08:30 AM",
              departureType: "Platform 12",
              arrival: "02:15 PM",
              arrivalType: "Platform 8",
              time: "5h 45m",
              co2: "18kg",
              cost: "€120",
              type: "train",
            },
            {
              id: 2,
              route: "Berlin → Amsterdam",
              provider: "FlixBus",
              code: "BUS234",
              departure: "09:00 AM",
              departureType: "Bay 5",
              arrival: "04:30 PM",
              arrivalType: "Bay 12",
              time: "7h 30m",
              co2: "22kg",
              cost: "€45",
              type: "bus",
            },
          ],
        },
        {
          id: 2,
          title: "Asian Discovery Tour",
          date: "2024-07-01",
          endDate: "2024-07-15",
          segments: 3,
          emissions: "240 kg",
          cost: "€2450",
          duration: "3 days",
          status: "Completed",
          transportMethods: [],
        },
        {
          id: 3,
          title: "Caribbean Escape",
          date: "2024-06-10",
          endDate: "2024-06-20",
          segments: 2,
          emissions: "180 kg",
          cost: "€1650",
          duration: "2 days",
          status: "Completed",
          transportMethods: [],
        },
      ],
    };
  },
  methods: {
    deleteTrip(id) {
      this.trips = this.trips.filter((trip) => trip.id !== id);
    },
  },
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-6">
      <Calendar class="w-6 h-6 text-success" />
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Past Trips History</h2>
        <p class="text-sm text-gray-600">
          {{ trips.length }} completed trips • View detailed itineraries and
          transport methods
        </p>
      </div>
    </div>

    <!-- Trips List -->
    <div class="space-y-4">
      <div
        v-for="trip in trips"
        :key="trip.id"
        class="card bg-white border border-green-100 shadow-md overflow-hidden"
      >
        <!-- Trip Header -->
        <div class="card-body">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-gray-800">
                  {{ trip.title }}
                </h3>
                <span class="badge badge-sm badge-neutral">{{
                  trip.status
                }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ trip.date }} to {{ trip.endDate }}
              </p>
            </div>
            <button @click="deleteTrip(trip.id)" class="btn btn-ghost btn-sm">
              <Trash2 class="w-4 h-4 text-error" />
            </button>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">
                {{ trip.segments }}
              </div>
              <div class="text-xs text-gray-600">Segments</div>
            </div>
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">
                {{ trip.emissions }}
              </div>
              <div class="text-xs text-gray-600">Emissions</div>
            </div>
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">{{ trip.cost }}</div>
              <div class="text-xs text-gray-600">Cost</div>
            </div>
            <div
              class="bg-green-50 rounded-lg p-3 text-center border border-green-200"
            >
              <div class="text-lg font-bold text-gray-800">
                {{ trip.duration }}
              </div>
              <div class="text-xs text-gray-600">Duration</div>
            </div>
          </div>

          <!-- Transport Methods -->
          <div v-if="trip.transportMethods.length > 0" class="mt-4">
            <h4
              class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
            >
              <TrendingUp class="w-4 h-4" />
              Transport Methods
            </h4>
            <div class="space-y-3">
              <div
                v-for="(method, idx) in trip.transportMethods"
                :key="method.id"
                class="border border-green-100 rounded-lg p-3 bg-green-50"
              >
                <!-- Route Header -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="badge badge-sm badge-success">{{
                      idx + 1
                    }}</span>
                    <span class="text-sm font-semibold text-gray-800">{{
                      method.route
                    }}</span>
                    <span class="badge badge-sm badge-outline">{{
                      method.type
                    }}</span>
                  </div>
                </div>

                <!-- Provider Info -->
                <div class="text-xs text-gray-600 mb-3">
                  <div class="font-medium">{{ method.provider }}</div>
                  <div>{{ method.code }}</div>
                </div>

                <!-- Schedule Grid -->
                <div class="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <div class="text-gray-500">Departure</div>
                    <div class="font-semibold text-gray-800">
                      {{ method.departure }}
                    </div>
                    <div class="text-gray-500">{{ method.departureType }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-gray-500">Time</div>
                    <div class="font-semibold text-gray-800">
                      {{ method.time }}
                    </div>
                  </div>
                  <div>
                    <div class="text-gray-500">Arrival</div>
                    <div class="font-semibold text-gray-800">
                      {{ method.arrival }}
                    </div>
                    <div class="text-gray-500">{{ method.arrivalType }}</div>
                  </div>
                </div>

                <!-- Metrics -->
                <div
                  class="flex items-center justify-between text-xs border-t border-green-200 pt-2"
                >
                  <div>
                    <span class="text-gray-600">CO₂: </span>
                    <span class="font-semibold text-gray-800">{{
                      method.co2
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Cost: </span>
                    <span class="font-semibold text-gray-800">{{
                      method.cost
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Load to Map Button -->
            <button
              class="btn btn-outline btn-sm w-full mt-4 text-success border-success hover:bg-success hover:text-white"
            >
              <MapPin class="w-4 h-4" />
              Load to Map
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
