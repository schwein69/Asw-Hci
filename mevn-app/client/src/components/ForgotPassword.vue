<script setup>
import { ref, inject } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { Leaf } from "lucide-vue-next";

const apiBase = inject("apiBase");
const router = useRouter();
const forgotPasswordEmail = ref("");
const forgotPasswordError = ref("");
const successMessage = ref("");
const isLoadingForgotPassword = ref(false);

const handleForgotPassword = async () => {
  forgotPasswordError.value = "";
  successMessage.value = "";

  if (!forgotPasswordEmail.value.trim()) {
    forgotPasswordError.value = "Email is required";
    return;
  }

  if (
    !forgotPasswordEmail.value.includes("@") ||
    !forgotPasswordEmail.value.includes(".")
  ) {
    forgotPasswordError.value = "Please enter a valid email";
    return;
  }

  isLoadingForgotPassword.value = true;

  try {
    const response = await axios.post(`${apiBase}/users/forgot-password`, {
      email: forgotPasswordEmail.value,
    });

    successMessage.value =
      response.data.message || "Password reset link sent to your email!";

    forgotPasswordEmail.value = "";

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (error) {
    forgotPasswordError.value =
      error.response?.data?.error || "An error occurred. Please try again.";
    setTimeout(() => {
      forgotPasswordError.value = "";
    }, 5000);
  } finally {
    isLoadingForgotPassword.value = false;
  }
};

const goBackToLogin = () => {
  router.push("/login");
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
  >
    <div class="w-full max-w-sm p-8">
      <div class="flex flex-col items-center mb-10">
        <div
          class="w-14 h-14 bg-success rounded-2xl flex items-center justify-center shadow-md mb-3"
        >
          <Leaf class="text-white w-8 h-8" />
        </div>

        <h1
          class="text-xl font-semibold text-gray-900 dark:text-white tracking-tight"
        >
          EcoGo
        </h1>

        <p
          class="text-[9px] text-success font-light uppercase tracking-[0.2em] mt-1 text-center"
        >
          Travel Green • Live Clean
        </p>

        <h2
          class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight mt-6 mb-2"
        >
          Reset Password
        </h2>
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

      <div
        v-if="forgotPasswordError"
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
        <span class="text-sm">{{ forgotPasswordError }}</span>
      </div>

      <div class="form-control w-full space-y-4">
        <div>
          <input
            v-model="forgotPasswordEmail"
            type="email"
            placeholder="Email Address"
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              forgotPasswordError ? 'input-error' : 'input-success',
            ]"
            @keyup.enter="handleForgotPassword"
          />
          <p v-if="forgotPasswordError" class="text-error text-xs mt-1 ml-2">
            {{ forgotPasswordError }}
          </p>
        </div>

        <div class="flex flex-col gap-3 pt-4">
          <button
            @click="handleForgotPassword"
            :disabled="isLoadingForgotPassword"
            class="btn btn-sm btn-success text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all h-11 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="isLoadingForgotPassword"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else>Send Reset Link</span>
          </button>

          <button
            @click="goBackToLogin"
            :disabled="isLoadingForgotPassword"
            class="btn btn-sm btn-ghost text-success rounded-full no-animation active:scale-95 h-11 disabled:opacity-50"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
