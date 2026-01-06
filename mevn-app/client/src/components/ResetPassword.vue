<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { Leaf } from 'lucide-vue-next'; 

const router = useRouter();
const route = useRoute();
const form = ref({ password: '', confirmPassword: '' });
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const fieldErrors = ref({ password: '', confirmPassword: '' });
const resetToken = ref('');

onMounted(() => {
  resetToken.value = route.query.token || '';
  if (!resetToken.value) {
    errorMessage.value = 'Invalid reset link. Please request a new password reset.';
  }
});

const clearFieldError = (field) => {
  if (fieldErrors.value[field]) {
    fieldErrors.value[field] = '';
  }
};

const validatePassword = () => {
  if (!form.value.password) {
    fieldErrors.value.password = 'Password is required';
  } else if (form.value.password.length < 6) {
    fieldErrors.value.password = 'Password must be at least 6 characters';
  } else {
    fieldErrors.value.password = '';
  }
};

const validateConfirmPassword = () => {
  if (!form.value.confirmPassword) {
    fieldErrors.value.confirmPassword = 'Please confirm your password';
  } else if (form.value.password !== form.value.confirmPassword) {
    fieldErrors.value.confirmPassword = 'Passwords do not match';
  } else {
    fieldErrors.value.confirmPassword = '';
  }
};

const validateForm = () => {
  fieldErrors.value = { password: '', confirmPassword: '' };
  let isValid = true;

  validatePassword();
  if (fieldErrors.value.password) isValid = false;

  validateConfirmPassword();
  if (fieldErrors.value.confirmPassword) isValid = false;

  return isValid;
};

const handleResetPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!resetToken.value) {
    errorMessage.value = 'Invalid reset link. Please request a new password reset.';
    return;
  }

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post('http://localhost:3000/api/users/reset-password', {
      token: resetToken.value,
      newPassword: form.value.password
    });

    successMessage.value = 'Password reset successfully! Redirecting to login...';
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
    <div class="w-full max-w-sm p-8">
      <div class="flex flex-col items-center mb-10">
        <div class="w-14 h-14 bg-success rounded-2xl flex items-center justify-center shadow-md mb-3">
          <Leaf class="text-white w-8 h-8" />
        </div>
        
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Reset Password
        </h1>

        <p class="text-[9px] text-success font-light uppercase tracking-[0.2em] mt-1 text-center">
          Create a new password
        </p>
      </div>

     
      <div v-if="successMessage" class="alert alert-success mb-4 rounded-full shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">{{ successMessage }}</span>
      </div>

     
      <div v-if="errorMessage" class="alert alert-error mb-4 rounded-full shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">{{ errorMessage }}</span>
      </div>

      <div class="form-control w-full space-y-4">
        <div>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="New Password" 
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.password ? 'input-error' : 'input-success'
            ]"
            @blur="validatePassword"
            @input="clearFieldError('password')"
          />
          <p v-if="fieldErrors.password" class="text-error text-xs mt-1 ml-2">{{ fieldErrors.password }}</p>
        </div>

        <div>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="Confirm New Password" 
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.confirmPassword ? 'input-error' : 'input-success'
            ]"
            @blur="validateConfirmPassword"
            @input="clearFieldError('confirmPassword')"
          />
          <p v-if="fieldErrors.confirmPassword" class="text-error text-xs mt-1 ml-2">{{ fieldErrors.confirmPassword }}</p>
        </div>

        <div class="flex flex-col gap-3 pt-4">
          <button 
            @click="handleResetPassword" 
            :disabled="isLoading"
            class="btn btn-sm btn-success text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all h-11 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
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
    </div>
  </div>
</template>

<style scoped>

</style>
