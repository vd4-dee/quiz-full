<template>
  <aside class="w-64 bg-white border-r border-gray-200 text-gray-800 h-full flex flex-col flex-shrink-0">
    <div class="flex items-center h-14 sm:h-16 px-3 sm:px-4 font-bold text-base sm:text-lg border-b border-gray-200">
      <span class="text-gray-900">Quiz Admin</span>
    </div>
    <nav class="flex-1 py-3 sm:py-4">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.label">
          <router-link :to="item.to" class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg mx-2 transition-colors duration-200 group">
            <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 flex-shrink-0 !important" style="width: 1rem; height: 1rem; min-width: 1rem; min-height: 1rem;" />
            <span class="truncate">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="p-3 sm:p-4 text-xs text-gray-500 border-t border-gray-200">
      &copy; 2025 Quiz System
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { HomeIcon, UsersIcon, BookOpenIcon, ListBulletIcon, ChartBarIcon, Cog6ToothIcon, CogIcon } from '@heroicons/vue/24/outline';

const navItems = ref([
  { label: 'Dashboard', to: '/admin/dashboard', icon: HomeIcon },
  { label: 'User Management', to: '/admin/users', icon: UsersIcon },
  { label: 'Question Bank', to: '/admin/questions', icon: BookOpenIcon },
  { label: 'Quiz Management', to: '/admin/quizzes', icon: ListBulletIcon },
  { label: 'Submissions', to: '/admin/submissions', icon: ListBulletIcon },
  { label: 'Analytics', to: '/admin/analytics', icon: ChartBarIcon },
  { label: 'Production', to: '/admin/production', icon: CogIcon },
  { label: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
]);
</script>

<style scoped>
.router-link-exact-active {
  background-color: rgba(59, 130, 246, 0.1);
  color: rgb(37, 99, 235);
  font-weight: 600;
}

.router-link-exact-active svg {
  color: rgb(37, 99, 235);
}

/* Force icon sizing to prevent scaling issues */
svg {
  width: 1rem !important;
  height: 1rem !important;
  min-width: 1rem !important;
  min-height: 1rem !important;
}

@media (min-width: 640px) {
  svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
    min-width: 1.25rem !important;
    min-height: 1.25rem !important;
  }
}
</style>
