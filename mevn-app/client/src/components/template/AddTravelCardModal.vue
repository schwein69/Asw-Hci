<script setup>
import { ref, reactive, computed } from "vue";
import {
  X,
  ImageIcon,
  Loader2,
  Utensils,
  Bed,
  FerrisWheel,
  Mountain,
  Leaf,
} from "lucide-vue-next";

const props = defineProps({
  isOpen: Boolean,
  loading: Boolean,
});

const emit = defineEmits(["close", "submit"]);

const form = reactive({
  title: "",
  location: "", // Address string
  category: "Activity", // Default to match backend enum case if needed
  price: "",
  description: "",
  image: "", // In a real app, this would be a File object
});

const categories = [
  { name: "Restaurant", icon: Utensils },
  { name: "Accommodation", icon: Bed },
  { name: "Activity", icon: Mountain },
  { name: "Itinerary", icon: FerrisWheel },
];

const priceOptions = ["Free", "$", "$$", "$$$", "$$$$"];

const handleSubmit = () => {
  // Basic validation
  if (!form.title || !form.location || !form.description) return;

  // Emit the payload matching Backend Schema
  emit("submit", {
    title: form.title,
    address: form.location,
    // Mocking coords because standard input is text.
    // Ideally, use a Mapbox Autocomplete component here to get real coords.
    longitude: 0,
    latitude: 0,
    category: form.category,
    price: form.price === "Free" ? 0 : Number(form.price) || 0,
    description: form.description,
    images: form.image ? [form.image] : [],
    // Tags are not in your main schema shown previously, but useful for UI
    tags: form.tags, // You might need to handle this in backend if added
  });
};

const resetForm = () => {
  Object.assign(form, {
    title: "",
    location: "",
    category: "Restaurant",
    price: "",
    description: "",
    tags: "",
    image: "",
  });
};

const close = () => {
  emit("close");
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300"
    >
      <div
        class="flex justify-between items-center p-5 border-b border-gray-100"
      >
        <h3 class="text-xl font-bold text-gray-800">Add New Place</h3>
        <button @click="close" class="btn btn-sm btn-circle btn-ghost">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div class="form-control">
          <label class="label"
            ><span class="label-text font-semibold"
              >Place Name <span class="text-red-500">*</span></span
            ></label
          >
          <input
            v-model="form.title"
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
              v-model="form.location"
              type="text"
              class="input input-bordered w-full rounded-xl focus:input-success"
              placeholder="City or Address"
            />
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-semibold"
                >Category <span class="text-red-500">*</span></span
              ></label
            >
            <select
              v-model="form.category"
              class="select select-bordered w-full rounded-xl focus:select-success"
            >
              <option
                v-for="cat in categories"
                :key="cat.name"
                :value="cat.name"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-semibold">Avg Price</span></label
          >
          <select
            v-model="form.price"
            class="select select-bordered w-full rounded-xl focus:select-success"
          >
            <option value="">-- Select --</option>
            <option v-for="p in priceOptions" :key="p" :value="p">
              {{ p === "Free" ? "Free" : "$" + p }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-semibold"
              >Description <span class="text-red-500">*</span></span
            ></label
          >
          <textarea
            v-model="form.description"
            class="textarea textarea-bordered h-24 rounded-xl focus:textarea-success"
            placeholder="Why is it eco-friendly?"
          ></textarea>
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-semibold text-gray-500"
              >Tags (Comma separated)</span
            ></label
          >
          <input
            v-model="form.tags"
            type="text"
            class="input input-bordered w-full rounded-xl focus:input-success"
            placeholder="Organic, Solar, Local..."
          />
        </div>

        <div class="form-control">
          <label class="label"
            ><span class="label-text font-semibold text-gray-500"
              >Photo URL (Optional)</span
            ></label
          >
          <input
            v-model="form.image"
            type="text"
            class="input input-bordered w-full rounded-xl focus:input-success"
            placeholder="https://..."
          />
        </div>
      </div>

      <div
        class="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3"
      >
        <button @click="close" class="btn btn-ghost rounded-xl">Cancel</button>
        <button
          @click="handleSubmit"
          class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl px-8"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? "Posting..." : "Post" }}
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
