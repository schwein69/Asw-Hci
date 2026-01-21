<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
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
  Flag,
  Search,
  User,
  Trash2,
} from "lucide-vue-next";
import { getLanguage, t as translate } from "../utils/translations.js";
import { useRewardsStore } from "../data/rewardsStore.js";
import AddTravelCardModal from "./template/AddTravelCardModal.vue";
import { useRouter } from "vue-router";

const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const rewardsStore = useRewardsStore();
const router = useRouter();
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
const hasMore = ref(true);
const activeFilter = ref("all");
const searchQuery = ref("");
const viewMode = ref("all"); // 'all', 'my-posts', 'saved'
const observer = ref(null);
const bottomSentinel = ref(null);

// --- STATE MANAGEMENT ---
const isAddModalOpen = ref(false);
const isDetailOpen = ref(false);
const selectedPlace = ref(null);

const categories = computed(() => [
  { name: t.value("discover.all"), icon: null, key: "all" },
  { name: t.value("discover.restaurants"), icon: Utensils, key: "Restaurant" },
  { name: t.value("discover.hotels"), icon: Bed, key: "Accommodation" },
  {
    name: t.value("discover.attractions"),
    icon: FerrisWheel,
    key: "Attraction",
  },
  { name: t.value("discover.activities"), icon: Mountain, key: "Activity" },
]);

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id || user.id;
};

const fetchPlaces = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return;
  loading.value = true;

  if (reset) {
    page.value = 1;
    places.value = [];
    hasMore.value = true;
  }

  try {
    const params = new URLSearchParams({
      userId: getUserId(),
      page: page.value,
      limit: 6,
      search: searchQuery.value,
      category: activeFilter.value !== "all" ? activeFilter.value : "",
    });

    let endpoint = "/discover";
    if (viewMode.value === "my-posts") endpoint = "/myTravelCards";

    if (viewMode.value === "saved") endpoint = "/savedTravelCards";

    const response = await fetch(
      `http://localhost:3000/api/travelcards${endpoint}?${params}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch places");

    const data = await response.json();
    const defaultAvatar = "https://ui-avatars.com/api/?name=";

    const newPlaces = data.cards.map((card) => ({
      id: card._id,
      title: card.title,
      location: card.location.address || "Unknown Location",
      coordinates: card.location.coordinates,
      category: card.category,
      price: card.price,
      description: card.description,
      image:
        card.images?.[0] || `https://picsum.photos/seed/${card._id}/600/400`,
      user: {
        id: card.creator._id,
        name: card.creator.username,
        avatar:
          card.creator.profileImage ||
          defaultAvatar + encodeURIComponent(card.creator.username),
      },
      likes: card.numberOfLikes || 0,
      saved: card.isSaved || false, // From the map logic we added in backend
      isLiked: card.isLiked || false, // From the map logic we added in backend
    }));

    if (reset) {
      places.value = newPlaces;
    } else {
      places.value.push(...newPlaces);
    }

    hasMore.value = data.hasMore;
    if (hasMore.value) page.value++;
  } catch (error) {
    console.error("Error loading places:", error);
  } finally {
    loading.value = false;
  }
};

const toggleLike = async (place) => {
  const originalState = { liked: place.isLiked, count: place.likes };
  place.isLiked = !place.isLiked;

  try {
    const response = await fetch(
      `http://localhost:3000/api/travelcards/${place.id}/like`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId() }),
      },
    );
    if (!response.ok) throw new Error("Like failed");

    const data = await response.json();
    place.likes = data.likesCount;
  } catch (error) {
    console.error(error);
    place.isLiked = originalState.liked;
    place.likes = originalState.count;
  }
};

