<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <h3 class="text-sm font-medium text-gray-500 mb-4">Question Navigator</h3>
    
    <!-- Question Grid -->
    <div class="grid grid-cols-5 gap-2 mb-4">
      <button
        v-for="(question, index) in questions"
        :key="question.id"
        type="button"
        class="w-8 h-8 text-xs font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        :class="getQuestionButtonClasses(index, question)"
        @click="$emit('question-selected', index)"
      >
        {{ index + 1 }}
      </button>
    </div>

    <!-- Legend -->
    <div class="space-y-2 text-xs">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-blue-500 rounded"></div>
        <span class="text-gray-600">Current</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-green-500 rounded"></div>
        <span class="text-gray-600">Answered</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-orange-500 rounded"></div>
        <span class="text-gray-600">Flagged</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-gray-300 rounded"></div>
        <span class="text-gray-600">Unanswered</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
      <button
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
        @click="$emit('review-flagged')"
      >
        <div class="flex items-center space-x-2">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>Review Flagged ({{ flaggedQuestions.size }})</span>
        </div>
      </button>
      
      <button
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
        @click="goToFirstUnanswered"
      >
        <div class="flex items-center space-x-2">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>First Unanswered</span>
        </div>
      </button>
    </div>

    <!-- Progress Summary -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ answeredCount }}</div>
        <div class="text-xs text-gray-500">Answered</div>
      </div>
      
      <div class="mt-2 text-center">
        <div class="text-sm text-gray-600">
          {{ questions.length - answeredCount }} remaining
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(answeredCount / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  userAnswers: {
    type: Object,
    default: () => ({})
  },
  flaggedQuestions: {
    type: Set,
    default: () => new Set()
  }
})

// Emits
const emit = defineEmits(['question-selected', 'review-flagged'])

// Computed properties
const answeredCount = computed(() => {
  return Object.keys(props.userAnswers).length
})

// Methods
const getQuestionButtonClasses = (index, question) => {
  const isCurrent = index === props.currentIndex
  const isAnswered = props.userAnswers[question.id] !== undefined
  const isFlagged = props.flaggedQuestions.has(question.id)
  
  if (isCurrent) {
    return 'bg-blue-500 text-white'
  } else if (isFlagged) {
    return 'bg-orange-500 text-white'
  } else if (isAnswered) {
    return 'bg-green-500 text-white'
  } else {
    return 'bg-gray-300 text-gray-700 hover:bg-gray-400'
  }
}

const goToFirstUnanswered = () => {
  const firstUnansweredIndex = props.questions.findIndex(q => 
    props.userAnswers[q.id] === undefined
  )
  
  if (firstUnansweredIndex !== -1) {
    emit('question-selected', firstUnansweredIndex)
  }
}
</script>
