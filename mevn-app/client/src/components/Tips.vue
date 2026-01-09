<script setup>
import { ref, onMounted } from "vue";
import Guidelines from "./template/Guidelines.vue";
import Explore from "./template/Explore.vue";
import axios from "axios";
import {
  Lightbulb,
  Sparkles,
  Sun,
  Wind,
  Leaf,
  Globe,
  Droplet,
  Heart,
  Smartphone,
  Luggage,
  Plug,
  Footprints,
  Recycle,
  Info,
  Hamburger,
  BedDouble,
  Plane,
  ShoppingBag,
} from "lucide-vue-next";

const iconMap = {
  Globe,
  Droplet,
  Smartphone,
  Luggage,
  Plug,
  Footprints,
  Recycle,
  ShoppingBag,
  Leaf,
  Sun,
  Wind,
};
const dailyTips = ref([]);
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/tips/daily");
    const tipsData = response.data;
    dailyTips.value = tipsData;
    for (const tip of dailyTips.value) {
      tip.icon = iconMap[tip.icon];
    }
    console.log("Successfully fetched daily tips:", tipsData);
  } catch (err) {
    console.error("Error fetching daily tips:", err);
  } finally {
    console.log("Finished attempting to fetch daily tips.");
  }
});

const knowledgesTips = [
  {
    text: "A single round-trip flight from New York to London generates about 1.5 tons of CO₂ per passenger.",
    icon: Plane,
  },
  {
    text: "One tree absorbs approximately 22 kg of CO₂ per year. You'd need 68 trees to offset that one flight!",
    icon: Leaf,
  },

  {
    text: "Choosing train travel over flying can reduce your carbon footprint by up to 90% for the same route.",
    icon: Heart,
  },
  {
    text: "Staying at eco-certified hotels can reduce water and energy consumption by up to 30%.",
    icon: BedDouble,
  },
];
const transportGuidelines = ref([
  {
    title: "Choose Train Over Plane",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    description:
      "Trains emit up to 90% less CO₂ than flights for the same journey. For trips under 500km, trains are often faster when you include airport time!",
    isOpen: false,
  },
  {
    title: "Direct Flights When Flying",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    description:
      "Takeoffs and landings use the most fuel. Direct flights reduce carbon emissions significantly compared to layovers.",
    isOpen: false,
  },
  {
    title: "Offset Your Carbon",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    description:
      "Calculate your travel footprint and donate to verified reforestation or renewable energy projects.",
    isOpen: false,
  },
]);

const accomodationGuidelines = ref([
  {
    title: "Choose Eco-Certified Stays",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Medium",
    description:
      "Look for hotels with Green Key, LEED, or EarthCheck certifications. These properties actively reduce water, waste, and energy consumption.",
    isOpen: false,
  },
  {
    title: "Reuse Towels & Linens",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    description:
      "Hang up your towels to signal you'll reuse them. This saves huge amounts of water and electricity used for daily laundry.",
    isOpen: false,
  },
  {
    title: "Conserve Room Energy",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    description:
      "Always turn off lights, AC, and TV when leaving your room. Close curtains on hot days to keep the room cool naturally.",
    isOpen: false,
  },
]);

const foodGuidelines = ref([
  {
    title: "Eat Local & Seasonal",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    description:
      "Imported ingredients have a high carbon footprint. Local food supports the community economy and usually tastes fresher!",
    isOpen: false,
  },
  {
    title: "Plant-Based Options",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Medium",
    description:
      "Animal agriculture is a major greenhouse gas contributor. Try eating vegetarian or vegan for at least one meal a day.",
    isOpen: false,
  },
  {
    title: "Avoid Single-Use Plastics",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    description:
      "Refuse plastic straws and cutlery. Carry a reusable water bottle and fill up at filtered water stations.",
    isOpen: false,
  },
]);

const shoppingGuidelines = ref([
  {
    title: "Support Local Artisans",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    description:
      "Buy souvenirs made locally rather than mass-produced imports. This puts money directly into the hands of local families.",
    isOpen: false,
  },
  {
    title: "Ethical Souvenirs",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Medium",
    description:
      "Never buy products made from endangered species, ivory, coral, or turtle shells. It fuels illegal poaching and ecosystem destruction.",
    isOpen: false,
  },
]);

const activitiesGuidelines = ref([
  {
    title: "Respect Wildlife",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    description:
      "Observe animals from a distance. Never feed them, as it disrupts their natural diet and can make them aggressive.",
    isOpen: false,
  },
  {
    title: "Low-Carbon Tours",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    description:
      "Opt for human-powered activities like kayaking, hiking, or cycling tours instead of jet skis, ATVs, or helicopter rides.",
    isOpen: false,
  },
]);

/**
 * Toggles the 'isOpen' state of a guideline item by its index.
 * @param {Array} list - The array containing the guideline objects.
 * @param {Number} index - The index of the item to toggle.
 */
const toggleGeneric = (list, index) => {
  if (list && list[index]) {
    list[index].isOpen = !list[index].isOpen;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto min-h-screen font-sans">
    <div class="bg-success rounded-xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Lightbulb class="w-6 h-6" />
        <h1 class="text-2xl font-bold">Sustainable Travel Guide</h1>
      </div>
      <p class="opacity-90 ml-9">
        Small changes make a big difference for our planet
      </p>
    </div>

    <Explore
      title="Quick Daily Tips"
      :icon="Sparkles"
      :daily-tips="dailyTips"
    />

    <h3 class="text-xl font-semibold text-teal-900 mb-4 pl-1">
      Detailed Guidelines
    </h3>
    <Guidelines
      title="Transportation"
      :icon="Plane"
      :guidelines="transportGuidelines"
      @toggle-guideline="(index) => toggleGeneric(transportGuidelines, index)"
    />

    <Guidelines
      title="Accommodation"
      :icon="BedDouble"
      :guidelines="accomodationGuidelines"
      @toggle-guideline="
        (index) => toggleGeneric(accomodationGuidelines, index)
      "
    />

    <Guidelines
      title="Food & Dining"
      :icon="Hamburger"
      :guidelines="foodGuidelines"
      @toggle-guideline="(index) => toggleGeneric(foodGuidelines, index)"
    />
    <Guidelines
      title="Shopping"
      :icon="ShoppingBag"
      :guidelines="shoppingGuidelines"
      @toggle-guideline="(index) => toggleGeneric(shoppingGuidelines, index)"
    />
    <Guidelines
      title="Activities"
      :icon="Heart"
      :guidelines="activitiesGuidelines"
      @toggle-guideline="(index) => toggleGeneric(activitiesGuidelines, index)"
    />

    <Explore title="Did you know?" :icon="Info" :daily-tips="knowledgesTips" />
  </div>
</template>

<style scoped></style>
