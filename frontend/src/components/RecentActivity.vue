<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    
    <div class="space-y-4">
      <div 
        v-for="activity in activities" 
        :key="`${activity.type}-${activity.action}-${activity.time}`"
        class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        @click="$emit('quick-access', activity)"
      >
        <!-- Activity Icon -->
        <div class="flex-shrink-0 mr-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getIconClasses(activity.type)">
            <svg v-if="activity.icon === 'quiz'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <svg v-else-if="activity.icon === 'check'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="activity.icon === 'review'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Activity Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ activity.action }}
            </p>
            <span class="text-xs text-gray-500">{{ activity.time }}</span>
          </div>
          <div class="flex items-center mt-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getBadgeClasses(activity.type)">
              {{ getInterfaceLabel(activity.type) }}
            </span>
          </div>
        </div>

        <!-- Quick Access Arrow -->
        <div class="flex-shrink-0 ml-4">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- No Activities State -->
    <div v-if="activities.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
      <p class="mt-1 text-sm text-gray-500">Your recent activities will appear here</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => []
  }
});

defineEmits(['quick-access']);

// Helper functions
const getIconClasses = (type) => {
  if (type === 'admin') {
    return 'bg-gradient-to-br from-purple-500 to-indigo-600';
  } else {
    return 'bg-gradient-to-br from-green-500 to-blue-600';
  }
};

const getBadgeClasses = (type) => {
  if (type === 'admin') {
    return 'bg-purple-100 text-purple-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

const getInterfaceLabel = (type) => {
  if (type === 'admin') {
    return 'Admin';
  } else {
    return 'Student';
  }
};
</script>

<style scoped>
/* Hover effects */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
}
</style>
