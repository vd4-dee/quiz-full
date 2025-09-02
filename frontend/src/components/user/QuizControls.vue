<template>
  <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
    <div class="flex items-center justify-between">
      <!-- Left Side - Navigation -->
      <div class="flex items-center space-x-3">
        <button
          type="button"
          :disabled="!canGoPrevious"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          @click="$emit('previous-question')"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        <button
          type="button"
          :disabled="!canGoNext"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          @click="$emit('next-question')"
        >
          Next
          <svg class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Center - Progress Info -->
      <div class="hidden sm:block text-center">
        <div class="text-sm text-gray-600">
          <span class="font-medium text-gray-900">{{ answeredCount }}</span> of {{ totalQuestions }} answered
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ flaggedCount }} flagged for review
        </div>
      </div>

      <!-- Right Side - Submit -->
      <div class="flex items-center space-x-3">
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="$emit('submit-quiz')"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ isLastQuestion ? 'Submit Quiz' : 'Review & Submit' }}
        </button>
      </div>
    </div>

    <!-- Mobile Progress Bar -->
    <div class="sm:hidden mt-4">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>{{ answeredCount }} of {{ totalQuestions }} answered</span>
        <span>{{ flaggedCount }} flagged</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(answeredCount / totalQuestions) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  canGoPrevious: {
    type: Boolean,
    default: false
  },
  canGoNext: {
    type: Boolean,
    default: false
  },
  isLastQuestion: {
    type: Boolean,
    default: false
  },
  answeredCount: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  flaggedCount: {
    type: Number,
    default: 0
  }
})

// Emits
defineEmits(['previous-question', 'next-question', 'submit-quiz'])
</script>
