<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <h3 class="text-sm font-medium text-gray-500 mb-3">Recent Activity</h3>
    
    <div v-if="activities.length === 0" class="text-center py-4">
      <div class="text-gray-400">
        <svg class="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">No recent activity</p>
      </div>
    </div>
    
    <div v-else class="space-y-3">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start space-x-3"
      >
        <!-- Activity Icon -->
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="getActivityIconClasses(activity.type)"
          >
            <svg v-if="activity.type === 'quiz_completed'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="activity.type === 'quiz_started'" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <!-- Activity Content -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-900">
            <span v-if="activity.type === 'quiz_completed'">
              Completed <strong>{{ activity.quizName }}</strong>
            </span>
            <span v-else-if="activity.type === 'quiz_started'">
              Started <strong>{{ activity.quizName }}</strong>
            </span>
            <span v-else>
              {{ activity.quizName }}
            </span>
          </div>
          
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xs text-gray-500">
              {{ formatRelativeTime(activity.date) }}
            </span>
            
            <span v-if="activity.score !== undefined" class="text-xs font-medium text-green-600">
              {{ activity.score }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- View All Link -->
    <div v-if="activities.length > 0" class="mt-4 pt-3 border-t border-gray-100">
      <button
        type="button"
        class="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
        @click="$emit('view-all')"
      >
        View all activity →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['view-all'])

// Methods
const getActivityIconClasses = (type) => {
  const classMap = {
    'quiz_completed': 'bg-green-500',
    'quiz_started': 'bg-blue-500',
    'quiz_paused': 'bg-yellow-500',
    'quiz_expired': 'bg-red-500'
  }
  return classMap[type] || 'bg-gray-500'
}

const formatRelativeTime = (date) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffMs = now - activityDate
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return activityDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>
