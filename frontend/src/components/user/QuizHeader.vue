<template>
  <div class="bg-white shadow-sm border-b sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      
      <div class="flex items-center justify-between py-4">
        <!-- Quiz Info -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-900">
              Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
            </span>
          </div>
          
          <div class="hidden sm:block">
            <h1 class="text-lg font-semibold text-gray-900">{{ quiz?.title }}</h1>
          </div>
        </div>
        
        <!-- Timer and Actions -->
        <div class="flex items-center space-x-4">
          <!-- Timer -->
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <TimerWidget :time-remaining="timeRemaining" />
          </div>
          
          <!-- Flag Question Button -->
          <button
            type="button"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            @click="$emit('flag-question')"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Flag
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TimerWidget from './TimerWidget.vue'

// Props
defineProps({
  quiz: {
    type: Object,
    default: null
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  timeRemaining: {
    type: Number,
    default: 0
  },
  progressPercentage: {
    type: Number,
    default: 0
  }
})

// Emits
defineEmits(['flag-question'])
</script>
