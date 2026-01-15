<script setup>
import { ref, watch } from "vue";
import { X, Edit } from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  segmentData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "save"]);

const localData = ref({});

watch(
  () => props.segmentData,
  (newVal) => {
    if (newVal) {
      localData.value = {
        // Dati visuali (sola lettura)
        from: newVal.from,
        to: newVal.to,
        type: newVal.type,

        // Dati modificabili
        date: newVal.date || "",
        departureTime: newVal.departureTime || "",
        arrivalTime: newVal.arrivalTime || "",
        transportNumber: newVal.transportNumber || "",
        travelClass: newVal.travelClass || "",
        seat: newVal.seat || "",
        gate: newVal.gate || "",
        arrivalGate: newVal.arrivalGate || "",
        cost: newVal.cost || "",
      };
    }
  },
  { immediate: true }
);

function handleSave() {
  emit("save", localData.value);
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div
      class="card bg-white w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <div
        class="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50"
      >
        <h3 class="font-bold text-lg text-gray-800 flex items-center gap-2">
          <Edit class="w-5 h-5 text-blue-600" />
          Edit Segment Details
        </h3>
        <button @click="$emit('close')" class="btn btn-ghost btn-circle btn-sm">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div
          class="flex justify-between text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 font-medium"
        >
          <span>{{ localData.from }}</span>
          <span class="text-blue-400">➜</span>
          <span>{{ localData.to }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Date</label
            >
            <input
              v-model="localData.date"
              type="date"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>

          <div>
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Dep Time</label
            >
            <input
              v-model="localData.departureTime"
              type="time"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>
          <div>
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Arr Time</label
            >
            <input
              v-model="localData.arrivalTime"
              type="time"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>

          <div class="col-span-2">
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Transport # (Flight/Train ID)</label
            >
            <input
              v-model="localData.transportNumber"
              type="text"
              placeholder="e.g. FR1234"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>

          <div>
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Class</label
            >
            <select
              v-model="localData.travelClass"
              class="select select-sm select-bordered w-full rounded-md mt-1"
            >
              <option value="">-</option>
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
              <option value="Standard">Standard</option>
              <option value="Sleeper">Sleeper</option>
            </select>
          </div>
          <div>
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Seat</label
            >
            <input
              v-model="localData.seat"
              type="text"
              placeholder="e.g. 12A"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>

          <div>
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Dep Gate/Platform</label
            >
            <input
              v-model="localData.gate"
              type="text"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>
          <div>
            <label class="label-text text-xs font-bold text-gray-500 uppercase"
              >Arr Gate/Platform</label
            >
            <input
              v-model="localData.arrivalGate"
              type="text"
              class="input input-sm input-bordered w-full rounded-md mt-1"
            />
          </div>
        </div>
      </div>

      <div
        class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2"
      >
        <button @click="$emit('close')" class="btn btn-sm btn-ghost">
          Cancel
        </button>
        <button
          @click="handleSave"
          class="btn btn-sm btn-primary text-white px-6"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>
