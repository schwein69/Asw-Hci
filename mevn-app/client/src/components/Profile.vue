<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { User, Mail, Lock, Globe, Bell, Trash2, Upload } from 'lucide-vue-next';

const router = useRouter();
const user = ref(null);
const showChangePassword = ref(false);
const showDeleteConfirm = ref(false);
const isDeletingAccount = ref(false);
const deletePassword = ref('');
const deletePasswordError = ref('');
const showImageUpload = ref(false);

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const language = ref(localStorage.getItem('language') || 'en');
const notifications = ref(localStorage.getItem('notifications') !== 'false');

const profileImage = ref(null);
const profileImagePreview = ref(null);
const selectedFileName = ref('');

const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    if (user.value.profileImage) {
      profileImagePreview.value = user.value.profileImage;
    }
  } else {
    router.push('/login');
  }
  
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    language.value = savedLanguage;
  }
  
  const savedNotifications = localStorage.getItem('notifications');
  if (savedNotifications !== null) {
    notifications.value = savedNotifications === 'true';
  }
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }
    
    selectedFileName.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = file;
      profileImagePreview.value = e.target.result;
      console.log('Image loaded, size:', file.size, 'bytes');
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      showToast('Error reading image file. Please try again.', 'error');
    };
    reader.readAsDataURL(file);
  }
};

const triggerFileInput = () => {
  const fileInput = document.getElementById('profile-image-input');
  if (fileInput) {
    fileInput.click();
  }
};

const saveProfileImage = async () => {
  if (!profileImage.value || !profileImagePreview.value) {
    showToast('Please select an image first', 'error');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('You must be logged in to update your profile image', 'error');
      router.push('/login');
      return;
    }

    console.log('Uploading profile image...');
    console.log('Image preview length:', profileImagePreview.value.length);
    
    const response = await axios.post('http://localhost:3000/api/users/profile-image', {
      profileImage: profileImagePreview.value
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Upload response:', response.data);
    
    if (response.data.profileImage) {
      user.value.profileImage = response.data.profileImage;
      const userData = { ...user.value };
      localStorage.setItem('user', JSON.stringify(userData));
      showImageUpload.value = false;
      profileImage.value = null;
      selectedFileName.value = '';
      profileImagePreview.value = response.data.profileImage;
      showToast('Profile image updated successfully!', 'success');
    } else {
      showToast('Unexpected response from server', 'error');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error response:', error.response);
    const errorMsg = error.response?.data?.error || error.message || 'Failed to upload image. Please try again.';
    showToast(errorMsg, 'error');
  }
};

const deleteProfileImage = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('You must be logged in to delete your profile image', 'error');
      router.push('/login');
      return;
    }

    const response = await axios.delete('http://localhost:3000/api/users/profile-image', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    user.value.profileImage = null;
    const userData = { ...user.value };
    localStorage.setItem('user', JSON.stringify(userData));
    profileImagePreview.value = null;
    showImageUpload.value = false;
    profileImage.value = null;
    selectedFileName.value = '';
    showToast('Profile image deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting image:', error);
    console.error('Error response:', error.response);
    const errorMsg = error.response?.data?.error || error.message || 'Failed to delete image. Please try again.';
    showToast(errorMsg, 'error');
  }
};

const validatePassword = () => {
  passwordErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  let isValid = true;

  if (!passwordForm.value.currentPassword) {
    passwordErrors.value.currentPassword = 'Current password is required';
    isValid = false;
  }

  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = 'New password is required';
    isValid = false;
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.newPassword = 'Password must be at least 6 characters';
    isValid = false;
  } else if (passwordForm.value.currentPassword && passwordForm.value.newPassword === passwordForm.value.currentPassword) {
    passwordErrors.value.newPassword = 'New password must be different from current password';
    isValid = false;
  }

  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

const toggleChangePassword = () => {
  if (showChangePassword.value) {
    handleCancelChangePassword();
  } else {
    showChangePassword.value = true;
  }
};

const handleCancelChangePassword = () => {
  showChangePassword.value = false;
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
};

