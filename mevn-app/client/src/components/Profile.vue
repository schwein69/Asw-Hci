<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { User, Mail, Lock, Globe, Bell, Trash2, Upload, ArrowLeft } from 'lucide-vue-next';
import { getLanguage, setLanguage, t as translate } from '../utils/translations.js';

const router = useRouter();
const user = ref(null);
const showChangePassword = ref(false);
const showDeleteConfirm = ref(false);
const isDeletingAccount = ref(false);
const deletePassword = ref('');
const deletePasswordError = ref('');
const fileInputRef = ref(null);

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

const language = ref(getLanguage());
const notifications = ref(localStorage.getItem('notifications') !== 'false');

const t = computed(() => (key) => translate(key, language.value));

const isAdmin = computed(() => {
  return user.value?.role === 'AdminGeneral' || 
         user.value?.role === 'AdminForum';
});

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

const handleLanguageChangeEvent = (event) => {
  language.value = event.detail.language;
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
  
  language.value = getLanguage();
  
  const savedNotifications = localStorage.getItem('notifications');
  if (savedNotifications !== null) {
    notifications.value = savedNotifications === 'true';
  }
  
  window.addEventListener('languageChanged', handleLanguageChangeEvent);
});

onUnmounted(() => {
  window.removeEventListener('languageChanged', handleLanguageChangeEvent);
});

const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast(t.value('profile.imageTooLarge'), 'error');
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
      return;
    }
    
    selectedFileName.value = file.name;
    
    try {
      const resizedImage = await resizeImage(file);
      profileImage.value = file;
      profileImagePreview.value = resizedImage;
      await saveProfileImage();
    } catch (error) {
      console.error('Error processing image:', error);
      showToast(t.value('profile.errorProcessingImage'), 'error');
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    }
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const saveProfileImage = async () => {
  if (!profileImage.value || !profileImagePreview.value) {
    showToast(t.value('profile.selectImageFirst'), 'error');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast(t.value('profile.mustBeLoggedIn'), 'error');
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
      profileImage.value = null;
      selectedFileName.value = '';
      profileImagePreview.value = response.data.profileImage;
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
      window.dispatchEvent(new Event('profileImageUpdated'));
      showToast(t.value('profile.profileImageUpdated'), 'success');
    } else {
      showToast(t.value('profile.unexpectedResponse'), 'error');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error response:', error.response);
    const errorMsg = error.response?.data?.error || error.message || t.value('profile.errorUploadingImage');
    showToast(errorMsg, 'error');
  }
};

const deleteProfileImage = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast(t.value('profile.mustBeLoggedIn'), 'error');
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
    profileImage.value = null;
    selectedFileName.value = '';
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    window.dispatchEvent(new Event('profileImageUpdated'));
    showToast(t.value('profile.profileImageDeleted'), 'success');
  } catch (error) {
    console.error('Error deleting image:', error);
    console.error('Error response:', error.response);
    const errorMsg = error.response?.data?.error || error.message || t.value('profile.errorDeletingImage');
    showToast(errorMsg, 'error');
  }
};

const validatePassword = () => {
  passwordErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  let isValid = true;

  if (!passwordForm.value.currentPassword) {
    passwordErrors.value.currentPassword = t.value('profile.currentPasswordRequired');
    isValid = false;
  }

  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = t.value('profile.newPasswordRequired');
    isValid = false;
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.newPassword = t.value('profile.passwordTooShort');
    isValid = false;
  } else if (passwordForm.value.currentPassword && passwordForm.value.newPassword === passwordForm.value.currentPassword) {
    passwordErrors.value.newPassword = t.value('profile.passwordSame');
    isValid = false;
  }

  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = t.value('profile.confirmPasswordRequired');
    isValid = false;
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = t.value('profile.passwordsDontMatch');
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
      showToast(t.value('profile.mustBeLoggedIn'), 'error');
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

    showToast(t.value('profile.passwordChanged'), 'success');
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    passwordErrors.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    showChangePassword.value = false;
  } catch (error) {
    console.error('Error changing password:', error);
    const errorMsg = error.response?.data?.error || error.message || t.value('profile.errorChangingPassword');
    showToast(errorMsg, 'error');
  }
};

const handleLanguageChange = (lang) => {
  setLanguage(lang);
  language.value = lang;
};

const handleNotificationsToggle = () => {
  notifications.value = !notifications.value;
  localStorage.setItem('notifications', notifications.value.toString());
};

