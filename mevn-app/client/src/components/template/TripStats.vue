<script setup>
import {
  Check,
  Trash2,
  Train,
  Plane,
  Car,
  Bike,
  Bus,
  Bed,
  Utensils,
  Flag,
  Hash,
  DoorOpen,
  Armchair,
  Clock,
  Calendar,
  MapPin,
} from "lucide-vue-next";

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
  stats: {
    type: Object,
    required: true,
  },
  t: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["toggle-complete", "remove-route"]);

const translateTransportType = (type) => {
  const typeMap = {
    Train: props.t("world.transportTypes.train"),
    Airplane: props.t("world.transportTypes.airplane"),
    Car: props.t("world.transportTypes.car"),
    Bus: props.t("world.transportTypes.bus"),
    Bicycle: props.t("world.transportTypes.cycling"),
    Walk: props.t("world.transportTypes.walking"),
  };
  return typeMap[type] || type;
};
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          {{ t("world.totalDestinations") }}
        </div>
        <div class="text-4xl font-extrabold text-gray-800 mt-2">
          {{ stats.totalDestinations }}
        </div>
      </div>

      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          Total Km
        </div>
        <div class="text-4xl font-extrabold text-blue-600 mt-2">
          {{ Number(stats.totalDistance).toFixed(2) }}
        </div>
      </div>

      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          {{ t("world.carbonFootprint") }}
        </div>
        <div
          class="text-4xl font-extrabold text-green-600 mt-2 flex justify-center items-center gap-1"
        >
          {{ stats.carbonFootprint }}
          <span class="text-lg text-gray-500 font-normal">kg</span>
        </div>
      </div>

      <div
        class="card bg-white border border-green-100 shadow-sm p-5 text-center rounded-2xl"
      >
        <div class="text-xs uppercase font-bold text-gray-400 tracking-wider">
          {{ t("world.totalCost") }}
        </div>
        <div
          class="text-4xl font-extrabold text-gray-800 mt-2 flex justify-center items-center"
        >
          €{{ stats.totalCost }}
        </div>
      </div>
    </div>

    <div
      class="space-y-3 border border-green-500 rounded-2xl p-4 bg-green-50/30"
    >
      <h3 class="text-lg font-bold text-green-800 dark:text-white">
        {{ t("world.journeySegments") }}
      </h3>

      <div
        class="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar p-1"
      >
        <div
          v-for="(segment, index) in trip.routes"
          :key="segment.id"
          class="card bg-white border shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
          :class="
            segment.completed
              ? 'border-gray-200 opacity-60 grayscale-[0.5]'
              : 'border-green-500 ring-1 ring-green-100'
          "
        >
          <div
            class="p-3 flex justify-between items-center border-b"
            :class="
              segment.completed
                ? 'bg-gray-50 border-gray-200'
                : 'bg-green-50/50 border-green-100'
            "
          >
            <div class="flex items-center gap-3">
              <div
                class="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors"
                :class="
                  segment.completed
                    ? 'bg-gray-400 text-white'
                    : 'bg-green-600 text-white'
                "
              >
                {{ index + 1 }}
              </div>
              <div
                class="text-base font-bold"
                :class="
                  segment.completed
                    ? 'text-gray-500 line-through decoration-gray-400'
                    : 'text-gray-800'
                "
              >
                {{ segment.from }}
                <span
                  :class="
                    segment.completed ? 'text-gray-400' : 'text-green-400'
                  "
                  class="mx-1"
                  >➜</span
                >
                {{ segment.to }}
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="$emit('toggle-complete', trip.id, segment.id)"
                class="btn btn-sm btn-ghost btn-circle transition-all duration-200"
                :class="
                  segment.completed
                    ? 'text-green-600 bg-green-100'
                    : 'text-gray-300 hover:text-green-600 hover:bg-green-50'
                "
                :title="
                  segment.completed
                    ? t('world.markIncomplete')
                    : t('world.markComplete')
                "
              >
                <Check class="w-5 h-5" />
              </button>

              <button
                @click="$emit('remove-route', trip.id, segment.id)"
                class="btn btn-sm btn-ghost btn-circle text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                :title="t('world.deleteSegment')"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="p-4">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="p-3 rounded-xl transition-colors"
                  :class="
                    segment.completed
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-100 text-green-700'
                  "
                >
                  <Train v-if="segment.type === 'Train'" class="w-5 h-5" />
                  <Plane
                    v-else-if="segment.type === 'Airplane'"
                    class="w-5 h-5"
                  />
                  <Car v-else-if="segment.type === 'Car'" class="w-5 h-5" />
                  <Bike v-else-if="segment.type === 'Bike'" class="w-5 h-5" />
                  <Bus v-else-if="segment.type === 'Bus'" class="w-5 h-5" />
                  <Bed
                    v-else-if="segment.type === 'Accommodation'"
                    class="w-5 h-5"
                  />
                  <Utensils
                    v-else-if="segment.type === 'Restaurant'"
                    class="w-5 h-5"
                  />
                  <Flag v-else class="w-5 h-5" />
                </div>
                <div>
                  <div
                    class="font-bold text-sm"
                    :class="
                      segment.completed ? 'text-gray-500' : 'text-gray-800'
                    "
                  >
                    <Hash class="w-3 h-3" /> {{ segment.transportCode }}
                  </div>
                </div>
              </div>
              <div
                class="badge border-none font-bold px-3 py-3 rounded-lg text-xs transition-colors"
                :class="
                  segment.completed
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-green-50 text-green-700'
                "
              >
                {{ translateTransportType(segment.type).toUpperCase() }}
              </div>
            </div>

            <div
              class="grid grid-cols-3 gap-2 mb-4 p-2 rounded-xl border transition-colors"
              :class="
                segment.completed
                  ? 'bg-gray-50 border-gray-100'
                  : 'bg-green-50/30 border-green-100'
              "
            >
              <div v-if="segment.gate">
                <div
                  class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                >
                  <DoorOpen class="w-3 h-3" /> {{ t("world.gate") }}
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.gate }}
                </div>
              </div>
              <div v-if="segment.arrivalGate">
                <div
                  class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                >
                  <DoorOpen class="w-3 h-3" /> {{ t("world.gate") }}
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.arrivalGate }}
                </div>
              </div>
              <div v-if="segment.seat">
                <div
                  class="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1"
                >
                  <Armchair class="w-3 h-3" /> {{ t("world.seat") }}
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.seat }}
                </div>
              </div>
              <div v-if="segment.class">
                <div class="text-[9px] text-gray-400 font-bold uppercase">
                  {{ t("world.class") }}
                </div>
                <div class="text-xs font-semibold text-gray-700">
                  {{ segment.class }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div
                class="rounded-xl p-3 border transition-colors"
                :class="
                  segment.completed
                    ? 'bg-gray-50 border-gray-100'
                    : 'bg-white border-green-100'
                "
              >
                <div
                  class="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 mb-1"
                >
                  <Clock class="w-3 h-3" /> {{ t("world.departure") }}
                </div>
                <div
                  v-if="segment.date"
                  class="text-xs font-medium mb-0.5 flex items-center gap-1"
                  :class="
                    segment.completed ? 'text-gray-400' : 'text-green-600'
                  "
                >
                  <Calendar class="w-3 h-3" />
                  {{ segment.date }}
                </div>
                <div
                  class="text-lg font-bold"
                  :class="segment.completed ? 'text-gray-500' : 'text-gray-800'"
                >
                  {{ segment.depTime }}
                </div>
              </div>

              <div
                class="rounded-xl p-3 border transition-colors"
                :class="
                  segment.completed
                    ? 'bg-gray-50 border-gray-100'
                    : 'bg-white border-green-100'
                "
              >
                <div
                  class="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 mb-1"
                >
                  <MapPin class="w-3 h-3" /> {{ t("world.arrival") }}
                </div>
                <div
                  class="text-lg font-bold mt-auto pt-4"
                  :class="segment.completed ? 'text-gray-500' : 'text-gray-800'"
                >
                  {{ segment.arrTime }}
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-3"
            >
              <div class="text-center">
                <div class="text-[10px] text-gray-400 font-bold uppercase">
                  {{ t("world.duration") }}
                </div>
                <div class="font-bold text-gray-700">
                  {{ segment.duration }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-[10px] text-gray-400 font-bold uppercase">
                  {{ t("world.distance") }}
                </div>
                <div class="font-bold text-blue-600">
                  {{ segment.distance }} km
                </div>
              </div>
              <div class="text-center">
                <div class="text-[10px] text-gray-400 font-bold uppercase">
                  {{ t("world.carbonFootprint") }}
                </div>
                <div
                  class="font-bold"
                  :class="
                    segment.completed ? 'text-gray-500' : 'text-green-600'
                  "
                >
                  {{ segment.co2 }} kg
                </div>
              </div>
              <div class="text-center">
                <div class="text-[10px] text-gray-400 font-bold uppercase">
                  {{ t("world.cost") }}
                </div>
                <div class="font-bold text-gray-800">€{{ segment.cost }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
</style>
