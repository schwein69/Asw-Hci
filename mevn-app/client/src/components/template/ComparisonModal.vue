<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { X, Loader2, Clock } from "lucide-vue-next";
import { getLanguage, t as translate } from "../../utils/translations.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  alternatives: {
    type: Array,
    default: () => [],
  },
  iconMap: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "confirm"]);

const language = ref(getLanguage());
const t = computed(() => (key) => translate(key, language.value));

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

onMounted(() => {
  window.addEventListener("languageChanged", handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener("languageChanged", handleLanguageChange);
});

const close = () => {
  emit("close");
};

const selectOption = (option) => {
  emit("confirm", option);
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div
      class="card bg-white w-full max-w-lg shadow-2xl overflow-hidden rounded-2xl animate-in fade-in zoom-in duration-200"
    >
      <div
        class="flex justify-between items-center p-4 border-b border-gray-100"
      >
        <h3 class="font-bold text-lg text-gray-800">
          {{ t("plan.alternativeModes") }}
        </h3>
        <button @click="close" class="btn btn-ghost btn-circle btn-sm">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="card-body p-4 bg-gray-50 min-h-[150px]">
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center h-full py-8 text-gray-400"
        >
          <Loader2 class="w-8 h-8 animate-spin mb-2 text-green-600" />
          <span class="text-sm">Calculating alternatives...</span>
        </div>

        <div v-else>
          <div
            v-if="!alternatives || alternatives.length === 0"
            class="text-center text-gray-400 text-sm py-4"
          >
            No alternatives found.
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="option in alternatives"
              :key="option.mode"
              class="flex flex-col bg-white p-3 rounded-xl border-2 border-transparent hover:border-green-400 cursor-pointer transition-all shadow-sm group"
              @click="selectOption(option)"
            >
              <div class="flex items-center justify-between mb-2">
                <div
                  class="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase group-hover:text-green-600"
                >
                  <component :is="iconMap[option.mode]" class="w-4 h-4" />
                  {{ option.mode }}
                </div>
                <div
                  class="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500"
                >
                  <Clock class="w-3 h-3 inline mr-0.5" /> {{ option.time }}
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-800">
                €{{ option.cost }}
              </div>
              <div class="text-sm font-medium text-gray-500 mt-1">
                {{ option.co2 }} kg CO2
              </div>
              <div class="mt-3">
                <button
                  class="btn btn-sm btn-outline group-hover:btn-success group-hover:text-white w-full rounded-lg"
                >
                  Switch to {{ option.mode }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