const validateDeletePassword = () => {
  deletePasswordError.value = '';
  if (!deletePassword.value) {
    deletePasswordError.value = t.value('profile.deletePasswordRequired');
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
      showToast(t.value('profile.mustBeLoggedIn'), 'error');
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

    showToast(t.value('profile.accountDeleted'), 'success');
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
    
    let errorMsg = t.value('profile.errorDeletingAccount');
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.response?.status === 401) {
      errorMsg = t.value('profile.mustBeLoggedIn');
    } else if (error.response?.status === 403) {
      errorMsg = t.value('profile.invalidPassword');
    } else if (error.response?.status === 404) {
      errorMsg = t.value('profile.userNotFound');
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
      <div class="flex items-center gap-6 mb-6">
        <button
          v-if="user && (user.role === 'Admin' || user.role === 'GeneralAdmin')"
          @click="router.push('/admin')"
          class="flex items-center justify-center w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-90 border border-emerald-500/20"
          title="Back to Admin Panel"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ t('profile.title') }}
        </h1>
      </div>

      <div v-if="user">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 transition-colors duration-300 space-y-6">
          <div class="flex flex-col items-center pb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="relative mb-4">
              <div class="w-28 h-28 rounded-full overflow-hidden bg-success flex items-center justify-center shadow-lg ring-4 ring-green-100 dark:ring-gray-700">
                <img v-if="profileImagePreview || (user && user.profileImage)" :src="profileImagePreview || user.profileImage" :alt="user.username" class="w-full h-full object-cover" />
                <User v-else class="text-white w-14 h-14" />
              </div>
              <button
                @click="triggerFileInput"
                class="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-success text-white flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all ring-4 ring-white dark:ring-gray-800"
              >
                <Upload class="w-4 h-4" />
              </button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
            </div>
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {{ user.username }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {{ user.email }}
              </p>
              <button
                v-if="user.profileImage || profileImagePreview"
                @click="deleteProfileImage"
                class="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline flex items-center gap-1 mx-auto transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
                {{ t('profile.deleteImage') }}
              </button>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail class="w-5 h-5 text-success" />
              {{ t('profile.accountInformation') }}
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl border border-green-100 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div class="w-10 h-10 rounded-full bg-success flex items-center justify-center shrink-0">
                  <Mail class="text-white w-5 h-5" />
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{{ t('profile.email') }}</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock class="w-5 h-5 text-success" />
                {{ t('profile.changePassword') }}
              </h3>
              <button
                @click="toggleChangePassword"
                class="btn btn-sm btn-success rounded-full no-animation active:scale-95 text-xs text-white"
              >
                {{ showChangePassword ? t('profile.cancel') : t('profile.change') }}
              </button>
            </div>

            <div v-if="showChangePassword" class="space-y-4">
              <div>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  :placeholder="t('profile.currentPassword')"
                  class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
                  :class="passwordErrors.currentPassword ? 'input-error' : 'input-success'"
                />
                <p v-if="passwordErrors.currentPassword" class="text-error text-xs mt-1 ml-2">{{ passwordErrors.currentPassword }}</p>
              </div>
              <div>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  :placeholder="t('profile.newPassword')"
                  class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
                  :class="passwordErrors.newPassword ? 'input-error' : 'input-success'"
                />
                <p v-if="passwordErrors.newPassword" class="text-error text-xs mt-1 ml-2">{{ passwordErrors.newPassword }}</p>
              </div>
              <div>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  :placeholder="t('profile.confirmPassword')"
                  class="input input-bordered w-full rounded-full bg-white text-sm focus:outline-none"
                  :class="passwordErrors.confirmPassword ? 'input-error' : 'input-success'"
                />
                <p v-if="passwordErrors.confirmPassword" class="text-error text-xs mt-1 ml-2">{{ passwordErrors.confirmPassword }}</p>
              </div>
              <button
                @click="handleChangePassword"
                class="btn btn-success w-full text-white rounded-full no-animation hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                {{ t('profile.updatePassword') }}
              </button>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe class="w-5 h-5 text-success" />
              {{ t('profile.languagePreferences') }}
            </h3>
            <div class="flex gap-3 flex-wrap">
              <button
                @click="handleLanguageChange('en')"
                :class="[
                  'btn btn-sm rounded-full no-animation active:scale-95 transition-all',
                  language === 'en' ? 'btn-success text-white' : 'btn-outline'
                ]"
              >
                {{ t('common.english') }}
              </button>
              <button
                @click="handleLanguageChange('it')"
                :class="[
                  'btn btn-sm rounded-full no-animation active:scale-95 transition-all',
                  language === 'it' ? 'btn-success text-white' : 'btn-outline'
                ]"
              >
                {{ t('common.italiano') }}
              </button>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Bell class="w-5 h-5 text-success" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ t('profile.notifications') }}
                </h3>
              </div>
              <input
                type="checkbox"
                :checked="notifications"
                @change="handleNotificationsToggle"
                class="toggle toggle-success"
              />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 ml-7">
              {{ notifications ? t('profile.notificationsEnabled') : t('profile.notificationsDisabled') }}
            </p>
          </div>

          <div class="border-t border-red-200 dark:border-red-800 pt-6">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Trash2 class="w-4 h-4" />
                  {{ t('profile.deleteAccount') }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ t('profile.deleteAccountWarning') }}
                </p>
              </div>
              <button
                @click="showDeleteConfirm = true"
                class="btn btn-sm btn-error rounded-full no-animation hover:opacity-90 active:scale-95 transition-all text-xs"
              >
                {{ t('profile.deleteAccount') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 md:p-8 text-center transition-colors duration-300">
        <p class="text-gray-500 dark:text-gray-400">{{ t('profile.loading') }}</p>
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
                {{ t('profile.confirmDeletion') }}
              </p>
              <p class="text-xs text-red-500 dark:text-red-400 mt-1">
                {{ t('profile.deleteWarning') }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-red-600 dark:text-red-400 mb-2">
              {{ t('profile.currentPassword') }}
            </label>
            <input
              v-model="deletePassword"
              type="password"
              :placeholder="t('profile.deletePasswordPlaceholder')"
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
              <span v-else>{{ t('profile.delete') }}</span>
            </button>
            <button
              @click="showDeleteConfirm = false; isDeletingAccount = false; deletePassword = ''; deletePasswordError = ''"
              :disabled="isDeletingAccount"
              class="btn btn-sm btn-ghost rounded-full no-animation active:scale-95 disabled:opacity-50"
            >
              {{ t('profile.cancel') }}
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
