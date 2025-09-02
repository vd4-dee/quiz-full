<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
      <!-- Left Section: Mobile Menu Button and Breadcrumbs -->
      <div class="flex items-center">
        <!-- Mobile Menu Button -->
        <button
          @click="$emit('toggleSidebar')"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Breadcrumbs -->
        <div class="hidden sm:block ml-4">
          <slot name="breadcrumb" />
        </div>
      </div>

      <!-- Right Section: Notifications, User Menu, etc. -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <button class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
          <div class="relative">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.83 19.172A4 4 0 018.828 17H15l5-5V4a2 2 0 00-2-2H4.828a4 4 0 00-5.656 5.656L4.83 19.172z" />
            </svg>
            <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {{ notificationCount > 9 ? '9+' : notificationCount }}
            </span>
          </div>
        </button>

        <!-- Help & Support -->
        <button class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInitials }}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900">{{ user?.name || user?.email }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ user?.role }}</p>
            </div>
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- User Dropdown Menu -->
          <div
            v-if="userMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
          >
            <router-link
              to="/user/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              @click="userMenuOpen = false"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </div>
            </router-link>

            <router-link
              to="/user/stats"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              @click="userMenuOpen = false"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                My Statistics
              </div>
            </router-link>

            <!-- Interface Switcher for Teachers -->
            <div v-if="authStore.isTeacher" class="border-t border-gray-100">
              <button
                @click="switchToAdmin"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Switch to Admin
                </div>
              </button>
            </div>

            <div class="border-t border-gray-100">
              <button
                @click="logout"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userMenuOpen = ref(false);
const notificationCount = ref(3); // Mock data - replace with real notifications

const user = computed(() => authStore.user);
const userInitials = computed(() => {
  if (!user.value?.name) return 'U';
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const switchToAdmin = async () => {
  try {
    await authStore.switchInterface('admin');
    router.push('/admin/dashboard');
  } catch (error) {
    console.error('Failed to switch to admin mode:', error);
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Close user menu when clicking outside
const closeUserMenu = () => {
  userMenuOpen.value = false;
};

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      userMenuOpen.value = false;
    }
  });
});
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
}

/* Dropdown animation */
.user-dropdown-enter-active,
.user-dropdown-leave-active {
  transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
}

.user-dropdown-enter-from,
.user-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
