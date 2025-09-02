<template>
  <div class="bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
          </svg>
        </div>
        <span class="ml-3 text-lg font-semibold text-gray-900">Student Portal</span>
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="p-4 border-b border-gray-200">
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900">{{ userStats.totalQuizzes }}</div>
        <div class="text-sm text-gray-600">Quizzes Completed</div>
      </div>
      <div class="mt-3 flex justify-between text-sm">
        <div class="text-center">
          <div class="font-semibold text-green-600">{{ userStats.averageScore }}%</div>
          <div class="text-gray-500">Avg Score</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-blue-600">{{ userStats.currentRank }}</div>
          <div class="text-gray-500">Rank</div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-4 space-y-2">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.to"
        :class="[
          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
          isActive(item.to)
            ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <component 
          :is="item.icon" 
          :class="[
            'mr-3 h-5 w-5 flex-shrink-0',
            isActive(item.to) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
          ]"
        />
        {{ item.name }}
        <span v-if="item.badge" class="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {{ item.badge }}
        </span>
      </router-link>
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-gray-200">
      <!-- Interface Switcher for Teachers -->
      <div v-if="authStore.isTeacher" class="mb-3">
        <button
          @click="switchToAdmin"
          class="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Switch to Admin
        </button>
      </div>

      <!-- User Profile -->
      <div class="flex items-center">
        <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-medium">{{ userInitials }}</span>
        </div>
        <div class="ml-3 flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name || user?.email }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ user?.role }}</p>
        </div>
        <button
          @click="logout"
          class="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrophyIcon,
  UserIcon,
  CogIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const userInitials = computed(() => {
  if (!user.value?.name) return 'U';
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

// Mock user stats - replace with real data
const userStats = computed(() => ({
  totalQuizzes: 12,
  averageScore: 85,
  currentRank: 3
}));

const navigationItems = [
  { name: 'Dashboard', to: '/user/dashboard', icon: HomeIcon },
  { name: 'My Quizzes', to: '/user/quizzes', icon: DocumentTextIcon, badge: 3 },
  { name: 'Personal Stats', to: '/user/stats', icon: ChartBarIcon },
  { name: 'Leaderboard', to: '/user/leaderboard', icon: TrophyIcon },
  { name: 'Profile Settings', to: '/user/profile', icon: UserIcon },
  { name: 'Help & Support', to: '/user/help', icon: CogIcon }
];

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};

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
</script>

<style scoped>
/* Custom scrollbar for sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
