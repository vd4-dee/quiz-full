<template>
  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
    <!-- Quiz Header -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ quiz.title }}</h3>
          <p v-if="quiz.description" class="text-sm text-gray-600 line-clamp-2">
            {{ quiz.description }}
          </p>
        </div>
        
        <!-- Quiz Status Badge -->
        <div class="ml-3">
          <QuizStatusBadge :status="quizStatus" />
        </div>
      </div>
    </div>

    <!-- Quiz Details -->
    <div class="p-4">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <!-- Questions Count -->
        <div class="flex items-center">
          <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-gray-600">{{ quiz.questions_list?.length || 0 }} questions</span>
        </div>

        <!-- Duration -->
        <div class="flex items-center">
          <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-gray-600">{{ quiz.duration_minutes }} min</span>
        </div>

        <!-- Category -->
        <div class="flex items-center">
          <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="text-sm text-gray-600">{{ quiz.category }}</span>
        </div>

        <!-- Difficulty Level -->
        <div class="flex items-center">
          <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <DifficultyBadge :level="quiz.level" />
        </div>
      </div>

      <!-- Previous Attempt Score -->
      <div v-if="previousAttempt" class="mb-4 p-3 bg-blue-50 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm text-blue-700">Previous attempt:</span>
          <span class="text-sm font-medium text-blue-900">{{ previousAttempt.score }}%</span>
        </div>
        <div class="text-xs text-blue-600 mt-1">
          {{ formatDate(previousAttempt.completed_at) }}
        </div>
      </div>

      <!-- Deadline Warning -->
      <div v-if="isDeadlineApproaching" class="mb-4 p-3 bg-yellow-50 rounded-lg">
        <div class="flex items-center">
          <svg class="h-4 w-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-yellow-800">
            Deadline: {{ formatDate(quiz.end_date) }}
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-center">
        <button
          v-if="quizStatus === 'available'"
          type="button"
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="$emit('start-quiz', quiz.id)"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Quiz
        </button>

        <button
          v-else-if="quizStatus === 'in-progress'"
          type="button"
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
          @click="$emit('continue-quiz', quiz.id)"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Continue Quiz
        </button>

        <button
          v-else-if="quizStatus === 'completed'"
          type="button"
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="$emit('review-results', quiz.id)"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Review Results
        </button>

        <button
          v-else
          type="button"
          disabled
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
        >
          {{ getDisabledButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QuizStatusBadge from './QuizStatusBadge.vue'
import DifficultyBadge from './DifficultyBadge.vue'

// Props
const props = defineProps({
  quiz: {
    type: Object,
    required: true
  },
  userSubmissions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['start-quiz', 'continue-quiz', 'review-results'])

// Computed properties
const previousAttempt = computed(() => {
  return props.userSubmissions.find(s => s.quiz === props.quiz.id)
})

const quizStatus = computed(() => {
  if (!previousAttempt.value) return 'available'
  if (previousAttempt.value.completed_at) return 'completed'
  return 'in-progress'
})

const isDeadlineApproaching = computed(() => {
  if (!props.quiz.end_date) return false
  
  const now = new Date()
  const deadline = new Date(props.quiz.end_date)
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  
  return diffDays <= 3 && diffDays > 0
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDisabledButtonText = () => {
  if (props.quiz.end_date && new Date(props.quiz.end_date) < new Date()) {
    return 'Expired'
  }
  return 'Unavailable'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
