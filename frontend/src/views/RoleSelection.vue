<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xl font-bold">
                {{ userInitials }}
              </span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                Welcome back, {{ user?.name || user?.email || 'Teacher' }}! 👋
              </h1>
              <p class="text-gray-600">Choose your interface to continue</p>
            </div>
          </div>
          <button
            @click="logout"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Role Selection Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Admin Interface Card -->
        <RoleCard
          :title="'Admin Dashboard'"
          :description="'Manage quizzes, users, and view system analytics'"
          :icon="'admin'"
          :features="adminFeatures"
          :button-text="'Enter Admin Mode'"
          :last-accessed="lastAdminAccess"
          @click="enterAdminMode"
          class="transform hover:scale-105 transition-transform duration-200"
        />

        <!-- User Interface Card -->
        <RoleCard
          :title="'Student Dashboard'"
          :description="'Take quizzes and track your personal progress'"
          :icon="'student'"
          :features="userFeatures"
          :button-text="'Enter Student Mode'"
          :last-accessed="lastUserAccess"
          @click="enterUserMode"
          class="transform hover:scale-105 transition-transform duration-200"
        />
      </div>

      <!-- Interface Preferences -->
      <InterfacePreferences
        v-model:remember-choice="preferences.rememberChoice"
        v-model:quick-switch="preferences.quickSwitch"
        :interface-stats="interfaceStats"
      />

      <!-- Recent Activity -->
      <RecentActivity
        :activities="recentActivities"
        @quick-access="handleQuickAccess"
      />

      <!-- Quick Actions -->
      <QuickActions
        :actions="quickActions"
        @action-click="handleQuickAction"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import RoleCard from '../components/RoleCard.vue';
import InterfacePreferences from '../components/InterfacePreferences.vue';
import RecentActivity from '../components/RecentActivity.vue';
import QuickActions from '../components/QuickActions.vue';

const router = useRouter();
const authStore = useAuthStore();

// User data
const user = computed(() => authStore.user);
const userInitials = computed(() => {
  if (!user.value?.name) return 'T';
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

// Preferences
const preferences = ref({
  rememberChoice: true,
  quickSwitch: false
});

// Interface features
const adminFeatures = [
  'Create & edit quizzes',
  'Manage students',
  'View all statistics',
  'System configuration',
  'User management'
];

const userFeatures = [
  'Take available quizzes',
  'View your results',
  'Compare with peers',
  'Track progress',
  'Personal analytics'
];

// Mock data for last accessed (replace with real data)
const lastAdminAccess = ref('2 hours ago');
const lastUserAccess = ref('1 day ago');

// Interface usage statistics
const interfaceStats = ref({
  admin: { usage: 65, lastWeek: 12 },
  user: { usage: 35, lastWeek: 8 }
});

// Recent activities
const recentActivities = ref([
  { type: 'admin', action: 'Created new quiz', time: '2 hours ago', icon: 'quiz' },
  { type: 'user', action: 'Completed Excel quiz', time: '1 day ago', icon: 'check' },
  { type: 'admin', action: 'Reviewed submissions', time: '3 days ago', icon: 'review' }
]);

// Quick actions
const quickActions = ref([
  { name: 'Create Quiz', icon: 'plus', action: 'create-quiz', interface: 'admin' },
  { name: 'Take Quiz', icon: 'play', action: 'take-quiz', interface: 'user' },
  { name: 'View Stats', icon: 'chart', action: 'view-stats', interface: 'user' },
  { name: 'Manage Users', icon: 'users', action: 'manage-users', interface: 'admin' }
]);

// Methods
const enterAdminMode = async () => {
  try {
    await authStore.switchInterface('admin');
    router.push('/admin/dashboard');
  } catch (error) {
    console.error('Failed to switch to admin mode:', error);
  }
};

const enterUserMode = async () => {
  try {
    await authStore.switchInterface('user');
    router.push('/user/dashboard');
  } catch (error) {
    console.error('Failed to switch to user mode:', error);
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const handleQuickAccess = (activity) => {
  if (activity.type === 'admin') {
    enterAdminMode();
  } else {
    enterUserMode();
  }
};

const handleQuickAction = (action) => {
  if (action.interface === 'admin') {
    enterAdminMode();
  } else {
    enterUserMode();
  }
};

// Load user preferences on mount
onMounted(() => {
  const savedPreferences = localStorage.getItem('teacher_preferences');
  if (savedPreferences) {
    try {
      const parsed = JSON.parse(savedPreferences);
      preferences.value = { ...preferences.value, ...parsed };
    } catch {}
  }
});

// Watch preferences changes
watch(preferences, (newPrefs) => {
  try {
    localStorage.setItem('teacher_preferences', JSON.stringify(newPrefs));
  } catch {}
}, { deep: true });
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
}
</style>
