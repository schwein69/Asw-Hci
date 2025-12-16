<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  dailyTips: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>
<template>
  <div class="card bg-base-100 shadow-xl border border-base-200 mb-10">
    <div class="card-body">
      <div class="flex items-center gap-2 mb-4 text-teal-800">
        <component :is="icon" class="w-5 h-5" />
        <h2 class="text-lg font-semibold">{{ title }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(tip, index) in dailyTips"
          :key="index"
          class="flex items-center gap-3 p-4 rounded-lg bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors"
        >
          <Leaf class="w-4 h-4 text-teal-600 shrink-0" />

          <component :is="tip.icon" :class="`w-5 h-5 shrink-0`" />

          <span class="text-sm text-gray-700 font-medium">{{ tip.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
