<script setup>
import { ref, onMounted, onUnmounted, reactive, watch, computed } from "vue";
import {
  Plus,
  MapPin,
  Heart,
  Bookmark,
  Navigation,
  Leaf,
  Utensils,
  Bed,
  FerrisWheel,
  Mountain,
  X,
  Image as ImageIcon,
  Loader2,
  Flag,
  Search,
  User,
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

const places = ref([]);
const loading = ref(false);
const page = ref(1);
const activeFilter = ref("All");
const searchQuery = ref("");
const viewMode = ref("all");
const observer = ref(null);
const bottomSentinel = ref(null);

// --- STATE MANAGEMENT ---
const isAddModalOpen = ref(false);
const isDetailOpen = ref(false);
const selectedPlace = ref(null);
const isSubmitting = ref(false);

const newPlace = reactive({
  title: "",
  location: "",
  category: "Restaurants",
  price: "",
  description: "",
  tags: "",
  hasImage: false,
});

// --- STATE MANAGEMENT ---
const isAddModalOpen = ref(false);
const isDetailOpen = ref(false);
const selectedPlace = ref(null);
const isSubmitting = ref(false);

const newPlace = reactive({
  title: "",
  location: "",
  category: "Restaurants",
  price: "",
  description: "",
  tags: "",
  hasImage: false,
});

const categories = computed(() => [
  { name: t.value("discover.all"), icon: null, key: "all" },
  { name: t.value("discover.restaurants"), icon: Utensils, key: "restaurants" },
  { name: t.value("discover.hotels"), icon: Bed, key: "hotels" },
  {
    name: t.value("discover.attractions"),
    icon: FerrisWheel,
    key: "attractions",
  },
  { name: t.value("discover.activities"), icon: Mountain, key: "activities" },
]);

const priceOptions = ["Free", "$", "$$", "$$$", "$$$$"];

watch(
  () => isAddModalOpen.value || isDetailOpen.value,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
);

const getLeafCount = (likes) => {
  if (likes > 300) return 3;
  if (likes >= 100) return 2;
  return 1;
};

// --- FILTERING LOGIC ---
const filteredPlaces = computed(() => {
  return places.value.filter((place) => {
    // 1. View Mode Filter
    if (viewMode.value === "my-posts" && place.user.name !== "You")
      return false;
    if (viewMode.value === "saved" && !place.saved) return false;

    // 2. Category Filter
    const matchesCategory =
      activeFilter.value === "All" || place.category === activeFilter.value;

    // 3. Search Filter
    const query = searchQuery.value.toLowerCase();
    const matchesSearch =
      place.location.toLowerCase().includes(query) ||
      place.title.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
});

// --- FAKE DATA ---
const generateMockData = (count) => {
  const titles = [
    "Green Harvest Café",
    "EcoLodge Mountain Retreat",
    "Bike Tour Historic District",
    "Solar Villa",
    "Ocean Cleanup Hub",
    "Urban Vertical Garden",
    "Sustainable Surf School",
    "Zero Waste Market",
  ];
  const locations = [
    "Amsterdam, Netherlands",
    "Swiss Alps, Switzerland",
    "Copenhagen, Denmark",
    "Kyoto, Japan",
    "Bali, Indonesia",
    "Berlin, Germany",
    "Vancouver, Canada",
    "Portland, USA",
  ];
  const prices = ["$$", "$$$", "$", "Free", null];
  const cats = ["Restaurants", "Hotels", "Attractions", "Activities"];

  return Array.from({ length: count }).map((_, i) => {
    const randomIdx = Math.floor(Math.random() * titles.length);
    const likes = 50 + Math.floor(Math.random() * 350);

    return {
      id: Date.now() + i,
      title: titles[randomIdx],
      location: locations[Math.floor(Math.random() * locations.length)],
      category: cats[Math.floor(Math.random() * cats.length)],
      price: prices[Math.floor(Math.random() * prices.length)],
      description:
        "Experience sustainable living with locally sourced materials and zero-carbon footprint practices designed for the modern eco-traveler.",
      image: `https://picsum.photos/seed/${Math.random()}/600/400`,
      score: 85 + Math.floor(Math.random() * 15),
      tags: ["Organic", "Local", "Zero Waste"],
      user: {
        name: "Sarah M.",
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      },
      likes: likes,
      shares: 40 + Math.floor(Math.random() * 200),
      saved: Math.random() > 0.8, // Randomly save some items for demo
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

// --- ACTIONS ---

const openDetail = (place) => {
  selectedPlace.value = place;
  isDetailOpen.value = true;
};

const closeDetail = () => {
  isDetailOpen.value = false;
  setTimeout(() => {
    selectedPlace.value = null;
  }, 300);
};

const reportPlace = () => {
  if (confirm("Are you sure you want to report this recommendation?")) {
    alert("Report submitted.");
  }
};

const submitRecommendation = () => {
  if (!newPlace.title || !newPlace.location || !newPlace.description) {
    alert("Please fill in all required fields.");
    return;
  }

  isSubmitting.value = true;

  setTimeout(() => {
    const score = 100;
    const newItem = {
      id: Date.now(),
      title: newPlace.title,
      location: newPlace.location,
      category: newPlace.category,
      price: newPlace.price === "Free" ? "Free" : newPlace.price,
      description: newPlace.description,
      image: `https://picsum.photos/seed/${Date.now()}/600/400`,
      score: score,
      tags: newPlace.tags ? newPlace.tags.split(",").map((t) => t.trim()) : [],
      user: {
        name: "You",
        avatar: "https://i.pravatar.cc/150?u=me",
      },
      likes: 0,
      shares: 0,
      saved: false,
    };

    places.value.unshift(newItem);

    // Switch view to 'My Posts' or 'All' so the user sees it immediately
    viewMode.value = "my-posts";

    Object.assign(newPlace, {
      title: "",
      location: "",
      description: "",
      tags: "",
      price: "",
    });
    isSubmitting.value = false;
    isAddModalOpen.value = false;
  }, 1500);
};

onMounted(() => {
  loadMorePlaces();
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMorePlaces();
    },
    { root: null, threshold: 0.1 }
  );
  if (bottomSentinel.value) observer.value.observe(bottomSentinel.value);
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
  document.body.style.overflow = "";
});
</script>

<template>
  <div class="max-w-7xl mx-auto min-h-screen font-sans relative pb-20">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
    >
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
          {{ t("discover.title") }}
        </h2>
        <p class="text-emerald-600 mt-0.5 text-sm md:text-base">
          {{ t("discover.subtitle") }}
        </p>
      </div>
      <button
        @click="isAddModalOpen = true"
        class="btn btn-sm md:btn md:rounded-full bg-emerald-500 hover:bg-emerald-600 border-none text-white normal-case gap-2 shadow-sm md:shadow-lg px-4"
      >
        <Plus class="w-4 h-4 md:w-5 md:h-5" />
        <span class="text-xs md:text-sm">{{
          t("discover.addRecommendation")
        }}</span>
      </button>
    </div>

    <div class="mb-8 space-y-4">
      <div class="flex flex-col md:flex-row gap-4 justify-between">
        <div class="relative w-full md:max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by country, city, or name..."
            class="input input-bordered w-full rounded-full pl-10 focus:input-success focus:outline-none shadow-sm"
          />
          <Search
            class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div
          class="tabs tabs-boxed bg-gray-100 rounded-full p-1 self-start md:self-auto"
        >
          <a
            class="tab rounded-full transition-all duration-200"
            :class="{
              'tab-active bg-white text-emerald-600 shadow-sm':
                viewMode === 'all',
            }"
            @click="viewMode = 'all'"
            >All</a
          >
          <a
            class="tab rounded-full transition-all duration-200 gap-2"
            :class="{
              'tab-active bg-white text-emerald-600 shadow-sm':
                viewMode === 'my-posts',
            }"
            @click="viewMode = 'my-posts'"
          >
            <User class="w-3 h-3" /> My Posts
          </a>
          <a
            class="tab rounded-full transition-all duration-200 gap-2"
            :class="{
              'tab-active bg-white text-emerald-600 shadow-sm':
                viewMode === 'saved',
            }"
            @click="viewMode = 'saved'"
          >
            <Bookmark class="w-3 h-3" /> Saved
          </a>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="activeFilter = cat.name"
          class="btn btn-sm h-9 px-4 rounded-full border transition-all duration-300"
          :class="
            activeFilter === cat.name
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
          "
        >
          <component :is="cat.icon" v-if="cat.icon" class="w-3.5 h-3.5 mr-2" />
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-if="filteredPlaces.length === 0 && !loading"
        class="col-span-full text-center py-20 text-gray-400 flex flex-col items-center gap-2"
      >
        <div class="bg-gray-100 p-4 rounded-full mb-2">
          <Search class="w-8 h-8 text-gray-300" />
        </div>
        <p>No places found matching your criteria.</p>
        <button
          v-if="viewMode !== 'all'"
          @click="viewMode = 'all'"
          class="btn btn-sm btn-link text-emerald-600 no-underline"
        >
          View all recommendations
        </button>
      </div>

      <div
        v-for="place in filteredPlaces"
        :key="place.id"
        @click="openDetail(place)"
        class="card bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
      >
        <figure class="relative h-52 overflow-hidden bg-gray-100">
          <img
            :src="place.image"
            :alt="place.title"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div
            class="absolute top-3 right-3 bg-white/90 backdrop-blur text-emerald-600 px-2 py-1.5 rounded-lg shadow-sm flex items-center gap-0.5"
          >
            <Leaf
              v-for="n in getLeafCount(place.likes)"
              :key="n"
              class="w-3.5 h-3.5 fill-current"
            />
          </div>

          <div
            v-if="place.price"
            class="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm"
          >
            {{ place.price }}
          </div>
        </figure>

        <div class="p-5 flex flex-col h-full">
          <div class="mb-2">
            <div
              class="text-[10px] uppercase font-bold text-emerald-600 mb-1 tracking-wider"
            >
              {{ place.category }}
            </div>
            <h3
              class="font-bold text-gray-800 text-lg leading-tight group-hover:text-emerald-600 transition-colors"
            >
              {{ place.title }}
            </h3>
            <div class="flex items-center text-gray-400 text-xs mt-1">
              <MapPin class="w-3 h-3 mr-1" /> {{ place.location }}
            </div>
          </div>

          <p class="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
            {{ place.description }}
          </p>

          <div class="divider my-0"></div>

          <div class="flex items-center justify-between pt-3 mt-auto">
            <div class="flex items-center gap-2">
              <img
                :src="place.user.avatar"
                class="w-6 h-6 rounded-full object-cover border border-gray-100"
                alt="user"
              />
              <span class="text-xs text-gray-500 font-medium">{{
                place.user.name
              }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="btn btn-circle btn-xs btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50"
                @click.stop="place.likes++"
                title="Like"
              >
                <Heart
                  class="w-4 h-4"
                  :class="{ 'fill-current text-red-500': place.likes > 0 }"
                />
              </button>
              <span class="text-xs text-gray-400 font-medium -ml-1 w-6">{{
                place.likes
              }}</span>

              <button
                class="btn btn-circle btn-xs btn-ghost text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                @click.stop="place.saved = !place.saved"
                title="Save"
              >
                <Bookmark
                  class="w-4 h-4"
                  :class="{ 'fill-current text-emerald-600': place.saved }"
                />
              </button>

              <button
                class="btn btn-circle btn-xs btn-ghost text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                @click.stop
                title="Navigate"
              >
                <Navigation class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div ref="bottomSentinel" class="flex justify-center py-12">
      <span
        v-if="loading"
        class="loading loading-dots loading-lg text-emerald-300"
      ></span>
    </div>

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="isAddModalOpen = false"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        <div
          class="flex justify-between items-center p-5 border-b border-gray-100"
        >
          <h3 class="text-xl font-bold text-gray-800">Add New Place</h3>
          <button
            @click="isAddModalOpen = false"
            class="btn btn-sm btn-circle btn-ghost"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div
          class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-semibold"
                >Place Name <span class="text-red-500">*</span></span
              ></label
            >
            <input
              v-model="newPlace.title"
              type="text"
              class="input input-bordered w-full rounded-xl focus:input-success"
              placeholder="e.g. Green Leaf Cafe"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"
                ><span class="label-text font-semibold"
                  >Location <span class="text-red-500">*</span></span
                ></label
              >
              <input
                v-model="newPlace.location"
                type="text"
                class="input input-bordered w-full rounded-xl focus:input-success"
                placeholder="City"
              />
            </div>
            <div class="form-control">
              <label class="label"
                ><span class="label-text font-semibold"
                  >Category <span class="text-red-500">*</span></span
                ></label
              >
              <select
                v-model="newPlace.category"
                class="select select-bordered w-full rounded-xl focus:select-success"
              >
                <option v-for="cat in categories.slice(1)" :key="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-semibold">Price Range</span></label
            >
            <select
              v-model="newPlace.price"
              class="select select-bordered w-full rounded-xl focus:select-success"
            >
              <option value="">-- None --</option>
              <option v-for="p in priceOptions" :key="p">{{ p }}</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-semibold"
                >Description <span class="text-red-500">*</span></span
              ></label
            >
            <textarea
              v-model="newPlace.description"
              class="textarea textarea-bordered h-24 rounded-xl focus:textarea-success"
              placeholder="Why is it eco-friendly?"
            ></textarea>
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-semibold text-gray-500"
                >Tags (Optional)</span
              ></label
            >
            <input
              v-model="newPlace.tags"
              type="text"
              class="input input-bordered w-full rounded-xl focus:input-success"
              placeholder="Organic, Solar..."
            />
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-semibold text-gray-500"
                >Photo (Optional)</span
              ></label
            >
            <div
              class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 cursor-pointer transition-colors"
            >
              <ImageIcon class="w-8 h-8 mx-auto mb-2" />
              <span class="text-xs">Click to upload image</span>
            </div>
          </div>
        </div>

        <div
          class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3"
        >
          <button
            @click="isAddModalOpen = false"
            class="btn btn-ghost rounded-xl"
          >
            Cancel
          </button>
          <button
            @click="submitRecommendation"
            class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl px-8"
            :disabled="isSubmitting"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? "Posting..." : "Post" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isDetailOpen && selectedPlace"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      @click.self="closeDetail"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[85vh] relative"
      >
        <button
          @click="closeDetail"
          class="absolute top-4 right-4 z-10 btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="relative h-64 md:h-full bg-gray-200">
          <img
            :src="selectedPlace.image"
            class="w-full h-full object-cover"
            alt="Detail"
          />
          <div class="absolute bottom-4 left-4 flex gap-2">
            <div
              class="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-emerald-700 text-sm font-bold shadow-lg flex items-center gap-1"
            >
              <Leaf
                v-for="n in getLeafCount(selectedPlace.likes)"
                :key="n"
                class="w-4 h-4 fill-current"
              />
            </div>
            <div
              v-if="selectedPlace.price"
              class="bg-black/70 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg"
            >
              {{ selectedPlace.price }}
            </div>
          </div>
        </div>

        <div class="p-8 overflow-y-auto flex flex-col custom-scrollbar">
          <div
            class="flex items-center gap-2 text-emerald-600 text-sm font-bold uppercase tracking-wider mb-2"
          >
            <component
              :is="
                categories.find((c) => c.name === selectedPlace.category)
                  ?.icon || Utensils
              "
              class="w-4 h-4"
            />
            {{ selectedPlace.category || "Place" }}
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            {{ selectedPlace.title }}
          </h2>
          <div class="flex items-center text-gray-500 mb-6">
            <MapPin class="w-4 h-4 mr-2" /> {{ selectedPlace.location }}
          </div>
          <div
            class="flex flex-wrap gap-2 mb-6"
            v-if="selectedPlace.tags && selectedPlace.tags.length"
          >
            <span
              v-for="tag in selectedPlace.tags"
              :key="tag"
              class="badge badge-lg badge-outline text-emerald-600 border-emerald-200 bg-emerald-50"
              >{{ tag }}</span
            >
          </div>
          <p class="text-gray-600 leading-relaxed text-lg mb-8">
            {{ selectedPlace.description }}
          </p>
          <div
            class="mt-auto pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content rounded-full w-10">
                  <img :src="selectedPlace.user.avatar" />
                </div>
              </div>
              <div>
                <div class="font-bold text-sm">
                  {{ selectedPlace.user.name }}
                </div>
                <div class="text-xs text-gray-400">Recommended this</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="btn btn-outline border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 gap-2"
                @click="selectedPlace.likes++"
              >
                <Heart
                  class="w-4 h-4"
                  :class="{
                    'fill-current text-red-500': selectedPlace.likes > 0,
                  }"
                />
                {{ selectedPlace.likes }}
              </button>
              <button
                class="btn btn-outline border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 gap-2"
                @click="selectedPlace.saved = !selectedPlace.saved"
              >
                <Bookmark
                  class="w-4 h-4"
                  :class="{
                    'fill-current text-emerald-600': selectedPlace.saved,
                  }"
                />
                Save
              </button>
              <button
                class="btn bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 px-6"
              >
                <Navigation class="w-4 h-4" /> Navigate
              </button>
              <button
                @click="reportPlace"
                class="btn btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50 gap-2"
                title="Report Issue"
              >
                <Flag class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 99px;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
