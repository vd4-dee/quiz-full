<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="action in actions"
        :key="action.action"
        @click="$emit('action-click', action)"
        class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 cursor-pointer group"
      >
        <!-- Action Icon -->
        <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3" :class="getIconClasses(action.interface)">
          <svg v-if="action.icon === 'plus'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <svg v-else-if="action.icon === 'play'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="action.icon === 'chart'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <svg v-else-if="action.icon === 'users'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Action Name -->
        <span class="text-sm font-medium text-gray-900 text-center group-hover:text-gray-700">
          {{ action.name }}
        </span>

        <!-- Interface Badge -->
        <span class="text-xs text-gray-500 mt-1">
          {{ getInterfaceLabel(action.interface) }}
        </span>
      </button>
    </div>

    <!-- No Actions State -->
    <div v-if="actions.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No quick actions available</h3>
      <p class="mt-1 text-sm text-gray-500">Quick actions will appear here based on your role</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  actions: {
    type: Array,
    required: true,
    default: () => []
  }
});

defineEmits(['action-click']);

// Helper functions
const getIconClasses = (targetInterface) => {
  if (targetInterface === 'admin') {
    return 'bg-gradient-to-br from-purple-500 to-indigo-600';
  } else {
    return 'bg-gradient-to-br from-green-500 to-blue-600';
  }
};

const getInterfaceLabel = (targetInterface) => {
  if (targetInterface === 'admin') {
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
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scale effect on hover */
.hover\:scale-105:hover {
  transform: scale(1.05);
}
</style>
