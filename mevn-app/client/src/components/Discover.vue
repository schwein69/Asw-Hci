<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  Plus,
  MapPin,
  Heart,
  Share2,
  Leaf,
  Utensils,
  Bed,
  FerrisWheel,
  Mountain,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";

const language = ref(getLanguage());

const t = computed(() => (key) => translate(key, language.value));

const handleLanguageChange = (event) => {
  language.value = event.detail.language;
};

onMounted(() => {
  window.addEventListener('languageChanged', handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener('languageChanged', handleLanguageChange);
});

const places = ref([]);
const loading = ref(false);
const page = ref(1);
const activeFilter = ref("all");
const observer = ref(null);
const bottomSentinel = ref(null);

const categories = computed(() => [
  { name: t.value('discover.all'), icon: null, key: 'all' },
  { name: t.value('discover.restaurants'), icon: Utensils, key: 'restaurants' },
  { name: t.value('discover.hotels'), icon: Bed, key: 'hotels' },
  { name: t.value('discover.attractions'), icon: FerrisWheel, key: 'attractions' },
  { name: t.value('discover.activities'), icon: Mountain, key: 'activities' },
]);

//Fake Data Generator
const generateMockData = (count) => {
  const titles = [
    "Green Harvest Café",
    "EcoLodge Mountain Retreat",
    "Bike Tour Historic District",
    "Solar Villa",
    "Ocean Cleanup Hub",
  ];
  const locations = [
    "Amsterdam, Netherlands",
    "Swiss Alps, Switzerland",
    "Copenhagen, Denmark",
    "Kyoto, Japan",
    "Bali, Indonesia",
  ];
  const tagsList = [
    ["Organic", "Local", "Zero Waste"],
    ["Solar Power", "Eco-Certified", "Nature"],
    ["Bike Tour", "Carbon-Free", "Cultural"],
  ];

  return Array.from({ length: count }).map((_, i) => {
    const randomIdx = Math.floor(Math.random() * titles.length);
    return {
      id: Date.now() + i,
      title: titles[randomIdx],
      location: locations[randomIdx],
      description:
        "Experience sustainable living with locally sourced materials and zero-carbon footprint practices designed for the modern eco-traveler.",
      image: `https://picsum.photos/seed/${Math.random()}/600/400`, // Random placeholder
      score: 85 + Math.floor(Math.random() * 15),
      tags: tagsList[randomIdx % 3],
      user: {
        name: "Sarah M.",
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      },
      likes: 120 + Math.floor(Math.random() * 500),
      shares: 40 + Math.floor(Math.random() * 200),
    };
  });
};

const loadMorePlaces = async () => {
  if (loading.value) return;
  loading.value = true;
  setTimeout(() => {
    const newPlaces = generateMockData(6);
    places.value.push(...newPlaces);
    page.value++;
    loading.value = false;
  }, 800);
};

onMounted(() => {
  loadMorePlaces();
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMorePlaces();
      }
    },
    {
      root: null, // null means actual screen
      threshold: 0.1, // Trigger when even 10% of the sentinel is visible
    }
  );

  if (bottomSentinel.value) {
    observer.value.observe(bottomSentinel.value);
  }
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
});
</script>

<template>
  <div class="max-w-7xl mx-auto min-h-screen font-sans">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3 md:gap-4"
    >
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
          {{ t('discover.title') }}
        </h2>
        <p class="text-emerald-600 mt-0.5 text-sm md:text-base">
          {{ t('discover.subtitle') }}
        </p>
      </div>
      <button
        class="btn btn-sm md:btn md:rounded-full bg-emerald-500 hover:bg-emerald-600 border-none text-white normal-case gap-2 shadow-sm md:shadow-lg px-3 py-1"
      >
        <Plus class="w-4 h-4 md:w-5 md:h-5" />
        <span class="text-xs md:text-sm">{{ t('discover.addRecommendation') }}</span>
      </button>
    </div>

    <div class="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat.name"
        @click="activeFilter = cat.name"
        class="btn btn-sm h-10 px-5 rounded-full border transition-all duration-300"
        :class="
          activeFilter === cat.name
            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
        "
      >
        <component :is="cat.icon" v-if="cat.icon" class="w-4 h-4 mr-2" />
        {{ cat.name }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
      <div
        v-for="place in places"
        :key="place.id"
        class="card bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 rounded-2xl overflow-hidden group"
      >
        <figure class="relative h-48 overflow-hidden">
          <img
            :src="place.image"
            :alt="place.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            class="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm"
          >
            <Leaf class="w-3 h-3" />
            {{ place.score }}
          </div>
        </figure>

        <div class="card-body p-5">
          <h3 class="card-title text-lg font-bold text-gray-800">
            {{ place.title }}
          </h3>

          <div class="flex items-center text-gray-500 text-sm mt-1">
            <MapPin class="w-4 h-4 mr-1" />
            {{ place.location }}
          </div>

          <p class="text-gray-500 text-sm mt-3 line-clamp-2">
            {{ place.description }}
          </p>

          <div class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="(tag, index) in place.tags"
              :key="index"
              class="badge badge-outline border-emerald-200 text-emerald-700 bg-emerald-50 text-xs px-3 py-3"
            >
              {{ tag }}
            </span>
          </div>

          <div class="divider my-2"></div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-6 rounded-full">
                  <img :src="place.user.avatar" alt="user" />
                </div>
              </div>
              <span class="text-xs font-medium text-gray-500">{{
                place.user.name
              }}</span>
            </div>

            <div class="flex items-center gap-4 text-gray-400">
              <div
                class="flex items-center gap-1 text-xs hover:text-red-500 cursor-pointer transition-colors"
              >
                <Heart class="w-4 h-4" />
                <span>{{ place.likes }}</span>
              </div>
              <div
                class="flex items-center gap-1 text-xs hover:text-blue-500 cursor-pointer transition-colors"
              >
                <Share2 class="w-4 h-4" />
                <span>{{ place.shares }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="bottomSentinel"
      class="flex justify-center items-center py-12 w-full"
    >
      <div
        v-if="loading"
        class="flex flex-col items-center gap-2 text-emerald-600"
      >
        <span class="loading loading-dots loading-lg"></span>
        <span class="text-sm font-medium">{{ t('discover.discoveringMore') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar hiding for cleaner filter tab look */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
