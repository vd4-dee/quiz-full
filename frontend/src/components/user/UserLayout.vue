<template>
  <div class="flex min-h-screen bg-gray-50 user-container">
    <!-- Desktop Sidebar -->
    <UserSidebar v-if="sidebarOpen" class="hidden lg:block w-64 flex-shrink-0" />
    
    <!-- Mobile Sidebar Overlay -->
    <div v-if="mobileSidebar" class="fixed inset-0 z-40 lg:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="mobileSidebar = false"></div>
      <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <UserSidebar @click.self="mobileSidebar = false" />
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <UserHeader @toggleSidebar="toggleSidebar" @logout="onLogout">
        <template #breadcrumb>
          <UserBreadcrumb :crumbs="breadcrumbs" />
        </template>
      </UserHeader>
      
      <main class="flex-1 overflow-y-auto overflow-x-hidden">
        <div class="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <slot />
        </div>
      </main>
      
      <!-- Toast notifications and confirm dialogs can be added here -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import UserSidebar from './UserSidebar.vue';
import UserHeader from './UserHeader.vue';
import UserBreadcrumb from './UserBreadcrumb.vue';

const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(true);
const mobileSidebar = ref(false);

// Generate breadcrumbs based on current route
const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean);
  const crumbs = [];
  
  if (pathSegments.length === 0) {
    crumbs.push({ label: 'Dashboard', to: '/user/dashboard' });
  } else {
    // Add home
    crumbs.push({ label: 'Home', to: '/user/dashboard' });
    
    // Add route-specific breadcrumbs
    if (pathSegments[0] === 'user') {
      if (pathSegments[1] === 'dashboard') {
        crumbs.push({ label: 'Dashboard', to: null });
      } else if (pathSegments[1] === 'quizzes') {
        crumbs.push({ label: 'My Quizzes', to: null });
      } else if (pathSegments[1] === 'stats') {
        crumbs.push({ label: 'Personal Stats', to: null });
      } else if (pathSegments[1] === 'leaderboard') {
        crumbs.push({ label: 'Leaderboard', to: null });
      } else if (pathSegments[1] === 'profile') {
        crumbs.push({ label: 'Profile', to: null });
      }
    }
  }
  
  return crumbs;
});

function toggleSidebar() {
  mobileSidebar.value = !mobileSidebar.value;
}

function onLogout() {
  authStore.logout();
  // Router will handle redirect to login
}

// Load sidebar preference from localStorage
onMounted(() => {
  const savedState = localStorage.getItem('user_sidebar_collapsed');
  if (savedState === 'true') {
    sidebarOpen.value = false;
  }
});

// Watch sidebar state changes and save preference
watch(sidebarOpen, (newState) => {
  localStorage.setItem('user_sidebar_collapsed', (!newState).toString());
});
</script>

<style scoped>
.user-container {
  /* Custom styles for user interface */
}

/* Responsive sidebar behavior */
@media (max-width: 1024px) {
  .sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar-closed {
    transform: translateX(-100%);
  }
}
</style>
