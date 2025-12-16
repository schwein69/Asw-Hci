<script setup>
import { ChevronDown, ChevronUp } from "lucide-vue-next";

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function],
    required: true,
  },
  guidelines: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(["toggleGuideline"]);

const toggleGuideline = (index) => {
  emit("toggleGuideline", index);
};

const getBadgeClass = (text) => {
  if (text.includes("High"))
    return "text-emerald-600 border-emerald-200 bg-emerald-50";
  if (text.includes("Medium"))
    return "text-amber-600 border-amber-200 bg-amber-50";
  if (text.includes("Low"))
    return "text-slate-600 border-slate-200 bg-slate-50";
  return "text-sky-600 border-sky-200 bg-sky-50";
};
</script>

<template>
  <div class="card bg-white border border-emerald-100/50 shadow-sm mb-6">
    <div class="card-body p-6">
      <div class="flex items-center gap-3 mb-6">
        <component :is="icon" class="w-6 h-6 text-emerald-600" />
        <h3 class="text-lg font-medium text-teal-900">{{ title }}</h3>
      </div>

      <div class="divide-y divide-gray-100">
        <div
          v-for="(item, index) in guidelines"
          :key="index"
          class="py-4 first:pt-0 last:pb-0"
        >
          <div
            @click="toggleGuideline(index)"
            class="flex flex-col md:flex-row md:items-center justify-between cursor-pointer select-none group gap-3"
          >
            <div class="flex items-center gap-3 flex-wrap">
              <span
                class="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors"
              >
                {{ item.title }}
              </span>

              <div class="flex gap-2">
                <div
                  :class="`badge badge-outline text-xs font-medium h-6 gap-1 ${getBadgeClass(
                    item.impact
                  )}`"
                >
                  {{ item.impact }}
                </div>
                <div
                  :class="`badge badge-outline text-xs font-medium h-6 gap-1 ${getBadgeClass(
                    item.difficulty
                  )}`"
                >
                  {{ item.difficulty }}
                </div>
              </div>
            </div>

            <component
              :is="item.isOpen ? ChevronUp : ChevronDown"
              class="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
            />
          </div>

          <div
            v-if="item.isOpen"
            class="pt-3 text-sm text-slate-600 leading-relaxed animate-slide-down pl-1"
          >
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.2s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
