<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Review Quiz Before Submission</h2>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          @click="$emit('close')"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Quiz Summary -->
      <div class="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-2">{{ quiz?.title }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-blue-700 font-medium">Questions:</span>
            <span class="text-blue-900 ml-1">{{ questions.length }}</span>
          </div>
          <div>
            <span class="text-blue-700 font-medium">Answered:</span>
            <span class="text-blue-900 ml-1">{{ answeredCount }}</span>
          </div>
          <div>
            <span class="text-blue-700 font-medium">Flagged:</span>
            <span class="text-blue-900 ml-1">{{ flaggedQuestions.size }}</span>
          </div>
          <div>
            <span class="text-blue-700 font-medium">Time:</span>
            <span class="text-blue-900 ml-1">{{ formatTime(timeTaken) }}</span>
          </div>
        </div>
      </div>

      <!-- Answer Summary -->
      <div class="space-y-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Answer Summary</h3>
        
        <!-- Answered Questions -->
        <div v-if="answeredCount > 0" class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="font-medium text-green-800">{{ answeredCount }} Questions Answered</span>
          </div>
          <div class="text-sm text-green-700">
            You have answered {{ answeredCount }} out of {{ questions.length }} questions.
          </div>
        </div>

        <!-- Unanswered Questions -->
        <div v-if="unansweredCount > 0" class="bg-yellow-50 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <svg class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span class="font-medium text-yellow-800">{{ unansweredCount }} Questions Unanswered</span>
          </div>
          <div class="text-sm text-yellow-700">
            You have {{ unansweredCount }} unanswered questions. You can still go back and answer them.
          </div>
        </div>

        <!-- Flagged Questions -->
        <div v-if="flaggedQuestions.size > 0" class="bg-orange-50 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <svg class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span class="font-medium text-orange-800">{{ flaggedQuestions.size }} Questions Flagged</span>
          </div>
          <div class="text-sm text-orange-700">
            You have flagged {{ flaggedQuestions.size }} questions for review.
          </div>
        </div>
      </div>

      <!-- Unanswered Questions List -->
      <div v-if="unansweredCount > 0" class="mb-6">
        <h4 class="text-md font-medium text-gray-900 mb-3">Unanswered Questions:</h4>
        <div class="space-y-2">
          <div
            v-for="question in unansweredQuestions"
            :key="question.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm text-gray-700">
              Question {{ getQuestionNumber(question.id) }}: {{ truncateText(question.question, 60) }}
            </span>
            <button
              type="button"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              @click="goToQuestion(question.id)"
            >
              Go to Question
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="$emit('close')"
        >
          Continue Quiz
        </button>
        
        <button
          type="button"
          class="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="$emit('submit-quiz')"
        >
          Submit Quiz
        </button>
      </div>

      <!-- Warning -->
      <div class="mt-4 p-3 bg-red-50 rounded-lg">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span class="text-sm text-red-800 font-medium">Important:</span>
        </div>
        <p class="text-sm text-red-700 mt-1">
          Once you submit this quiz, you cannot change your answers. Make sure you're satisfied with all your responses.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  quiz: {
    type: Object,
    default: null
  },
  questions: {
    type: Array,
    default: () => []
  },
  userAnswers: {
    type: Object,
    default: () => ({})
  },
  flaggedQuestions: {
    type: Set,
    default: () => new Set()
  },
  timeTaken: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['close', 'submit-quiz'])

// Computed properties
const answeredCount = computed(() => {
  return Object.keys(props.userAnswers).length
})

const unansweredCount = computed(() => {
  return props.questions.length - answeredCount.value
})

const unansweredQuestions = computed(() => {
  return props.questions.filter(q => props.userAnswers[q.id] === undefined)
})

// Methods
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getQuestionNumber = (questionId) => {
  const index = props.questions.findIndex(q => q.id === questionId)
  return index + 1
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const goToQuestion = (questionId) => {
  // This would need to be handled by the parent component
  // For now, we'll just close the review screen
  emit('close')
}
</script>
