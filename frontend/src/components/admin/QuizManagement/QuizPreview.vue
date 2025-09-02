<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Quiz Preview</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Student view simulation - {{ quizData.title }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Quiz Instructions -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">Quiz Instructions</h3>
          <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p><strong>Title:</strong> {{ quizData.title }}</p>
            <p><strong>Description:</strong> {{ quizData.description || 'No description provided' }}</p>
            <p><strong>Total Questions:</strong> {{ questions.length }}</p>
            <p><strong>Total Points:</strong> {{ totalPoints }}</p>
            <p v-if="quizData.timeLimit"><strong>Time Limit:</strong> {{ quizData.timeLimit }} minutes</p>
            <p v-if="quizData.passingScore"><strong>Passing Score:</strong> {{ quizData.passingScore }}%</p>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div class="p-6 space-y-6">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
        >
          <!-- Question Header -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">
              Question {{ index + 1 }} of {{ questions.length }}
            </h4>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ question.points }} points
              </span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  getTypeBadgeClass(question.type)
                ]"
              >
                {{ formatQuestionType(question.type) }}
              </span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  getLevelBadgeClass(question.level)
                ]"
              >
                {{ formatLevel(question.level) }}
              </span>
            </div>
          </div>

          <!-- Question Text -->
          <div class="mb-4">
            <p class="text-gray-900 dark:text-white">{{ question.question }}</p>
          </div>

          <!-- Question Options -->
          <div v-if="question.type === 'multiple_choice'" class="space-y-2">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <input
                type="radio"
                :name="`question_${question.id}`"
                :value="optionIndex"
                :id="`option_${question.id}_${optionIndex}`"
                class="text-blue-600 focus:ring-blue-500"
                disabled
              />
              <label
                :for="`option_${question.id}_${optionIndex}`"
                class="flex-1 text-gray-900 dark:text-white cursor-pointer"
              >
                {{ option }}
              </label>
            </div>
          </div>

          <!-- True/False Options -->
          <div v-if="question.type === 'true_false'" class="space-y-2">
            <label class="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                :name="`question_${question.id}`"
                value="true"
                :id="`option_${question.id}_true`"
                class="text-blue-600 focus:ring-blue-500"
                disabled
              />
              <span class="text-gray-900 dark:text-white">True</span>
            </label>
            
            <label class="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                :name="`question_${question.id}`"
                value="false"
                :id="`option_${question.id}_false`"
                class="text-blue-600 focus:ring-blue-500"
                disabled
              />
              <span class="text-gray-900 dark:text-white">False</span>
            </label>
          </div>

          <!-- Short Answer Input -->
          <div v-if="question.type === 'short_answer'" class="space-y-2">
            <textarea
              placeholder="Enter your answer here..."
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled
            ></textarea>
          </div>

          <!-- Essay Input -->
          <div v-if="question.type === 'essay'" class="space-y-2">
            <textarea
              placeholder="Write your essay answer here..."
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled
            ></textarea>
          </div>

          <!-- Question Tags -->
          <div v-if="question.tags && question.tags.length > 0" class="mt-3">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in question.tags"
                :key="tag"
                class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Summary -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">Quiz Summary</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-gray-600 dark:text-gray-400">Total Questions</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ questions.length }}</p>
            </div>
            
            <div>
              <p class="text-gray-600 dark:text-gray-400">Total Points</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ totalPoints }}</p>
            </div>
            
            <div>
              <p class="text-gray-600 dark:text-gray-400">Estimated Time</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ estimatedTime }} minutes</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Question Distribution</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600 dark:text-gray-400">By Type:</p>
                <div class="space-y-1">
                  <div v-for="(count, type) in questionTypeCount" :key="type" class="flex justify-between">
                    <span>{{ formatQuestionType(type) }}:</span>
                    <span class="font-medium">{{ count }}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p class="text-gray-600 dark:text-gray-400">By Difficulty:</p>
                <div class="space-y-1">
                  <div v-for="(count, level) in questionLevelCount" :key="level" class="flex justify-between">
                    <span>{{ formatLevel(level) }}:</span>
                    <span class="font-medium">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close Preview
          </button>
          
          <button
            @click="exportQuiz"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  quizData: {
    type: Object,
    required: true
  },
  questions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'export'])

// Computed
const totalPoints = computed(() => {
  return props.questions.reduce((sum, q) => sum + q.points, 0)
})

const estimatedTime = computed(() => {
  // Estimate 1-2 minutes per question based on difficulty
  const timePerQuestion = props.questions.reduce((sum, q) => {
    const baseTime = q.level === 'easy' ? 1 : q.level === 'medium' ? 1.5 : 2
    return sum + baseTime
  }, 0)
  return Math.round(timePerQuestion)
})

const questionTypeCount = computed(() => {
  const counts = {}
  props.questions.forEach(q => {
    counts[q.type] = (counts[q.type] || 0) + 1
  })
  return counts
})

const questionLevelCount = computed(() => {
  const counts = {}
  props.questions.forEach(q => {
    counts[q.level] = (counts[q.level] || 0) + 1
  })
  return counts
})

// Methods
const formatQuestionType = (type) => {
  const types = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    essay: 'Essay'
  }
  return types[type] || type
}

const formatLevel = (level) => {
  const levels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  }
  return levels[level] || level
}

const getTypeBadgeClass = (type) => {
  const classes = {
    multiple_choice: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    true_false: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    short_answer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    essay: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const getLevelBadgeClass = (level) => {
  const classes = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const exportQuiz = () => {
  const quizData = {
    title: props.quizData.title,
    description: props.quizData.description,
    questions: props.questions,
    totalPoints: totalPoints.value,
    estimatedTime: estimatedTime.value
  }
  
  emit('export', quizData)
}
</script>
