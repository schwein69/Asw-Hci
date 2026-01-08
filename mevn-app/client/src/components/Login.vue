<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { Leaf } from 'lucide-vue-next'; 

const router = useRouter();
const isLogin = ref(true);
const form = ref({ username: '', email: '', password: '' });
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const fieldErrors = ref({ username: '', email: '', password: '' });


const switchMode = () => {
  errorMessage.value = '';
  successMessage.value = '';
  fieldErrors.value = { username: '', email: '', password: '' };
  form.value = { username: '', email: '', password: '' };
  isLogin.value = !isLogin.value;
};


const clearFieldError = (field) => {
  if (fieldErrors.value[field]) {
    fieldErrors.value[field] = '';
  }
};


const validateUsername = () => {
  if (!isLogin.value) {
    if (!form.value.username.trim()) {
      fieldErrors.value.username = 'Username is required';
    } else if (form.value.username.length < 3) {
      fieldErrors.value.username = 'Username must be at least 3 characters';
    } else {
      fieldErrors.value.username = '';
    }
  }
};


const validateEmail = () => {
  if (!form.value.email.trim()) {
    fieldErrors.value.email = 'Email is required';
  } else if (!form.value.email.includes('@') || !form.value.email.includes('.')) {
    fieldErrors.value.email = 'Please enter a valid email';
  } else {
    fieldErrors.value.email = '';
  }
};


const validatePassword = () => {
  if (!form.value.password) {
    fieldErrors.value.password = 'Password is required';
  } else if (!isLogin.value && form.value.password.length < 6) {
    fieldErrors.value.password = 'Password must be at least 6 characters';
  } else {
    fieldErrors.value.password = '';
  }
};


const validateForm = () => {
  fieldErrors.value = { username: '', email: '', password: '' };
  let isValid = true;

 
  if (!isLogin.value) {
    validateUsername();
    if (fieldErrors.value.username) isValid = false;
  }

  
  validateEmail();
  if (fieldErrors.value.email) isValid = false;

 
  validatePassword();
  if (fieldErrors.value.password) isValid = false;

  return isValid;
};


const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  
  if (!validateForm()) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    const endpoint = isLogin.value ? 'login' : 'register';
    const response = await axios.post(`http://localhost:3000/api/users/${endpoint}`, form.value);
    
      if (isLogin.value) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const userRole = response.data.user.role;
      if (userRole === 'GeneralAdmin' || userRole === 'ForumAdmin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      successMessage.value = 'Account created successfully! You can now log in.';
      setTimeout(() => {
        form.value = { username: '', email: '', password: '' };
        isLogin.value = true;
        successMessage.value = '';
      }, 2000);
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An error occurred. Please try again.';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    isLoading.value = false;
  }
};

const goToForgotPassword = () => {
  router.push('/forgot-password');
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
          EcoVoyage
        </h1>

        <p class="text-[9px] text-success font-light uppercase tracking-[0.2em] mt-1 text-center">
          Travel Green • Live Clean
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
        <div v-if="!isLogin">
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="Username" 
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.username ? 'input-error' : 'input-success'
            ]"
            @blur="validateUsername"
            @input="clearFieldError('username')"
          />
          <p v-if="fieldErrors.username" class="text-error text-xs mt-1 ml-2">{{ fieldErrors.username }}</p>
        </div>

        <div>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Email Address" 
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.email ? 'input-error' : 'input-success'
            ]"
            @blur="validateEmail"
            @input="clearFieldError('email')"
          />
          <p v-if="fieldErrors.email" class="text-error text-xs mt-1 ml-2">{{ fieldErrors.email }}</p>
        </div>

        <div>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Password" 
            :class="[
              'input input-bordered w-full rounded-full bg-white text-sm focus:outline-none',
              fieldErrors.password ? 'input-error' : 'input-success'
            ]"
            @blur="validatePassword"
            @input="clearFieldError('password')"
          />
          <p v-if="fieldErrors.password" class="text-error text-xs mt-1 ml-2">{{ fieldErrors.password }}</p>
        </div>

        
        <div v-if="isLogin" class="text-right -mt-2">
          <button 
            @click="goToForgotPassword"
            class="text-xs text-success hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <div class="flex flex-col gap-3 pt-4">
          <button 
            @click="handleSubmit" 
            :disabled="isLoading"
            class="btn btn-sm btn-success text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all h-11 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            <span v-else>{{ isLogin ? 'Login' : 'Join the Journey' }}</span>
          </button>
          
          <button 
            @click="switchMode" 
            :disabled="isLoading"
            class="btn btn-sm btn-ghost text-success rounded-full no-animation active:scale-95 h-11 disabled:opacity-50"
          >
            {{ isLogin ? 'Create Account' : 'Back to Login' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
