<script>
export default {
  name: "Tips",
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-green-50 p-6 rounded-2xl border border-green-100">
      <div class="flex items-start gap-4">
        <i class="fa-solid fa-bottle-water text-2xl text-green-600 mt-1"></i>
        <div>
          <h3 class="font-bold text-green-900">Carry a Reusable Bottle</h3>
          <p class="text-sm text-green-700 mt-2 leading-relaxed">
            Save money and reduce plastic waste by carrying your own water
            bottle. Most airports now have refill stations.
          </p>
        </div>
      </div>
    </div>
    <div class="bg-orange-50 p-6 rounded-2xl border border-orange-100">
      <div class="flex items-start gap-4">
        <i class="fa-solid fa-utensils text-2xl text-orange-500 mt-1"></i>
        <div>
          <h3 class="font-bold text-orange-900">Eat Local</h3>
          <p class="text-sm text-orange-700 mt-2 leading-relaxed">
            Supporting local restaurants reduces food transport emissions and
            supports the local economy.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