const toggleSave = async (place) => {
  place.saved = !place.saved;

  try {
    const response = await fetch(
      `http://localhost:3000/api/travelcards/${place.id}/save`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId() }),
      },
    );
    if (!response.ok) throw new Error("Save failed");
  } catch (error) {
    console.error(error);
    place.saved = !place.saved;
  }
};
const handleCardCreated = (newCard) => {
  const defaultAvatar = "https://ui-avatars.com/api/?name=";
  places.value.unshift({
    id: newCard._id,
    title: newCard.title,
    location: newCard.location?.address || "Unknown",
    coordinates: newCard.location?.coordinates,
    category: newCard.category,
    price: newCard.price,
    description: newCard.description,
    image:
      newCard.images?.[0] ||
      `https://picsum.photos/seed/${newCard._id}/600/400`,
    user: {
      name: "You",
      avatar:
        newCard.creator.profileImage ||
        defaultAvatar + encodeURIComponent(newCard.creator.username),
    },
    likes: 0,
    saved: false,
    isLiked: false,
  });
  isAddModalOpen.value = false;
};
const reportPlace = async () => {
  if (!selectedPlace.value) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/travelcards/${selectedPlace.value.id}/report`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId() }),
      },
    );

    if (response.ok) {
      alert("Report submitted successfully.");
      closeDetail();
    } else {
      const err = await response.json();
      alert("Error: " + err.message);
    }
  } catch (error) {
    console.error(error);
  }
};

const deletePlace = async () => {
  if (!selectedPlace.value) return;

  if (!confirm("Are you sure you want to delete this travel card?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/travelcards/${selectedPlace.value.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: getUserId() }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to delete");
    }

    // Remove from UI immediately
    places.value = places.value.filter((p) => p.id !== selectedPlace.value.id);

    closeDetail();
  } catch (error) {
    alert("Error deleting card: " + error.message);
  }
};

const navigateToPlace = async (place) => {
  const [lng, lat] = place.coordinates;
  try {
    // Construct the URL: endpoint + coordinates + access token
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    // Check if we got valid results
    if (data.features && data.features.length > 0) {
      const placeName = data.features[0].place_name;

      console.log("Full Address:", placeName);

      // Use tripStore to set the destination
      import("../data/tripStore.js").then(({ useTripStore }) => {
        const tripStore = useTripStore();
        tripStore.setDestination(placeName);
      });
      router.push("/Plan");
    } else {
      console.warn("No address found for these coordinates.");
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
  }
};

watch([activeFilter, searchQuery, viewMode], () => {
  fetchPlaces(true);
});

watch(
  () => isAddModalOpen.value || isDetailOpen.value,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
);

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

const goToUserProfile = (userId) => {
  rewardsStore.setTargetUser(userId);
  router.push("/Rewards");
};

const getLeafCount = (likes) => {
  if (likes > 50) return 3;
  if (likes > 20) return 2;
  return 1;
};

const loadMorePlaces = () => fetchPlaces();

onMounted(() => {
  loadMorePlaces();
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMorePlaces();
    },
    { root: null, threshold: 0.1 },
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
        <h2
          class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white"
        >
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
            class="input input-bordered w-full rounded-full pl-10 focus:input-success focus:outline-none shadow-sm dark:bg-slate-800 dark:text-white dark:border-slate-700"
          />
          <Search
            class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div
          class="tabs tabs-boxed bg-gray-100 rounded-full p-1 self-start md:self-auto dark:bg-slate-800"
        >
          <a
            class="tab rounded-full transition-all duration-200 dark:text-gray-300"
            :class="{
              'tab-active bg-white text-emerald-600 shadow-sm dark:bg-slate-600 dark:text-white':
                viewMode === 'all',
            }"
            @click="viewMode = 'all'"
            >All</a
          >
          <a
            class="tab rounded-full transition-all duration-200 gap-2 dark:text-gray-300"
            :class="{
              'tab-active bg-white text-emerald-600 shadow-sm dark:bg-slate-600 dark:text-white':
                viewMode === 'my-posts',
            }"
            @click="viewMode = 'my-posts'"
          >
            <User class="w-3 h-3" /> My Posts
          </a>
          <a
            class="tab rounded-full transition-all duration-200 gap-2 dark:text-gray-300"
            :class="{
              'tab-active bg-white text-emerald-600 shadow-sm dark:bg-slate-600 dark:text-white':
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
          @click="activeFilter = cat.key"
          class="btn btn-sm h-9 px-4 rounded-full border transition-all duration-300"
          :class="
            activeFilter === cat.key
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
        v-if="places.length === 0 && !loading"
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
        v-for="place in places"
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

          <p class="text-gray-500 text-sm line-clamp-2 mb-4 grow">
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
                @click.stop="toggleLike(place)"
                title="Like"
              >
                <Heart
                  class="w-4 h-4"
                  :class="{ 'fill-current text-red-500': place.isLiked }"
                />
              </button>
              <span class="text-xs text-gray-400 font-medium -ml-1 w-6">{{
                place.likes
              }}</span>

              <button
                class="btn btn-circle btn-xs btn-ghost text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                @click.stop="toggleSave(place)"
                title="Save"
              >
                <Bookmark
                  class="w-4 h-4"
                  :class="{ 'fill-current text-emerald-600': place.saved }"
                />
              </button>

              <button
                class="btn btn-circle btn-xs btn-ghost text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                @click.stop="navigateToPlace(place)"
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

    <AddTravelCardModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @create="handleCardCreated"
    />

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
                <div
                  class="bg-neutral text-neutral-content rounded-full w-10 cursor-pointer"
                  @click.stop="goToUserProfile(selectedPlace.user.id)"
                >
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
                @click="toggleLike(selectedPlace)"
              >
                <Heart
                  class="w-4 h-4"
                  :class="{
                    'fill-current text-red-500': selectedPlace.isLiked,
                  }"
                />
                {{ selectedPlace.likes }}
              </button>
              <button
                class="btn btn-outline border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 gap-2"
                @click="toggleSave(selectedPlace)"
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
                @click="navigateToPlace(selectedPlace)"
                class="btn bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 px-6"
              >
                <Navigation class="w-4 h-4" /> Navigate
              </button>
              <button
                v-if="selectedPlace.user.id !== getUserId()"
                @click="reportPlace"
                class="btn btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50 gap-2"
                title="Report Issue"
              >
                <Flag class="w-4 h-4" />
              </button>
              <button
                v-if="selectedPlace.user.id === getUserId()"
                @click="deletePlace"
                class="btn bg-red-100 text-red-600 hover:bg-red-200 border-none gap-2"
                title="Delete Post"
              >
                <Trash2 class="w-4 h-4" />
                Delete
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