const handleChangePassword = async () => {
  if (!validatePassword()) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('You must be logged in to change your password', 'error');
      router.push('/login');
      return;
    }

    await axios.post('http://localhost:3000/api/users/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    showToast('Password changed successfully!', 'success');
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    passwordErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    showChangePassword.value = false;
  } catch (error) {
    console.error('Error changing password:', error);
    const errorMsg = error.response?.data?.error || error.message || 'Failed to change password. Please try again.';
    showToast(errorMsg, 'error');
  }
};

const handleLanguageChange = (lang) => {
  language.value = lang;
  localStorage.setItem('language', lang);
};

const handleNotificationsToggle = () => {
  notifications.value = !notifications.value;
  localStorage.setItem('notifications', notifications.value.toString());
};

const validateDeletePassword = () => {
  deletePasswordError.value = '';
  if (!deletePassword.value) {
    deletePasswordError.value = 'Password is required to confirm account deletion';
    return false;
  }
  return true;
};

const handleDeleteAccount = async () => {
  if (isDeletingAccount.value) return;
  
  if (!validateDeletePassword()) {
    return;
  }
  
  try {
    isDeletingAccount.value = true;
    
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('You must be logged in to delete your account', 'error');
      router.push('/login');
      return;
    }

    console.log('Attempting to delete account...');
    console.log('Token exists:', !!token);

    const response = await axios.delete('http://localhost:3000/api/users/account', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        password: deletePassword.value
      }
    });

    console.log('Delete account response:', response.data);

    showToast('Your account has been deleted successfully', 'success');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    isDeletingAccount.value = false;
    console.error('Error deleting account:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    let errorMsg = 'Failed to delete account. Please try again.';
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.response?.status === 401) {
      errorMsg = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMsg = 'Invalid password. Please try again.';
    } else if (error.response?.status === 404) {
      errorMsg = 'User not found.';
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    showToast(errorMsg, 'error');
    deletePassword.value = '';
  }
};
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Profile Settings
      </h1>

      <div v-if="user" class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Image
          </h3>
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-20 h-20 rounded-full overflow-hidden bg-success flex items-center justify-center shadow-md">
                <img v-if="profileImagePreview || (user && user.profileImage)" :src="profileImagePreview || user.profileImage" :alt="user.username" class="w-full h-full object-cover" />
                <User v-else class="text-white w-10 h-10" />
              </div>
              <button
                @click="showImageUpload = !showImageUpload"
                class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-success text-white flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Upload class="w-3.5 h-3.5" />
              </button>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ user.username }}
              </h2>
              <button
                v-if="user.profileImage || profileImagePreview"
                @click="deleteProfileImage"
                class="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 class="w-3 h-3" />
                Delete Image
              </button>
            </div>
          </div>

          <div v-if="showImageUpload" class="mt-4 p-4 bg-green-50 dark:bg-gray-700 rounded-2xl border border-green-100 dark:border-gray-600">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Image
            </label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />
            <div class="flex items-center gap-2 mb-3">
              <button
                @click="triggerFileInput"
                class="btn btn-sm btn-success text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all text-xs"
              >
                Choose File
              </button>
              <span class="text-xs text-gray-600 dark:text-gray-400">
                {{ selectedFileName || 'No file chosen' }}
              </span>
            </div>
            <div class="flex gap-2">
              <button
                @click="saveProfileImage"
                :disabled="!profileImage"
                class="btn btn-sm btn-success text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
              >
                Save Image
              </button>
              <button
                @click="showImageUpload = false; profileImage = null; selectedFileName = ''"
                class="btn btn-sm btn-ghost rounded-full no-animation active:scale-95 text-xs h-8"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 bg-green-50 dark:bg-gray-700 rounded-2xl border border-green-100 dark:border-gray-600">
              <Mail class="text-success w-4 h-4 shrink-0" />
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                  {{ user.email }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 transition-colors duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock class="w-4 h-4" />
              Change Password
            </h3>
            <button
              @click="toggleChangePassword"
              class="btn btn-sm btn-ghost rounded-full no-animation active:scale-95 text-xs"
            >
              {{ showChangePassword ? 'Cancel' : 'Change' }}
            </button>
          </div>

          <div v-if="showChangePassword" class="space-y-4">
            <div>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Current Password"
                class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
                :class="passwordErrors.currentPassword ? 'input-error' : 'input-success'"
              />
              <p v-if="passwordErrors.currentPassword" class="text-error text-xs mt-1 ml-2">{{ passwordErrors.currentPassword }}</p>
            </div>
            <div>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="New Password"
                class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
                :class="passwordErrors.newPassword ? 'input-error' : 'input-success'"
              />
              <p v-if="passwordErrors.newPassword" class="text-error text-xs mt-1 ml-2">{{ passwordErrors.newPassword }}</p>
            </div>
            <div>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
                :class="passwordErrors.confirmPassword ? 'input-error' : 'input-success'"
              />
              <p v-if="passwordErrors.confirmPassword" class="text-error text-xs mt-1 ml-2">{{ passwordErrors.confirmPassword }}</p>
            </div>
            <button
              @click="handleChangePassword"
              class="btn btn-success w-full text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Update Password
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe class="w-4 h-4" />
            Language Preferences
          </h3>
          <div class="flex gap-3 flex-wrap">
            <button
              @click="handleLanguageChange('en')"
              :class="[
                'btn btn-sm rounded-full no-animation active:scale-95 transition-all',
                language === 'en' ? 'btn-success text-white' : 'btn-outline'
              ]"
            >
              English
            </button>
            <button
              @click="handleLanguageChange('it')"
              :class="[
                'btn btn-sm rounded-full no-animation active:scale-95 transition-all',
                language === 'it' ? 'btn-success text-white' : 'btn-outline'
              ]"
            >
              Italiano
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 transition-colors duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Bell class="w-4 h-4 text-gray-900 dark:text-white" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>
            <input
              type="checkbox"
              :checked="notifications"
              @change="handleNotificationsToggle"
              class="toggle toggle-success"
            />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ notifications ? 'Notifications are enabled' : 'Notifications are disabled' }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 border-2 border-red-200 dark:border-red-800 transition-colors duration-300">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 class="w-4 h-4" />
                Delete Account
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <button
              @click="showDeleteConfirm = true"
              class="btn btn-sm btn-error rounded-full no-animation hover:opacity-90 active:scale-95 transition-all text-xs"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 text-center transition-colors duration-300">
        <p class="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    </div>

    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-full"
      >
        <div
          :class="[
            'rounded-2xl shadow-lg p-4 flex items-center gap-3 border',
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          ]"
        >
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            ]"
          >
            <svg
              v-if="toast.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p
            :class="[
              'text-sm font-medium flex-1',
              toast.type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            ]"
          >
            {{ toast.message }}
          </p>
          <button
            @click="toast.show = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = false; isDeletingAccount = false; deletePassword = ''; deletePasswordError = ''"></div>
        <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 p-6 space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <Trash2 class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p class="text-sm font-semibold text-red-600 dark:text-red-400">
                Confirm Account Deletion
              </p>
              <p class="text-xs text-red-500 dark:text-red-400 mt-1">
                Enter your password to permanently delete your account. This action cannot be undone.
              </p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-red-600 dark:text-red-400 mb-2">
              Password
            </label>
            <input
              v-model="deletePassword"
              type="password"
              placeholder="Your password"
              class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
              :class="deletePasswordError ? 'input-error' : 'input-success'"
              @input="deletePasswordError = ''"
              @keyup.enter="handleDeleteAccount"
            />
            <p v-if="deletePasswordError" class="text-error text-xs mt-1 ml-2">{{ deletePasswordError }}</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="handleDeleteAccount"
              :disabled="isDeletingAccount || !deletePassword"
              class="btn btn-sm btn-error rounded-full no-animation hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isDeletingAccount" class="loading loading-spinner loading-xs"></span>
              <span v-else>Delete</span>
            </button>
            <button
              @click="showDeleteConfirm = false; isDeletingAccount = false; deletePassword = ''; deletePasswordError = ''"
              :disabled="isDeletingAccount"
              class="btn btn-sm btn-ghost rounded-full no-animation active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
