<script setup>
import { ref, onMounted, inject } from "vue";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const form = ref({ password: "", confirmPassword: "" });
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const fieldErrors = ref({ password: "", confirmPassword: "" });
const resetToken = ref("");
const showForm = ref(false);
const isInitializing = ref(true);
const apiBase = inject("apiBase");

onMounted(() => {
  resetToken.value = route.query.token || "";
  if (!resetToken.value || resetToken.value.trim() === "") {
    errorMessage.value =
      "Invalid reset link. Please check the link from your email.";
    showForm.value = false;
    isInitializing.value = false;
  } else {
    resetToken.value = resetToken.value.trim();
    showForm.value = true;
    isInitializing.value = false;
  }
});

const clearFieldError = (field) => {
  if (fieldErrors.value[field]) {
    fieldErrors.value[field] = "";
  }
};

const validatePassword = () => {
  if (!form.value.password) {
    fieldErrors.value.password = "Password is required";
  } else if (form.value.password.length < 6) {
    fieldErrors.value.password = "Password must be at least 6 characters";
  } else {
    fieldErrors.value.password = "";
  }
};

const validateConfirmPassword = () => {
  if (!form.value.confirmPassword) {
    fieldErrors.value.confirmPassword = "Please confirm your password";
  } else if (form.value.password !== form.value.confirmPassword) {
    fieldErrors.value.confirmPassword = "Passwords do not match";
  } else {
    fieldErrors.value.confirmPassword = "";
  }
};

const validateForm = () => {
  fieldErrors.value = { password: "", confirmPassword: "" };
  let isValid = true;

  validatePassword();
  if (fieldErrors.value.password) isValid = false;

  validateConfirmPassword();
  if (fieldErrors.value.confirmPassword) isValid = false;

  return isValid;
};

const handleResetPassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!resetToken.value || resetToken.value.trim() === "") {
    errorMessage.value =
      "Invalid reset link. Please check the link from your email.";
    return;
  }

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post(`${apiBase}/users/reset-password`, {
      token: resetToken.value,
      newPassword: form.value.password,
    });

    successMessage.value =
      "Password reset successfully! Redirecting to login...";

    resetToken.value = "";
    showForm.value = false;
    router.replace({ query: {} });

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error) {
    const errorMsg =
      error.response?.data?.error || "An error occurred. Please try again.";
    errorMessage.value = errorMsg;

    if (error.response?.status === 400) {
      showForm.value = false;
      resetToken.value = "";
      router.replace({ query: {} });
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
  >
    <div class="w-full max-w-sm p-8">
      <div class="mb-8 text-center">
        <h1
          class="text-xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2"
        >
          Reset Password
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Use the reset link from your email to set a new password
        </p>
      </div>

      <div
        v-if="successMessage"
        class="alert alert-success mb-4 rounded-full shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-sm">{{ successMessage }}</span>
      </div>

      <div v-if="isInitializing" class="text-center mb-4">
        <span class="loading loading-spinner loading-md"></span>
        <p class="text-sm text-gray-500 mt-2">Validating reset link...</p>
      </div>

      <div
        v-if="errorMessage && !isInitializing"
        class="alert alert-error mb-4 rounded-full shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-sm">{{ errorMessage }}</span>
      </div>

      <div
        v-if="showForm && !isInitializing"
        class="form-control w-full space-y-4"
      >
        <div>
          <input
            v-model="form.password"
            type="password"
            placeholder="New Password"
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.password ? 'input-error' : 'input-success',
            ]"
            @blur="validatePassword"
            @input="clearFieldError('password')"
          />
          <p v-if="fieldErrors.password" class="text-error text-xs mt-1 ml-2">
            {{ fieldErrors.password }}
          </p>
        </div>

        <div>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.confirmPassword ? 'input-error' : 'input-success',
            ]"
            @blur="validateConfirmPassword"
            @input="clearFieldError('confirmPassword')"
          />
          <p
            v-if="fieldErrors.confirmPassword"
            class="text-error text-xs mt-1 ml-2"
          >
            {{ fieldErrors.confirmPassword }}
          </p>
        </div>

        <div class="flex flex-col gap-3 pt-4">
          <button
            @click="handleResetPassword"
            :disabled="isLoading"
            class="btn btn-sm btn-success text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all h-11 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="isLoading"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else>Reset Password</span>
          </button>

          <button
            @click="router.push('/login')"
            class="btn btn-sm btn-ghost text-success rounded-full no-animation active:scale-95 h-11"
          >
            Back to Login
          </button>
        </div>
      </div>

      <div
        v-if="!showForm && !isInitializing && errorMessage"
        class="flex justify-center mt-6"
      >
        <button
          @click="router.push('/login')"
          class="btn btn-sm btn-ghost text-success rounded-full no-animation active:scale-95 h-11"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
