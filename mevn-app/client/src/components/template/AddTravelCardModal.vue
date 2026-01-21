<script setup>
import { ref, reactive, computed } from "vue";
import { X, Image as ImageIcon, Loader2 } from "lucide-vue-next";
import { getLanguage, t as translate } from "../../utils/translations.js";
import { Trash2 } from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "create"]);

const isSubmitting = ref(false);
const language = ref(getLanguage());
const t = computed(() => (key) => translate(key, language.value));
const fileInput = ref(null);

window.addEventListener("languageChanged", (e) => {
  language.value = e.detail.language;
});

const priceOptions = ["Free", "$", "$$", "$$$"];

const categoryOptions = computed(() => [
  { name: t.value("discover.restaurants"), key: "Restaurant" },
  { name: t.value("discover.hotels"), key: "Accommodation" },
  { name: t.value("discover.attractions"), key: "Attraction" },
  { name: t.value("discover.activities"), key: "Activity" },
]);

const newPlace = reactive({
  title: "",
  address: "",
  category: "Activity",
  price: "Free",
  description: "",
  image: null,
});

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id || user.id;
};

const resetForm = () => {
  Object.assign(newPlace, {
    title: "",
    address: "",
    category: "Activity",
    price: "Free",
    description: "",
    image: null,
  });
  if (fileInput.value) fileInput.value.value = "";
};

const closeModal = () => {
  emit("close");
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Check file size (e.g., limit to 5MB to avoid request size errors)
  if (file.size > 5 * 1024 * 1024) {
    alert("File is too large. Please choose an image under 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    // Determine the result is a string before assigning
    if (typeof e.target.result === "string") {
      newPlace.image = e.target.result; // Base64 string
    }
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  newPlace.image = null;
  if (fileInput.value) fileInput.value.value = "";
};

const submitRecommendation = async () => {
  if (!newPlace.title || !newPlace.location || !newPlace.description) {
    alert("Please fill in all required fields.");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      creator: getUserId(),
      title: newPlace.title,
      description: newPlace.description,
      address: newPlace.location,
      category: newPlace.category,
      price: newPlace.price || "Free",
      image: newPlace.image ? [newPlace.image] : [],
    };

    const response = await fetch("http://localhost:3000/api/travelcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to create");

    const newCard = await response.json();

    emit("create", newCard);

    resetForm();
    closeModal();
  } catch (error) {
    alert("Error creating post: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300"
    >
      <div
        class="flex justify-between items-center p-5 border-b border-gray-100"
      >
        <h3 class="text-xl font-bold text-gray-800">Add New Place</h3>
        <button @click="closeModal" class="btn btn-sm btn-circle btn-ghost">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">
              Place Name <span class="text-red-500">*</span>
            </span>
          </label>
          <input
            v-model="newPlace.title"
            type="text"
            class="input input-bordered w-full rounded-xl focus:input-success"
            placeholder="e.g. Green Leaf Cafe"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">
                Location <span class="text-red-500">*</span>
              </span>
            </label>
            <input
              v-model="newPlace.location"
              type="text"
              class="input input-bordered w-full rounded-xl focus:input-success"
              placeholder="City, Country"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">
                Category <span class="text-red-500">*</span>
              </span>
            </label>
            <select
              v-model="newPlace.category"
              class="select select-bordered w-full rounded-xl focus:select-success"
            >
              <option
                v-for="cat in categoryOptions"
                :key="cat.name"
                :value="cat.key"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Price Range</span>
          </label>
          <select
            v-model="newPlace.price"
            class="select select-bordered w-full rounded-xl focus:select-success"
          >
            <option value="" disabled>-- Select Price --</option>
            <option v-for="p in priceOptions" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">
              Description <span class="text-red-500">*</span>
            </span>
          </label>
          <textarea
            v-model="newPlace.description"
            class="textarea textarea-bordered h-24 rounded-xl focus:textarea-success"
            placeholder="Why is it eco-friendly?"
          ></textarea>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold text-gray-500">
              Photo (Optional)
            </span>
          </label>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />

          <div
            v-if="newPlace.image"
            class="relative rounded-xl overflow-hidden border border-gray-200 group h-48"
          >
            <img
              :src="newPlace.image"
              class="w-full h-full object-cover"
              alt="Preview"
            />
            <button
              @click.stop="removeImage"
              class="absolute top-2 right-2 btn btn-circle btn-sm btn-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div
            v-else
            @click="triggerFileInput"
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
        <button @click="closeModal" class="btn btn-ghost rounded-xl">
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
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 99px;
}
</style>
