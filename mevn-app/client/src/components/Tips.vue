<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, watch } from "vue";
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
import { getLanguage, t as translate } from "../utils/translations.js";

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
const knowledgeData = ref(null);

const fetchData = async () => {
  try {
    // Run requests in parallel for faster loading
    const [dailyRes, knowledgeRes] = await Promise.all([
      axios.get("http://localhost:3000/api/tips/daily"),
      axios.get("http://localhost:3000/api/tips/knowledge"),
    ]);

    // Update Daily Tips
    dailyTips.value = dailyRes.data.map((tip) => ({
      ...tip,
      icon: iconMap[tip.icon] || Globe,
    }));

    // Update Knowledge Data
    knowledgeData.value = knowledgeRes.data;
    console.log("Data fetched successfully");
  } catch (err) {
    console.error("Error fetching tips:", err);
  }
};
onMounted(async () => {
  fetchData();
});

const knowledgesTips = computed(() => {
  const data = knowledgeData.value || {};

  return [
    {
      key: "flightCo2",
      text: data.flightCo2 || "Loading...",
      icon: Plane,
    },
    {
      key: "treeAbsorption",
      text: data.treeAbsorption || "Loading...",
      icon: Leaf,
    },
    {
      key: "methodsVs",
      text: data.methodsVs || "Loading...",
      icon: Heart,
    },
    {
      key: "accomodations",
      text: data.accomodations || "Loading...",
      icon: BedDouble,
    },
  ];
});
const transportGuidelinesBase = computed(() => [
  {
    titleKey: "tips.guidelines.transport.chooseTrain.title",
    descriptionKey: "tips.guidelines.transport.chooseTrain.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.transport.directFlights.title",
    descriptionKey: "tips.guidelines.transport.directFlights.description",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.transport.offsetCarbon.title",
    descriptionKey: "tips.guidelines.transport.offsetCarbon.description",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    isOpen: false,
  },
]);

const accomodationGuidelinesBase = computed(() => [
  {
    titleKey: "tips.guidelines.accommodation.ecoCertified.title",
    descriptionKey: "tips.guidelines.accommodation.ecoCertified.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Medium",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.accommodation.reuseTowels.title",
    descriptionKey: "tips.guidelines.accommodation.reuseTowels.description",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.accommodation.conserveEnergy.title",
    descriptionKey: "tips.guidelines.accommodation.conserveEnergy.description",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    isOpen: false,
  },
]);

const foodGuidelinesBase = computed(() => [
  {
    titleKey: "tips.guidelines.food.eatLocal.title",
    descriptionKey: "tips.guidelines.food.eatLocal.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.food.plantBased.title",
    descriptionKey: "tips.guidelines.food.plantBased.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Medium",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.food.avoidPlastics.title",
    descriptionKey: "tips.guidelines.food.avoidPlastics.description",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    isOpen: false,
  },
]);

const shoppingGuidelinesBase = computed(() => [
  {
    titleKey: "tips.guidelines.shopping.supportArtisans.title",
    descriptionKey: "tips.guidelines.shopping.supportArtisans.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.shopping.ethicalSouvenirs.title",
    descriptionKey: "tips.guidelines.shopping.ethicalSouvenirs.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Medium",
    isOpen: false,
  },
]);

const activitiesGuidelinesBase = computed(() => [
  {
    titleKey: "tips.guidelines.activities.respectWildlife.title",
    descriptionKey: "tips.guidelines.activities.respectWildlife.description",
    impact: "High Impact",
    impactColor: "badge-success",
    difficulty: "Easy",
    isOpen: false,
  },
  {
    titleKey: "tips.guidelines.activities.lowCarbonTours.title",
    descriptionKey: "tips.guidelines.activities.lowCarbonTours.description",
    impact: "Medium Impact",
    impactColor: "badge-warning",
    difficulty: "Easy",
    isOpen: false,
  },
]);

const transportGuidelines = reactive(
  transportGuidelinesBase.value.map((g) => ({ ...g })),
);
const accomodationGuidelines = reactive(
  accomodationGuidelinesBase.value.map((g) => ({ ...g })),
);
const foodGuidelines = reactive(
  foodGuidelinesBase.value.map((g) => ({ ...g })),
);
const shoppingGuidelines = reactive(
  shoppingGuidelinesBase.value.map((g) => ({ ...g })),
);
const activitiesGuidelines = reactive(
  activitiesGuidelinesBase.value.map((g) => ({ ...g })),
);

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
        <h1 class="text-2xl font-bold">{{ t("tips.title") }}</h1>
      </div>
      <p class="opacity-90 ml-9">
        {{ t("tips.subtitle") }}
      </p>
    </div>

    <Explore
      :title="t('tips.quickDailyTips')"
      :icon="Sparkles"
      :daily-tips="dailyTips"
    />

    <h3 class="text-xl font-semibold text-teal-900 mb-4 pl-1">
      {{ t("tips.detailedGuidelines") }}
    </h3>
    <Guidelines
      :title="t('tips.transportation')"
      :icon="Plane"
      :guidelines="transportGuidelines"
      @toggle-guideline="(index) => toggleGeneric(transportGuidelines, index)"
    />

    <Guidelines
      :title="t('tips.accommodation')"
      :icon="BedDouble"
      :guidelines="accomodationGuidelines"
      @toggle-guideline="
        (index) => toggleGeneric(accomodationGuidelines, index)
      "
    />

    <Guidelines
      :title="t('tips.foodDining')"
      :icon="Hamburger"
      :guidelines="foodGuidelines"
      @toggle-guideline="(index) => toggleGeneric(foodGuidelines, index)"
    />
    <Guidelines
      :title="t('tips.shopping')"
      :icon="ShoppingBag"
      :guidelines="shoppingGuidelines"
      @toggle-guideline="(index) => toggleGeneric(shoppingGuidelines, index)"
    />
    <Guidelines
      :title="t('tips.activities')"
      :icon="Heart"
      :guidelines="activitiesGuidelines"
      @toggle-guideline="(index) => toggleGeneric(activitiesGuidelines, index)"
    />

    <Explore
      :title="t('tips.didYouKnow')"
      :icon="Info"
      :daily-tips="knowledgesTips"
    />
  </div>
</template>

<style scoped></style>
